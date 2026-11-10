import { renderRawJson, sanitizeConfigPatch, textCell } from './graphSafety.js'
import { mountGraph, VIEWS } from './graphView.js'

// ─────────────────────────────────────────────────────────────────────────────
//  GRAPH CONFIG - edit this object to change graph behaviour & appearance.
//  All options are documented inline. No need to touch the logic below.
// ─────────────────────────────────────────────────────────────────────────────
export const GRAPH_CONFIG = {

    // Most elements the canvas draws at once. Past it the view folds further
    // (by type, then communities) instead of trimming anything: every node
    // stays reachable by opening its group, searching or in the table.
    maxNodes: 250,

    // Which side is shown first when the Graph tab opens ('input' | 'output').
    defaultSide: 'input',

    // Standalone MISP attributes of the same type are collapsed into a single
    // group node when their count reaches this threshold.
    groupingThreshold: 3,

    // Pivotick layout algorithm fed to new Pivotick(container, data, { layout }).
    // Other values Pivotick accepts: 'tree', 'radial', 'grid'.
    layout: { type: 'force' },

    // Pivotick top-level UI options (mode, sidebar default state, …).
    pivotickUI: {
        mode: 'full',
        sidebar: { collapsed: 'auto' }
    },

    // ── Node style maps ───────────────────────────────────────────────────────
    // Each key is a node "type" string.  Supported shapes: circle | square |
    // hexagon | triangle.  Size is the base radius in px.
    // Add or override entries here; unknown types fall back to _default.

    stixStyles: {
        'report': { shape: 'square', color: '#1d4ed8', size: 24 },
        'grouping': { shape: 'square', color: '#2563eb', size: 24 },
        'indicator': { shape: 'hexagon', color: '#7c3aed', size: 18 },
        'malware': { shape: 'hexagon', color: '#ef4444', size: 20 },
        'threat-actor': { shape: 'square', color: '#f97316', size: 22 },
        'attack-pattern': { shape: 'triangle', color: '#eab308', size: 18 },
        'campaign': { shape: 'square', color: '#f59e0b', size: 20 },
        'course-of-action': { shape: 'circle', color: '#10b981', size: 16 },
        'identity': { shape: 'square', color: '#8b5cf6', size: 16 },
        'vulnerability': { shape: 'hexagon', color: '#ec4899', size: 17 },
        'tool': { shape: 'triangle', color: '#a855f7', size: 16 },
        'infrastructure': { shape: 'hexagon', color: '#6366f1', size: 18 },
        'intrusion-set': { shape: 'square', color: '#14b8a6', size: 20 },
        'ipv4-addr': { shape: 'circle', color: '#0ea5e9', size: 13 },
        'ipv6-addr': { shape: 'circle', color: '#0284c7', size: 13 },
        'domain-name': { shape: 'circle', color: '#06b6d4', size: 13 },
        'url': { shape: 'circle', color: '#22d3ee', size: 12 },
        'file': { shape: 'circle', color: '#f97316', size: 13 },
        'email-addr': { shape: 'circle', color: '#fb923c', size: 12 },
        'network-traffic': { shape: 'circle', color: '#38bdf8', size: 11 },
        'marking-definition': { shape: 'square', color: '#dc2626', size: 11 },
        '_default': { shape: 'circle', color: '#64748b', size: 13 }
    },

    mispStyles: {
        'Event': { shape: 'square', color: '#2563eb', size: 26 },
        'Object': { shape: 'hexagon', color: '#7c3aed', size: 18 },
        'attr-network': { shape: 'circle', color: '#0ea5e9', size: 13 },
        'attr-payload': { shape: 'circle', color: '#f97316', size: 13 },
        'attr-external': { shape: 'circle', color: '#10b981', size: 12 },
        'attr-other': { shape: 'circle', color: '#64748b', size: 12 },
        'group-network': { shape: 'hexagon', color: '#0ea5e9', size: 18 },
        'group-payload': { shape: 'hexagon', color: '#f97316', size: 18 },
        'group-external': { shape: 'hexagon', color: '#10b981', size: 17 },
        'group-other': { shape: 'hexagon', color: '#64748b', size: 17 },
        '_default': { shape: 'circle', color: '#64748b', size: 12 }
    },

    // MISP attribute types that belong to the "network" or "payload" families.
    // Extend these sets to reclassify how attributes are coloured.
    mispNetworkTypes: new Set(['ip-src', 'ip-dst', 'domain', 'hostname', 'url', 'uri', 'email-src', 'email-dst']),
    mispPayloadTypes: new Set(['md5', 'sha1', 'sha256', 'sha512', 'filename', 'malware-sample'])
}

