// ─────────────────────────────────────────────────────────────────────────────
//  urlState — keep a page's view in its URL, so it can be bookmarked and shared.
//
//    const tab = readParam('tab', ['input', 'output', 'graph'])   // or null
//    writeParams({ tab: 'graph', page: 2 }, { page: 1 })           // defaults are omitted
//
//  What goes in the URL is view state only: which tab, which filters, which
//  page, which sort. Never a share key, a token, a document or anything the
//  server did not already let this viewer see. Opening a URL grants nothing:
//  the server still decides what the viewer may read (a private Conversion
//  stays its owner's and the admins'), these values only pick what to show.
//
//  Reading is strict: a value is taken only if it is in the allowed list (or
//  passes the given check), anything else is ignored. Writing uses
//  history.replaceState, so moving around a page does not fill the back
//  button with one entry per click.
// ─────────────────────────────────────────────────────────────────────────────

const params = () => new URLSearchParams(window.location.search)

/**
 * A query parameter, or null.
 * @param {string} name
 * @param {string[] | ((v: string) => boolean)} allowed  allowed values, or a check
 */
export function readParam(name, allowed) {
    const v = params().get(name)
    if (v === null || v === '') return null
    if (Array.isArray(allowed)) return allowed.includes(v) ? v : null
    if (typeof allowed === 'function') return allowed(v) ? v : null
    return null
}

/** An integer parameter within [min, max], or null. */
export function readInt(name, min, max) {
    const v = readParam(name, (x) => /^\d{1,6}$/.test(x))
    if (v === null) return null
    const n = parseInt(v, 10)
    return n >= min && n <= max ? n : null
}

/** A yyyy-mm-dd date parameter, or null. */
export const readDate = (name) => readParam(name, (x) => /^\d{4}-\d{2}-\d{2}$/.test(x))

/** A free-text parameter (search terms), length-capped, or null. */
export const readText = (name, max = 200) => readParam(name, (x) => x.length <= max)

/**
 * Write values into the URL without reloading or adding a history entry.
 * A value equal to its default, empty, null or false is removed.
 */
export function writeParams(values, defaults = {}) {
    const p = params()
    for (const [k, v] of Object.entries(values)) {
        const empty = v === null || v === undefined || v === '' || v === false || (Array.isArray(v) && !v.length)
        if (empty || String(v) === String(defaults[k] ?? '')) p.delete(k)
        else p.set(k, Array.isArray(v) ? v.join(',') : String(v))
    }
    const q = p.toString()
    const url = window.location.pathname + (q ? `?${q}` : '') + window.location.hash
    if (url !== window.location.pathname + window.location.search + window.location.hash) {
        window.history.replaceState(window.history.state, '', url)
    }
}
