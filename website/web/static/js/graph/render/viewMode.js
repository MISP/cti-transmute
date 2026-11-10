// ─────────────────────────────────────────────────────────────────────────────
//  "Views" rail mode — pick the view from inside Pivotick.
//
//  A Pivotick plugin that adds a mode on the left rail (below Select, View,
//  Physics, Simplify, Pivot): one row per view, the current one marked, and
//  the current view's description under the list. Picking a row hands the id
//  to the host, which remounts the graph in that view (a view changes the
//  model itself, not only the styling, so it cannot be switched in place).
// ─────────────────────────────────────────────────────────────────────────────

// Our own markup (trusted): Pivotick injects rail icons as raw SVG.
const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 8l10 5 10-5-10-5Z"/><path d="m2 13 10 5 10-5"/><path d="m2 17.5 10 5 10-5" opacity=".55"/></svg>'
const DOT = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="currentColor"/></svg>'
const RING = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/></svg>'

/**
 * @param {object} views     the VIEWS registry
 * @param {string} current   the active view id
 * @param {(id:string)=>void} onPick
 * @param {string[]} [only]  restrict the list (e.g. without MISP ↔ STIX when one side is missing)
 */
export function viewModePlugin(views, current, onPick, only) {
    const ids = Object.keys(views).filter(id => !only || only.includes(id))
    return {
        name: 'ctx-views',
        install(ctx) {
            ctx.addRailMode({
                id: 'ctx-views',
                label: 'Views',
                icon: ICON,
                shortcut: 'V',
                order: 10,
                tools: ids.map(id => ({
                    id: `view-${id}`,
                    label: views[id].label,
                    icon: id === current ? DOT : RING,
                    kind: 'action',
                    enabled: () => id !== current,
                    run: () => onPick(id),
                })),
                render: () => {
                    const p = document.createElement('p')
                    p.style.cssText = 'margin:8px 10px 4px;font-size:12px;line-height:1.45;opacity:.75;max-width:230px;white-space:normal'
                    p.textContent = views[current]?.description ?? ''
                    return p
                },
            })
        },
    }
}
