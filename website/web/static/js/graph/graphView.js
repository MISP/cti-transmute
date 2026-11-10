// ─────────────────────────────────────────────────────────────────────────────
//  Graph view — mounts one MISP or STIX document as a Pivotick graph.
//
//    mountGraph(container, jsonText, format, { view, dark })
//
//  It parses (model/), applies the chosen view (views.js: which nodes and
//  edge layers, which layout, which Simplify rules), and wires the render
//  layer (render/), the legend, the filter panel and the detail panel.
//
//  This module is used by the Conversion detail page (conversionGraph.js)
//  and by the graph lab (tests/web/graph_lab/).
// ─────────────────────────────────────────────────────────────────────────────

import { mispToGraph } from './model/mispToGraph.js'
import { stixToGraph } from './model/stixToGraph.js'
import { cleanGraph, makeEdge } from './model/model.js'
import { EDGE_KINDS, FAMILIES, ELEMENTS, TLP } from './model/vocabulary.js'
import { renderOptions, edgeLabelText } from './render/styles.js'
import { nodeDetails, edgeDetails, nodeTooltip, edgeTooltip, groupTooltipExtra } from './render/details.js'
import { VIEWS } from './views.js'
import { localPivots } from './pivots.js'
import { normaliseNodeTypes, textCell } from './graphSafety.js'

export { VIEWS }

/**
 * Both sides of a Conversion in one graph, each MISP element linked to what it
 * became in STIX. misp-stix keeps the MISP UUID as the STIX id's suffix
 * (`indicator--<attribute uuid>`, `grouping--<event uuid>`), so the link is
 * an exact match, never a guess on values.
 */
export function buildCompareModel(mispJson, stixJson) {
    const misp = cleanGraph(mispToGraph(mispJson))
    const stix = cleanGraph(stixToGraph(stixJson))
    const byUuid = new Map()
    for (const n of misp.nodes) if (n.data.uuid) byUuid.set(String(n.data.uuid).toLowerCase(), n.id)
    const origin = []
    for (const n of stix.nodes) {
        const suffix = String(n.data.uuid ?? '').split('--')[1]?.toLowerCase()
        const from = suffix && byUuid.get(suffix)
        if (from) origin.push(makeEdge(from, n.id, 'origin', { relation: 'became' }))
    }
    // Side badge (M / S) only matters when both sides share the canvas.
    for (const n of [...misp.nodes, ...stix.nodes]) n.data.showSide = true
    return { nodes: [...misp.nodes, ...stix.nodes], edges: [...misp.edges, ...stix.edges, ...origin] }
}

/** Parse a document into the common model, for one view. */
export function buildModel(json, format, view) {
    if (format === 'compare') return view.transform ? view.transform(buildCompareModel(json.misp, json.stix)) : buildCompareModel(json.misp, json.stix)
    const g = format === 'misp'
        ? mispToGraph(json, { tagsAsNodes: !!view.tagsAsNodes })
        : stixToGraph(json, { observedDataAsNodes: !!view.observedDataAsNodes })
    cleanGraph(g)
    return view.transform ? view.transform(g) : g
}

const isEdge = (el) => (window.Pivotick?.Edge && el instanceof window.Pivotick.Edge) || ('from' in (el ?? {}) && 'to' in (el ?? {}))

