// ─────────────────────────────────────────────────────────────────────────────
//  Vitrine — readable JSON, Markdown and code inside the graph's panels.
//
//  Vitrine (https://github.com/ecrou-exact/vitrine) ships as web components,
//  self-hosted in static/vitrine/ (see its VERSION.json). Each component is
//  imported the first time a panel needs it, so a graph that never shows raw
//  JSON never downloads the JSON viewer.
//
//  Everything converted is handed over as text (`content` / `data`), never as
//  HTML: <vt-markdown> sanitises what it renders, and we block remote images
//  (a converted document could carry a tracking pixel).
//
//  If a module cannot load, each helper falls back to a plain <pre>, so a
//  panel is never empty.
// ─────────────────────────────────────────────────────────────────────────────

// static/js/graph/render/ → static/vitrine/esm/ (works on the site and in the graph lab)
const BASE = new URL('../../../vitrine/esm/', import.meta.url).href
const loaded = new Map()

function load(name) {
    if (!loaded.has(name)) loaded.set(name, import(`${BASE}vt-${name}.js`).then(() => true, (err) => {
        console.warn(`Vitrine: vt-${name} unavailable, plain text used instead`, err)
        return false
    }))
    return loaded.get(name)
}

/** The theme the graph is drawn in (Pivotick's data-theme), for Vitrine's `theme`. */
function theme() {
    const t = document.querySelector('.pivotick[data-theme]')?.getAttribute('data-theme')
    return t === 'dark' ? 'dark' : 'light'
}

function plain(text, cls = 'ctx-d-raw') {
    const pre = document.createElement('pre')
    pre.className = cls
    pre.textContent = text
    return pre
}

/**
 * A placeholder that becomes the Vitrine element once its module is loaded.
 * `build(el)` sets the element's attributes and content.
 */
function lazy(name, tag, build, fallbackText) {
    const slot = document.createElement('div')
    slot.className = 'ctx-vt'
    slot.append(plain(fallbackText.length > 4000 ? fallbackText.slice(0, 4000) + '\n…' : fallbackText))
    load(name).then((ok) => {
        if (!ok) return
        const el = document.createElement(tag)
        el.setAttribute('theme', theme())
        build(el)
        slot.replaceChildren(el)
    })
    return slot
}

/** Raw JSON as a collapsible tree with search, copy and a JSONPath bar. */
export function jsonView(value, { label = 'JSON', depth = 1, maxHeight = '420px' } = {}) {
    let text
    try { text = JSON.stringify(value, null, 2) } catch { text = String(value) }
    return lazy('json', 'vt-json', (el) => {
        el.setAttribute('variant', 'full')
        el.setAttribute('label', label)
        el.setAttribute('depth', String(depth))
        el.setAttribute('max-height', maxHeight)
        el.setAttribute('fullscreen', 'false')
        el.setAttribute('download', `${label.replace(/[^\w.-]+/g, '_')}.json`)
        el.content = text
    }, text)
}

/** Markdown (event reports, STIX descriptions and notes), sanitised, no remote images. */
export function markdownView(text, { maxHeight = '360px' } = {}) {
    return lazy('markdown', 'vt-markdown', (el) => {
        el.setAttribute('images', 'block')
        el.setAttribute('external-links', 'new-tab')
        el.setAttribute('max-height', maxHeight)
        el.content = String(text)
    }, String(text))
}

/** Code (STIX patterns, YARA / Sigma / Snort rules, user agents…). */
export function codeView(text, { language = 'plaintext', label, maxHeight = '320px' } = {}) {
    return lazy('code', 'vt-code', (el) => {
        el.setAttribute('language', language)
        el.setAttribute('wrap', '')
        el.setAttribute('copy', '')
        el.setAttribute('max-height', maxHeight)
        if (label) { el.setAttribute('header', ''); el.setAttribute('label', label) }
        el.content = String(text)
    }, String(text))
}

/** Text that reads as Markdown (headings, lists, links, emphasis, code fences). */
export function looksLikeMarkdown(text) {
    return /(^|\n)\s{0,3}(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|```)|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*/.test(String(text ?? ''))
}

/**
 * A panel over the graph showing one document as JSON. It is placed inside the
 * graph's own container, so it stays visible in fullscreen (a popup window
 * would open behind it). Escape, the × or a click on the backdrop closes it.
 */
export function openJsonOverlay(container, value, title = 'Raw JSON') {
    container.querySelector(':scope > .ctx-overlay')?.remove()
    const back = document.createElement('div')
    back.className = 'ctx-overlay'
    back.style.cssText = 'position:absolute;inset:0;z-index:50;background:rgba(15,23,42,.35);display:grid;place-items:center;padding:24px'
    const card = document.createElement('div')
    card.setAttribute('role', 'dialog')
    card.setAttribute('aria-label', title)
    card.style.cssText = 'width:min(900px,100%);max-height:100%;overflow:auto;background:var(--pvt-bg,#fff);color:var(--pvt-text-color,inherit);' +
        'border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.3);padding:12px 14px;display:flex;flex-direction:column;gap:8px'
    const head = document.createElement('div')
    head.style.cssText = 'display:flex;align-items:center;gap:8px;font-weight:600'
    const name = document.createElement('span')
    name.textContent = title
    name.style.cssText = 'flex:1;min-width:0;overflow-wrap:anywhere'
    const close = document.createElement('button')
    close.type = 'button'
    close.textContent = '×'
    close.setAttribute('aria-label', 'Close')
    close.style.cssText = 'border:0;background:none;font-size:22px;line-height:1;cursor:pointer;color:inherit;padding:0 4px'
    head.append(name, close)
    card.append(head, jsonView(value, { label: title, depth: 2, maxHeight: '70vh' }))
    back.append(card)
    if (getComputedStyle(container).position === 'static') container.style.position = 'relative'
    container.append(back)
    const done = () => { back.remove(); document.removeEventListener('keydown', onKey) }
    const onKey = (e) => { if (e.key === 'Escape') done() }
    close.addEventListener('click', done)
    back.addEventListener('click', (e) => { if (e.target === back) done() })
    document.addEventListener('keydown', onKey)
    close.focus()
}