// ─────────────────────────────────────────────────────────────────────────────
//  Internal helpers - no need to edit below unless changing the graph logic.
// ─────────────────────────────────────────────────────────────────────────────







export function _nodeProperties(node) {
    const d = node.getData()
    const raw = d?.raw ?? {}
    const props = []

    if (d?.childAttrs && Object.keys(d.childAttrs).length) {
        for (const [key, val] of Object.entries(d.childAttrs))
            props.push({ name: key, value: String(val) })
        props.push({ name: '─────', value: '' })
    }

    if (raw.value) props.push({ name: 'Value', value: String(raw.value) })
    if (raw.type) props.push({ name: 'Type', value: raw.type })
    if (raw.category) props.push({ name: 'Category', value: raw.category })
    if (raw.object_relation) props.push({ name: 'Relation', value: raw.object_relation })
    if (raw.to_ids !== undefined) props.push({ name: 'To IDS', value: raw.to_ids ? 'Yes' : 'No' })
    if (raw['meta-category']) props.push({ name: 'Meta-category', value: raw['meta-category'] })
    if (raw.date) props.push({ name: 'Date', value: raw.date })
    if (raw.name) props.push({ name: 'Name', value: raw.name })
    if (raw.description) props.push({ name: 'Description', value: raw.description })
    if (raw.pattern) props.push({ name: 'Pattern', value: raw.pattern })
    if (raw.created) props.push({ name: 'Created', value: raw.created })
    if (raw.modified) props.push({ name: 'Modified', value: raw.modified })
    if (raw.valid_from) props.push({ name: 'Valid from', value: raw.valid_from })
    if (raw.aliases?.length) props.push({ name: 'Aliases', value: raw.aliases.join(', ') })
    if (raw.labels?.length) props.push({ name: 'Labels', value: raw.labels.filter(l => !l.startsWith('misp:')).join(', ') })
    if (raw.definition?.tlp) props.push({ name: 'TLP', value: raw.definition.tlp.toUpperCase() })
    if (raw.hashes && typeof raw.hashes === 'object') {
        for (const [algo, hash] of Object.entries(raw.hashes))
            props.push({ name: algo, value: String(hash) })
    }

    // Wrap every cell so Pivotick never HTML-parses a converted value: `raw` and
    // `childAttrs` are the untouched originals, and both the name and the value
    // position reach the same sink (childAttrs keys and hash algo names included).
    return props
        .filter(p => p.value !== undefined && p.value !== '')
        .map(p => ({ name: textCell(p.name), value: textCell(p.value) }))
}


// Pivotick 1.4.0 workaround: all Pivotick instances on a page share one
// body-level tooltip element, and rebuilding the sidebar's ego graph (click
// node A, then node B) destroys it. Our instance then keeps pointing at the
// detached element and hover tooltips never show again. Watch body for the
// removal and re-attach our element; after the first rebuild the sidebar
// creates its own copy and leaves ours alone. Drop this once the tooltip
// element is per-instance upstream.
function _guardTooltip(graph) {
    let attempts = 0
    const poll = setInterval(() => {
        const el = graph?.UIManager?.tooltip?.tooltip
        if (!el) {
            if (++attempts > 20) clearInterval(poll)
            return
        }
        clearInterval(poll)
        new MutationObserver(() => {
            if (!el.isConnected) {
                el.classList.remove('shown')
                document.body.appendChild(el)
            }
        }).observe(document.body, { childList: true })
    }, 250)
}

function _showSpinner(containerId, message) {
    const el = document.getElementById(containerId)
    if (!el) return
    el.innerHTML =
        `<div class="graph-spinner-overlay">
            <div class="spinner-border spinner-border-sm" role="status" style="color:var(--accent);"></div>
            <span>${message}</span>
        </div>`
}