/** Distinct values of a data key, sorted by count. */
function distinct(graph, key) {
    const counts = new Map()
    for (const n of graph.getNodes?.() ?? []) {
        const v = n.getData()?.[key]
        for (const x of Array.isArray(v) ? v : [v]) if (x !== null && x !== undefined && x !== '') counts.set(x, (counts.get(x) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v)
}

function legendSections(model) {
    const families = new Set(model.nodes.map(n => n.data.family))
    const kinds = new Set(model.edges.map(e => e.data.kind))
    return [
        {
            id: 'family', key: 'family', title: 'Family',
            entries: Object.entries(FAMILIES).filter(([k]) => families.has(k))
                .map(([k, f]) => ({ id: k, label: f.label, color: f.color })),
        },
        {
            id: 'kind', key: 'kind', title: 'Links', scope: 'edge',
            entries: Object.entries(EDGE_KINDS).filter(([k]) => kinds.has(k))
                .map(([k, e]) => ({ id: k, label: e.label, color: e.color })),
        },
    ]
}

function filterFacets() {
    return [
        { key: 'family', label: 'Family', type: 'multiselect', options: (g) => distinct(g, 'family') },
        { key: 'element', label: 'Element', type: 'multiselect', options: (g) => distinct(g, 'element') },
        { key: 'typeLabel', label: 'Type', type: 'multiselect', options: (g) => distinct(g, 'typeLabel') },
        { key: 'category', label: 'MISP category', type: 'multiselect', options: (g) => distinct(g, 'category') },
        { key: 'tlp', label: 'TLP', type: 'multiselect', options: (g) => distinct(g, 'tlp') },
        { key: 'tagNames', label: 'Tag', type: 'multiselect', options: (g) => distinct(g, 'tagNames') },
        { key: 'toIds', label: 'For detection (to_ids)', type: 'boolean' },
        { key: 'hasSightings', label: 'Sighted', type: 'boolean' },
        { key: 'value', label: 'Value', type: 'regex' },
    ]
}

/**
 * Pivotick's hover tooltip lives on <body>. In fullscreen only the fullscreen
 * element is painted, so the tooltip would exist but never show: move it into
 * the fullscreen element while it lasts, and back to <body> after.
 */
function tooltipFollowsFullscreen(graph) {
    const onChange = () => {
        const el = graph?.UIManager?.tooltip?.tooltip
        if (!el) return
        const host = document.fullscreenElement ?? document.body
        if (el.parentElement !== host) host.appendChild(el)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
}

/** How many elements the canvas shows at most before folding further. */
export const MAX_VISIBLE = 250

/**
 * Past `max` drawn elements, icons and labels stop reading as anything. Turn
 * on the stronger folds in order until the canvas fits: by type, then
 * communities (coarser and coarser). Each step is a Simplify rule the reader
 * can switch back off in the Simplify mode, and any group opens as a
 * sub-graph with a double-click.
 */
function keepWithinBudget(graph, max) {
    const s = graph.simplify
    if (!s?.summary) return
    const steps = [
        () => s.setRuleEnabled('byType', true),
        () => { s.setRuleEnabled('communities', true); s.setRuleSetting('communities', 3) },
        () => s.setRuleSetting('communities', 5),
        () => s.setRuleSetting('communities', 7),
    ]
    const shown = () => s.summary().shown
    let i = 0
    const next = () => {
        if (shown() <= max || i >= steps.length) return
        try { steps[i++]() } catch { i++ }
        // Communities are found in a worker: give it a moment before measuring again.
        setTimeout(next, 400)
    }
    next()
}

/**
 * @returns {Promise<{graph, model, stats, destroy}>}
 */
export async function mountGraph(container, jsonText, format, opts = {}) {
    const view = format === 'compare' ? VIEWS.compare : (VIEWS[opts.view] ?? VIEWS.structure)
    const json = typeof jsonText === 'string' ? JSON.parse(jsonText) : jsonText
    if (format === 'compare' && !view.compare) throw new Error('compare needs the MISP ↔ STIX view')
    const model = buildModel(json, format, view)
    const dark = opts.dark ?? document.body.classList.contains('dark')
        ?? document.documentElement.classList.contains('dark-mode')

    // The whole document, tags as nodes: what local pivots expand from.
    const full = format === 'compare' ? buildCompareModel(json.misp, json.stix)
        : cleanGraph(format === 'misp' ? mispToGraph(json, { tagsAsNodes: true }) : stixToGraph(json))
    normaliseNodeTypes(full)
    const fullById = new Map(full.nodes.map(n => [n.id, n.data]))
    for (const e of full.edges) e.data.label = edgeLabelText(e.data, fullById.get(e.from))

    container.replaceChildren()
    const big = model.nodes.length > 6000

    const options = {
        isDirected: true,
        layout: view.layout(model),
        simulation: {
            useWorker: big,
            warmupTicks: big ? 0 : 'auto',
            ...(view.simulation ?? {}),
        },
        render: renderOptions(),
        UI: {
            mode: 'full',
            theme: dark ? 'dark' : 'light',
            sidebar: { collapsed: 'auto' },
            // Read-only: a Conversion is looked at, never edited from the graph.
            editors: {
                nodeCreator: { enabled: false }, edgeCreator: { enabled: false },
                nodeEditor: { enabled: false }, edgeEditor: { enabled: false },
                deletion: { enabled: false },
            },
            notes: { enabled: false },
            // Details: our own sectioned panel instead of the key/value list.
            propertiesPanel: { enabled: false },
            mainHeader: {
                // Pivotick parses a string header as HTML: hand it text elements.
                nodeHeaderMap: {
                    title: (node) => textCell(node.getData()?.label ?? String(node.id)),
                    subtitle: (node) => textCell(node.getData()?.typeLabel ?? ''),
                },
                edgeHeaderMap: {
                    title: (edge) => textCell(edge.getData()?.relation || 'Link'),
                    subtitle: (edge) => textCell(EDGE_KINDS[edge.getData()?.kind]?.label ?? ''),
                },
            },
            extraPanels: [{
                title: 'Details',
                render: (sel) => {
                    if (!sel || Array.isArray(sel)) return null
                    return isEdge(sel) ? edgeDetails(sel) : nodeDetails(sel)
                },
            }],
            tooltip: {
                render: (el) => isEdge(el) ? edgeTooltip(el) : nodeTooltip(el),
                renderGroupExtra: (group) => groupTooltipExtra(group),
            },
            legend: { position: 'bottom-left', sections: legendSections(model) },
            filter: {
                facets: filterFacets(),
                edgeFacets: [{ key: 'kind', label: 'Links' }],
            },
            simplify: {
                rules: view.simplify(model),
                typeOf: (node) => node.getData()?.type,
                colorOf: (node) => node.getData()?.color,
                typeLabel: (type, count) => `${count} × ${String(type).replace(/^(attr|obj|stix|galaxy|tag)[:_]/, '')}`,
                openConfirmAbove: 150,
            },
            ...(opts.ui ?? {}),
        },
        pivots: localPivots(full),
        pivotIngestGrouped: true,
        ...(opts.extra ?? {}),
    }

    // Types come from the input document and serve as style keys: keep them plain.
    normaliseNodeTypes(model)
    const byId = new Map(model.nodes.map(n => [n.id, n.data]))
    for (const e of model.edges) e.data.label = edgeLabelText(e.data, byId.get(e.from))
    const graph = new window.Pivotick(container, { nodes: model.nodes, edges: model.edges }, options)

    // Edge layers the view keeps off at first (embedded refs, pattern links…).
    const on = Object.keys(EDGE_KINDS).filter(k => (view.edgeKinds ?? {})[k] ?? EDGE_KINDS[k].on)
    const present = new Set(model.edges.map(e => e.data.kind))
    if (on.filter(k => present.has(k)).length < present.size) {
        graph.queryEngine?.setEdgeFilter?.('kind', { value: on, matchMode: 'exact' })
    }

    keepWithinBudget(graph, opts.maxVisible ?? MAX_VISIBLE)
    const stopTooltipFollow = tooltipFollowsFullscreen(graph)

    return {
        graph, model, view,
        stats: { nodes: model.nodes.length, edges: model.edges.length },
        destroy: () => { stopTooltipFollow(); try { graph.destroy() } catch { /* already gone */ } },
    }
}

export { FAMILIES, ELEMENTS, TLP }
