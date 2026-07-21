// ─────────────────────────────────────────────────────────────────────────────
//  Safety helpers for the conversion graph - the graph is built from converted
//  CTI, so every value handed to the Pivotick library or opened in a popup is
//  attacker-controlled. Both sinks below neutralise it before it can be parsed
//  as HTML.
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
    }
    for (const edge of parsed?.edges ?? []) {
        if (edge.data?.label != null) edge.data.label = escapeHtml(edge.data.label)
    }
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