// The view picker's current choice, shared by both sides.
let _currentView = 'structure'
const _mounted = {}

/** The site's colour theme is dark unless a light theme class is on <html>. */
function _isDarkTheme() {
    const cl = document.documentElement.classList
    if (cl.contains('light-mode') || cl.contains('ocean-mode') || cl.contains('christmas-mode')) return false
    return [...cl].some(c => c.endsWith('-mode'))
}

async function _initViewer(containerId, jsonText, format) {
    const container = document.getElementById(containerId)
    if (!container) return

    if (typeof window.Pivotick !== 'function') {
        _showSpinner(containerId, 'Loading Pivotick…')
        const retry = () => _initViewer(containerId, jsonText, format)
        window.addEventListener('pivotick-ready', retry, { once: true })
        let attempts = 0
        const poll = setInterval(() => {
            attempts++
            if (typeof window.Pivotick === 'function') {
                clearInterval(poll)
                window.removeEventListener('pivotick-ready', retry)
                _initViewer(containerId, jsonText, format)
            } else if (attempts > 15) {
                clearInterval(poll)
                container.innerHTML = '<p style="padding:2rem;text-align:center;color:#888">Could not load Pivotick.</p>'
            }
        }, 200)
        return
    }

    _showSpinner(containerId, 'Building graph…')
    // Yield to the browser so the spinner renders before the heavy work.
    await new Promise(r => setTimeout(r, 0))

    _mounted[containerId]?.destroy()
    try {
        _mounted[containerId] = await mountGraph(container, jsonText, format, {
            view: _currentView,
            dark: _isDarkTheme(),
            maxVisible: GRAPH_CONFIG.maxNodes,
            ui: {
                contextMenu: {
                    menuNode: {
                        topbar: [{
                            text: 'Copy value',
                            iconClass: 'fas fa-copy',
                            onclick: (evt, node) => {
                                const d = node.getData() ?? {}
                                navigator.clipboard.writeText(String(d.value || d.label || node.id)).catch(() => { })
                            }
                        }],
                        menu: [{
                            text: 'Open raw JSON',
                            iconClass: 'fas fa-code',
                            onclick: (evt, node) => {
                                const raw = node.getData()?.raw ?? {}
                                const win = window.open('', '_blank')
                                if (win) renderRawJson(win, raw, _isDarkTheme())
                            }
                        }]
                    }
                }
            }
        })
    } catch (err) {
        console.error('Graph:', err)
        container.innerHTML = '<p style="padding:2rem;text-align:center;color:#888">Could not draw this document as a graph.</p>'
        return
    }
    _guardTooltip(_mounted[containerId].graph)
    _updateViewHint()
}

/** Fill the view picker and keep its description under it. */
function _initViewPicker() {
    const select = document.getElementById('graph-view-select')
    if (!select || select.options.length) return
    for (const [id, v] of Object.entries(VIEWS)) select.add(new Option(v.label, id))
    select.value = _currentView
    select.addEventListener('change', () => {
        _currentView = select.value
        for (const side of ['input', 'output']) _renderedSides[side] = false
        const outEl = document.getElementById('graph-container-output')
        _renderSide(outEl && outEl.style.display !== 'none' ? 'output' : 'input')
    })
}

function _updateViewHint() {
    const hint = document.getElementById('graph-view-hint')
    if (hint) hint.textContent = VIEWS[_currentView]?.description ?? ''
}

// ─────────────────────────────────────────────────────────────────────────────
//  Public API
// ─────────────────────────────────────────────────────────────────────────────

let _conversionData = null
let _renderedSides = { input: false, output: false }

function _renderSide(side) {
    if (!_conversionData || _renderedSides[side]) return
    _renderedSides[side] = true
    const isStixToMisp = _conversionData.conversion_type === 'STIX_TO_MISP'
    const containerId = side === 'input' ? 'graph-container' : 'graph-container-output'
    const format = side === 'input'
        ? (isStixToMisp ? 'stix' : 'misp')
        : (isStixToMisp ? 'misp' : 'stix')
    const text = side === 'input' ? _conversionData.input_text : _conversionData.output_text
    _showSpinner(containerId, 'Building graph…')
    _initViewer(containerId, text, format)
}

