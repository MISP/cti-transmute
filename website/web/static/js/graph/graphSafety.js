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
