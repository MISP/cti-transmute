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
import { renderOptions, edgeLabelText } from './render/styles.js'
import { nodeDetails, edgeDetails, nodeTooltip, edgeTooltip, groupTooltipExtra } from './render/details.js'
import { VIEWS, ruleContext } from './views.js'
import { localPivots } from './pivots.js'
import { viewModePlugin } from './render/viewMode.js'
import { openJsonOverlay } from './render/vitrine.js'
import { normaliseNodeTypes } from './graphSafety.js'

export { VIEWS }

/** Parse a document into the common model, for one view. */
export function buildModel(json, format, view) {
    const g = format === 'misp'
        ? mispToGraph(json, { tagsAsNodes: !!view.tagsAsNodes })
        : stixToGraph(json, { observedDataAsNodes: !!view.observedDataAsNodes })
    cleanGraph(g)
    return view.transform ? view.transform(g) : g
}

/** `ip-dst · Network · MISP` */
function subtitleOf(d = {}) {
    return [d.typeLabel, FAMILIES[d.family]?.label, d.side === 'misp' ? 'MISP' : d.side === 'stix' ? 'STIX' : null].filter(Boolean).join(' · ')
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
 * Place the hover card beside the node, inside the canvas. Pivotick's own
 * placement mixes viewport coordinates (the node's rect) with page ones (the
 * canvas plus window.scroll), so on a scrolled page such as a Conversion's the
 * card was pushed to the top of the canvas. Everything here is in the
 * coordinates of the card's offset parent: the page on <body>, the viewport
 * in fullscreen (where the card lives in the fullscreen element).
 */
function placeTooltip(tooltip, node, canvas) {
    const inFullscreen = !!document.fullscreenElement && document.fullscreenElement.contains(tooltip)
    const sx = inFullscreen ? 0 : window.scrollX, sy = inFullscreen ? 0 : window.scrollY
    const w = tooltip.offsetWidth, hgt = tooltip.offsetHeight, gap = 14, margin = 12
    const left = canvas.left + sx, top = canvas.top + sy
    const right = left + canvas.width, bottom = top + canvas.height
    let x = node.right + sx + gap
    if (x + w + margin > right) x = node.left + sx - w - gap          // no room on the right: go left
    x = Math.max(left + margin, Math.min(x, right - w - margin))
    let y = node.top + sy + node.height / 2 - 24                      // header level with the node
    y = Math.max(top + margin, Math.min(y, bottom - hgt - margin))    // keep it inside the canvas
    tooltip.style.left = `${Math.round(x)}px`
    tooltip.style.top = `${Math.round(y)}px`
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

/**
 * The sidebar starts closed. When something is selected while it is closed, a
 * pulsing red dot on its open button (bottom left) says the details are there.
 * Opening the sidebar, or clearing the selection, removes the dot.
 */
function pointToDetails(graph, container) {
    const gi = graph.renderer?.getGraphInteraction?.()
    if (!gi?.on) return
    const update = (selected) => {
        const button = container.querySelector('.pvt-sidebar-collapse-container')
        if (!button) return
        const closed = !!container.querySelector('.pvt-sidebar-collapsed')
        button.classList.toggle('ctx-details-waiting', selected && closed)
    }
    for (const ev of ['selectNode', 'selectEdge', 'selectNodes', 'selectEdges']) gi.on(ev, () => setTimeout(() => update(true), 0))
    for (const ev of ['unselectNode', 'unselectEdge', 'unselectNodes', 'unselectEdges']) gi.on(ev, () => update(false))
    container.addEventListener('click', (e) => {
        if (e.target.closest?.('.pvt-sidebar-collapse-container')) setTimeout(() => update(false), 0)
    })
}

/** How many elements the canvas shows at most before folding further. */
export const MAX_VISIBLE = 250
/** Past this many groups the canvas is a field of badges: fold by family. */
const MAX_GROUPS = 40

/**
 * Past `max` drawn elements (or MAX_GROUPS groups), icons and labels stop
 * reading as anything. Turn on the stronger folds in order until the canvas
 * fits: by type, then by family (Network, File & payload…). Both keep groups of one kind, so a
 * group always reads as "N × something"; communities, which mix kinds, stay
 * a manual choice in the Simplify mode. Any group opens as a sub-graph.
 */
function keepWithinBudget(graph, max) {
    const s = graph.simplify
    if (!s?.summary) return
    const steps = [
        () => s.setRuleEnabled('byType', true),
        () => s.setRuleEnabled('byFamily', true),
    ]
    // Too much to draw, or too many groups to tell apart: fold one step further.
    const crowded = () => { const x = s.summary(); return x.shown > max || x.groups > MAX_GROUPS }
    let i = 0
    const next = () => {
        if (!crowded() || i >= steps.length) return
        try { steps[i++]() } catch { i++ }
        setTimeout(next, 200)
    }
    next()
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

    // The whole document, tags as nodes: what local pivots expand from.
    const full = cleanGraph(format === 'misp' ? mispToGraph(json, { tagsAsNodes: true }) : stixToGraph(json))
    normaliseNodeTypes(full)
    const fullById = new Map(full.nodes.map(n => [n.id, n.data]))
    for (const e of full.edges) e.data.label = edgeLabelText(e.data, fullById.get(e.from))

    container.replaceChildren()
    let lastClick = { id: null, at: 0 }
    let graph = null
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
            // Closed at first: the canvas gets the room; a click on a node opens it.
            sidebar: { collapsed: true },
            // No minimap: the overview is the folded graph itself.
            minimap: false,
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
                // Header maps return strings: Pivotick writes them with textContent.
                nodeHeaderMap: {
                    title: (node) => String(node.getData()?.label ?? String(node.id)),
                    subtitle: (node) => String(node.getData()?.typeLabel ?? ''),
                },
                edgeHeaderMap: {
                    title: (edge) => String(edge.getData()?.relation || 'Link'),
                    subtitle: (edge) => String(EDGE_KINDS[edge.getData()?.kind]?.label ?? ''),
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
                // Pivotick's header (icon, value, type · family · side), our facts under it.
                nodeHeaderMap: {
                    title: (node) => String(node.getData()?.value || node.getData()?.label || node.id),
                    subtitle: (node) => subtitleOf(node.getData()),
                },
                edgeHeaderMap: {
                    title: (edge) => String(edge.getData()?.relation || 'Link'),
                    subtitle: (edge) => EDGE_KINDS[edge.getData()?.kind]?.label ?? '',
                },
                // Next to the hovered node, in one coordinate space (see placeTooltip).
                setPosition: placeTooltip,
                // No raw property list: our card says what matters.
                nodePropertiesMap: () => [],
                edgePropertiesMap: () => [],
                renderNodeExtra: (node) => nodeTooltip(node),
                renderEdgeExtra: (edge) => edgeTooltip(edge),
                renderGroupExtra: (group) => groupTooltipExtra(group),
            },
            // Bottom right, where the minimap was: the left side keeps the rail and the panel button.
            legend: { position: 'bottom-right', sections: legendSections(model) },
            filter: {
                facets: filterFacets(),
                edgeFacets: [{ key: 'kind', label: 'Links' }],
            },
            simplify: {
                rules: view.simplify(model),
                typeOf: (node) => node.getData()?.type,
                colorOf: (node) => node.getData()?.color,
                typeLabel: (type, count) => `${count} × ${String(type).replace(/^(attr|obj|stix|galaxy|tag)[:_]/, '')}`,
                // Family groups hold hundreds of nodes; opening one drills down into
                // sub-groups, so it never floods the canvas: no confirmation step.
                openConfirmAbove: 5000,
            },
            contextMenu: {
                menuNode: {
                    topbar: [{
                        text: 'Copy value', iconClass: 'fas fa-copy',
                        onclick: (evt, node) => {
                            const d = node.getData() ?? {}
                            navigator.clipboard?.writeText(String(d.value || d.label || node.id)).catch(() => { })
                        },
                    }],
                    // Over the graph, not in a popup window: visible in fullscreen too.
                    menu: [{
                        text: 'Open raw JSON', iconClass: 'fas fa-code',
                        onclick: (evt, node) => openJsonOverlay(container, node.getData()?.raw ?? {}, node.getData()?.label || 'Raw JSON'),
                    }],
                },
            },
            ...(opts.ui ?? {}),
        },
        callbacks: {
            // A group's drawing is rebuilt when the first click selects it, so the
            // browser never sees a double-click on one element: count two clicks
            // on the same group within 450 ms as one, and open it.
            onNodeClick: (event, node) => {
                const now = performance.now()
                const twice = lastClick.id === node.id && now - lastClick.at < 450
                lastClick = { id: node.id, at: twice ? 0 : now }
                if (twice && node.isGroup && graph?.simplify) {
                    const info = graph.simplify.getGroups().find(g => g.id === node.id)
                    if (info && !info.open) graph.simplify.open(info)
                }
            },
        },
        pivots: localPivots(full),
        plugins: opts.onViewChange
            ? [viewModePlugin(VIEWS, opts.view in VIEWS ? opts.view : 'structure',
                opts.onViewChange, opts.views)]
            : [],
        pivotIngestGrouped: true,
        ...(opts.extra ?? {}),
    }

    // Types come from the input document and serve as style keys: keep them plain.
    normaliseNodeTypes(model)
    const byId = new Map(model.nodes.map(n => [n.id, n.data]))
    for (const e of model.edges) e.data.label = edgeLabelText(e.data, byId.get(e.from))
    graph = new window.Pivotick(container, { nodes: model.nodes, edges: model.edges }, options)
    ruleContext.graph = graph
    ruleContext.opened = new Set()

    // Edge layers the view keeps off at first (embedded refs, pattern links…).
    const on = Object.keys(EDGE_KINDS).filter(k => (view.edgeKinds ?? {})[k] ?? EDGE_KINDS[k].on)
    const present = new Set(model.edges.map(e => e.data.kind))
    if (on.filter(k => present.has(k)).length < present.size) {
        graph.queryEngine?.setEdgeFilter?.('kind', { value: on, matchMode: 'exact' })
    }

    keepWithinBudget(graph, opts.maxVisible ?? MAX_VISIBLE)
    const stopTooltipFollow = tooltipFollowsFullscreen(graph)
    pointToDetails(graph, container)

    return {
        graph, model, view,
        stats: { nodes: model.nodes.length, edges: model.edges.length },
        destroy: () => { stopTooltipFollow(); try { graph.destroy() } catch { /* already gone */ } },
    }
}

export { FAMILIES, ELEMENTS, TLP }