/** Switch the visible graph side. Triggers lazy render of the new side if needed. */
export function showGraphSide(side) {
    const inEl = document.getElementById('graph-container')
    const outEl = document.getElementById('graph-container-output')
    const btnIn = document.getElementById('graph-view-input')
    const btnOut = document.getElementById('graph-view-output')
    if (!inEl || !outEl) return
    inEl.style.display = side === 'input' ? '' : 'none'
    outEl.style.display = side === 'output' ? '' : 'none'
    if (btnIn) btnIn.className = 'btn btn-sm ' + (side === 'input' ? 'btn-primary' : 'btn-outline-secondary')
    if (btnOut) btnOut.className = 'btn btn-sm ' + (side === 'output' ? 'btn-primary' : 'btn-outline-secondary')
    _renderSide(side)
}

/** Deep-merge a config patch into GRAPH_CONFIG.
 *  The patch may come from a stored config (another user's input), so it is
 *  schema-filtered first - see sanitizeConfigPatch in graphSafety.js. */
export function applyConfig(patch) {
    patch = sanitizeConfigPatch(patch)
    if (patch.maxNodes !== undefined) GRAPH_CONFIG.maxNodes = +patch.maxNodes || GRAPH_CONFIG.maxNodes
    if (patch.defaultSide !== undefined) GRAPH_CONFIG.defaultSide = patch.defaultSide
    if (patch.groupingThreshold !== undefined) GRAPH_CONFIG.groupingThreshold = +patch.groupingThreshold || GRAPH_CONFIG.groupingThreshold
    if (patch.layout?.type !== undefined) GRAPH_CONFIG.layout.type = patch.layout.type
    if (patch.pivotickUI?.mode !== undefined) GRAPH_CONFIG.pivotickUI.mode = patch.pivotickUI.mode
    if (patch.pivotickUI?.sidebar?.collapsed !== undefined) GRAPH_CONFIG.pivotickUI.sidebar.collapsed = patch.pivotickUI.sidebar.collapsed
    if (patch.stixStyles) {
        for (const [k, v] of Object.entries(patch.stixStyles)) {
            GRAPH_CONFIG.stixStyles[k] = { ...(GRAPH_CONFIG.stixStyles[k] ?? {}), ...v }
        }
    }
    if (patch.mispStyles) {
        for (const [k, v] of Object.entries(patch.mispStyles)) {
            GRAPH_CONFIG.mispStyles[k] = { ...(GRAPH_CONFIG.mispStyles[k] ?? {}), ...v }
        }
    }
    if (Array.isArray(patch.mispNetworkTypes)) GRAPH_CONFIG.mispNetworkTypes = new Set(patch.mispNetworkTypes)
    if (Array.isArray(patch.mispPayloadTypes)) GRAPH_CONFIG.mispPayloadTypes = new Set(patch.mispPayloadTypes)
}

/** Re-render the currently visible side (call after applyConfig). */
export function reRenderGraph() {
    if (!_conversionData) return
    document.querySelectorAll('.alert.alert-warning').forEach(el => {
        if (el.textContent.includes('most connected nodes')) el.remove()
    })
    // Detect which side is currently visible and re-render only that one
    const outEl = document.getElementById('graph-container-output')
    const activeSide = outEl?.style.display === 'none' || !outEl ? 'input' : 'output'
    _renderedSides[activeSide] = false
    _renderSide(activeSide)
}

/**
 * Call this once the conversion data is available (after the API response).
 * It registers the lazy-render hook so the graph only builds when the tab
 * is first opened.
 *
 * @param {object} conversionData  - the object returned by /conversions/get_conversion
 */
export function initConversionGraph(conversionData) {
    _conversionData = conversionData
    _renderedSides = { input: false, output: false }

    // Called by the template's delegated toolbar handler on first tab open;
    // window-scoped because it only exists once the conversion data is loaded.
    window.onGraphTabClick = function () {
        _initViewPicker()
        // Render only the default side on first tab open
        const side = GRAPH_CONFIG.defaultSide
        showGraphSide(side)
    }
}
