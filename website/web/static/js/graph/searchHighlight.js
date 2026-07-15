// ─────────────────────────────────────────────────────────────────────────────
//  Search-highlight helper for v-html sinks: escape first, then wrap matches
//  in <mark> - the <mark> tags are the only markup that survives.
//  (Unrelated to the hljs "highlight.js" syntax-highlighting library.)
// ─────────────────────────────────────────────────────────────────────────────

export function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

// The query is escaped the same way as the text so HTML specials in the
// query line up with the entities they became in the escaped text.
export function highlightMatches(text, query) {
    const escaped = escapeHtml(text)
    if (!query) return escaped
    const q = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return escaped.replace(new RegExp(`(${q})`, 'gi'), '<mark class="ctbl-mark">$1</mark>')
}
