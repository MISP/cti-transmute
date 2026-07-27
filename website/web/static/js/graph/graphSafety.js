// ─────────────────────────────────────────────────────────────────────────────
//  Safety helpers for the conversion graph - the graph is built from converted
//  CTI, so every value handed to the Pivotick library or opened in a popup is
//  attacker-controlled. Each helper below neutralises one sink before the value
//  can be parsed as HTML.
// ─────────────────────────────────────────────────────────────────────────────

import { escapeHtml } from './searchHighlight.js'

// Pivotick renders node/edge labels through innerHTML and does not escape them,
// so a converted value like `</pre><img src=x onerror=...>` in a label executes
// on hover. Escape the display labels (never the `raw` object, which the tooltip
// and properties panel read as text) before the parsed graph reaches Pivotick.
// Benign labels carry no HTML specials, so this is a no-op for real data.
export function escapeGraphLabels(parsed) {
    for (const node of parsed?.nodes ?? []) {
        const d = node.data
        if (!d) continue
        if (d.label != null) d.label = escapeHtml(d.label)
        if (d.sublabel != null) d.sublabel = escapeHtml(d.sublabel)
        if (d.type != null) d.type = safeType(d.type)
    }
    for (const edge of parsed?.edges ?? []) {
        if (edge.data?.label != null) edge.data.label = escapeHtml(edge.data.label)
    }
}

// A node's `type` is a style-map key, but for STIX it comes straight from the
// input bundle, and the neighbours ego graph is built without our property map -
// so Pivotick's default one lists every `data` entry, `type` included, through
// the HTML-parsing sink described on textCell. Real STIX/MISP type names are
// plain identifiers, so restricting the charset is a no-op for them; an unknown
// type already falls back to the `_default` style.
function safeType(type) {
    return String(type).replace(/[^a-zA-Z0-9_.-]/g, '_')
}

// Pivotick resolves every properties-panel cell through `tryResolveHTMLElement`,
// which runs `template.innerHTML` on any *string* it is given and returns the
// parsed element - so a converted value like `<img src=x onerror=...>` executes
// as soon as the tooltip is shown (on hover) or the sidebar is filled (on click).
// An HTMLElement is returned untouched instead, so wrap every cell: the text is
// set via textContent and never parsed. Escaping the string would not do - the
// entities would survive into the span fallback and users would read `&lt;img&gt;`
// in descriptions and STIX patterns.
export function textCell(value) {
    const el = document.createElement('span')
    el.textContent = String(value)
    return el
}

// A graph-config patch can come from a *stored* config - user input replayed
// into other users' browsers (admins see every saved config) - and Pivotick
// HTML-parses some style fields (svgIcon runs through template.innerHTML), so
// applyConfig routes every patch through this schema filter. Style entries
// accept exactly shape/color/size: svgIcon and iconClass (written to
// className) are deliberately not accepted. The server enforces the same
// schema on save and on list; this is the last line of defence for a hostile
// row already in the database. Mirrors validate_graph_config in
// website/web/conversions/conversions_core.py - keep the two in sync.

const CONFIG_SHAPES = new Set(['circle', 'square', 'hexagon', 'triangle'])
const CONFIG_LAYOUTS = new Set(['force', 'tree', 'radial', 'grid'])
const CONFIG_UI_MODES = new Set(['full', 'minimal'])
const CONFIG_SIDES = new Set(['input', 'output'])
// Style-map keys and MISP attribute types are plain identifiers
// ('threat-actor', 'ipv4-addr', 'filename|md5', '_default').
const CONFIG_IDENT_RE = /^[A-Za-z0-9_.|-]{1,100}$/
// Hex, a bare colour name, or an rgb()/hsl() function with a plain numeric
// body - notably NOT url(...), which can beacon from an SVG fill.
const CONFIG_COLOR_RE = /^(#[0-9A-Fa-f]{3,8}|[A-Za-z]{1,30}|(?:rgba?|hsla?)\([0-9,.%/\s]{1,50}\))$/

function _configNum(value, lo, hi) {
    return typeof value === 'number' && value >= lo && value <= hi
}

function _sanitizeStyleMap(styles) {
    const out = {}
    if (!styles || typeof styles !== 'object') return out
    for (const [key, style] of Object.entries(styles)) {
        if (!CONFIG_IDENT_RE.test(key) || !style || typeof style !== 'object') continue
        const entry = {}
        if (CONFIG_SHAPES.has(style.shape)) entry.shape = style.shape
        if (typeof style.color === 'string' && CONFIG_COLOR_RE.test(style.color)) entry.color = style.color
        if (_configNum(style.size, 6, 50)) entry.size = style.size
        if (Object.keys(entry).length) out[key] = entry
    }
    return out
}

export function sanitizeConfigPatch(patch) {
    const out = {}
    if (!patch || typeof patch !== 'object') return out
    if (_configNum(patch.maxNodes, 10, 50000)) out.maxNodes = patch.maxNodes
    if (CONFIG_SIDES.has(patch.defaultSide)) out.defaultSide = patch.defaultSide
    if (_configNum(patch.groupingThreshold, 2, 50)) out.groupingThreshold = patch.groupingThreshold
    if (CONFIG_LAYOUTS.has(patch.layout?.type)) out.layout = { type: patch.layout.type }
    const ui = {}
    if (CONFIG_UI_MODES.has(patch.pivotickUI?.mode)) ui.mode = patch.pivotickUI.mode
    const collapsed = patch.pivotickUI?.sidebar?.collapsed
    if (collapsed === 'auto' || typeof collapsed === 'boolean') ui.sidebar = { collapsed }
    if (Object.keys(ui).length) out.pivotickUI = ui
    const stix = _sanitizeStyleMap(patch.stixStyles)
    if (Object.keys(stix).length) out.stixStyles = stix
    const misp = _sanitizeStyleMap(patch.mispStyles)
    if (Object.keys(misp).length) out.mispStyles = misp
    if (Array.isArray(patch.mispNetworkTypes)) {
        out.mispNetworkTypes = patch.mispNetworkTypes.filter(t => typeof t === 'string' && CONFIG_IDENT_RE.test(t))
    }
    if (Array.isArray(patch.mispPayloadTypes)) {
        out.mispPayloadTypes = patch.mispPayloadTypes.filter(t => typeof t === 'string' && CONFIG_IDENT_RE.test(t))
    }
    return out
}

// The "Open raw JSON" action opens a blank window and shows the node's raw
// object. Build the popup with DOM APIs and set the JSON as textContent - no
// markup is ever constructed from the data, so it cannot execute (the previous
// document.write of an interpolated HTML string did).
export function renderRawJson(win, raw, isDark) {
    const doc = win.document
    const body = doc.body
    body.style.margin = '0'
    body.style.background = isDark ? '#0f0f10' : '#fff'
    body.style.color = isDark ? '#e0e0e0' : '#000'

    const pre = doc.createElement('pre')
    pre.style.cssText = 'font-family:monospace;font-size:13px;padding:1.5rem;white-space:pre-wrap;word-break:break-all'
    pre.textContent = JSON.stringify(raw, null, 2)
    body.appendChild(pre)
    return pre
}
