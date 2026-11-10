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
import { cleanGraph } from './model/model.js'
import { EDGE_KINDS, FAMILIES, ELEMENTS, TLP } from './model/vocabulary.js'
import { renderOptions } from './render/styles.js'
import { nodeDetails, edgeDetails, nodeTooltip, edgeTooltip, groupTooltipExtra } from './render/details.js'
import { VIEWS } from './views.js'

export { VIEWS }

/** Parse a document into the common model, for one view. */
export function buildModel(json, format, view) {
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
 * @returns {Promise<{graph, model, stats, destroy}>}
 */
export async function mountGraph(container, jsonText, format, opts = {}) {
    const view = VIEWS[opts.view] ?? VIEWS.structure
    const json = typeof jsonText === 'string' ? JSON.parse(jsonText) : jsonText
    const model = buildModel(json, format, view)
    const dark = opts.dark ?? document.body.classList.contains('dark')
        ?? document.documentElement.classList.contains('dark-mode')

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
                nodeHeaderMap: {
                    title: (node) => node.getData()?.label ?? String(node.id),
                    subtitle: (node) => node.getData()?.typeLabel ?? '',
                },
                edgeHeaderMap: {
                    title: (edge) => edge.getData()?.relation || 'Link',
                    subtitle: (edge) => EDGE_KINDS[edge.getData()?.kind]?.label ?? '',
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
                typeLabel: (type, count) => `${count} × ${String(type).replace(/^(attr|obj|stix|galaxy|tag):/, '')}`,
                openConfirmAbove: 150,
            },
            ...(opts.ui ?? {}),
        },
        ...(opts.extra ?? {}),
    }

    const graph = new window.Pivotick(container, { nodes: model.nodes, edges: model.edges }, options)

    // Edge layers the view keeps off at first (embedded refs, pattern links…).
    const on = Object.keys(EDGE_KINDS).filter(k => (view.edgeKinds ?? {})[k] ?? EDGE_KINDS[k].on)
    const present = new Set(model.edges.map(e => e.data.kind))
    if (on.filter(k => present.has(k)).length < present.size) {
        graph.queryEngine?.setEdgeFilter?.('kind', { value: on, matchMode: 'exact' })
    }

    return {
        graph, model, view,
        stats: { nodes: model.nodes.length, edges: model.edges.length },
        destroy: () => { try { graph.destroy() } catch { /* already gone */ } },
    }
}

export { FAMILIES, ELEMENTS, TLP }
