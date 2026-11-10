// ─────────────────────────────────────────────────────────────────────────────
//  Vitrine on the site — one loader for every page.
//
//  Vitrine (https://github.com/ecrou-exact/vitrine, self-hosted in
//  static/vitrine/, see VERSION.json) ships web components: <vt-json>,
//  <vt-table>, <vt-chart>, <vt-openapi>, <vt-timeline>, <vt-field>…
//
//    import { useVitrine } from '/static/js/vitrine.js'
//    await useVitrine('json', 'table')     // defines <vt-json> and <vt-table>
//
//  The loader keeps every Vitrine element in the site's colour theme (the
//  `*-mode` class on <html>: light, dark, dusk, ocean, christmas) and gives
//  them the site's accent colour.
//
//  In a Vue app, declare the elements as custom elements so Vue leaves them to
//  the browser:  app.config.compilerOptions.isCustomElement = isVitrineTag
// ─────────────────────────────────────────────────────────────────────────────

const BASE = new URL('../vitrine/esm/', import.meta.url).href
const loads = new Map()

/** Import Vitrine components by name ('json', 'table', 'chart'…). */
export function useVitrine(...names) {
    startThemeSync()
    return Promise.all(names.map((name) => {
        if (!loads.has(name)) loads.set(name, import(`${BASE}vt-${name}.js`).then(
            () => true,
            (err) => { console.warn(`Vitrine: vt-${name} could not load`, err); return false }))
        return loads.get(name)
    }))
}

export const isVitrineTag = (tag) => tag.startsWith('vt-')

const DARK_MODES = ['dark-mode', 'dusk-mode']

/** The site's theme as Vitrine names it. */
export function siteTheme() {
    const cl = document.documentElement.classList
    return DARK_MODES.some((c) => cl.contains(c)) ? 'dark' : 'light'
}

let syncing = false
function applyTheme(root = document) {
    const theme = siteTheme()
    for (const el of root.querySelectorAll('*')) {
        if (el.tagName.startsWith('VT-') && !el.hasAttribute('data-fixed-theme')) el.setAttribute('theme', theme)
    }
}

function startThemeSync() {
    if (syncing || typeof document === 'undefined') return
    syncing = true
    // Accent and fonts follow the site (Vitrine reads its own CSS custom properties).
    const style = document.createElement('style')
    style.dataset.vitrine = 'site'
    style.textContent = `
:where(vt-json, vt-code, vt-markdown, vt-table, vt-chart, vt-openapi, vt-timeline, vt-field, vt-search, vt-tags, vt-stats, vt-diff) {
  --vt-accent: var(--accent, #2563eb);
}`
    document.head.appendChild(style)
    applyTheme()
    // Theme switches: <html> class changes. New elements: anything added to the page.
    new MutationObserver(() => applyTheme()).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    new MutationObserver((records) => {
        const theme = siteTheme()
        for (const r of records) for (const n of r.addedNodes) {
            if (n.nodeType !== 1) continue
            if (n.tagName.startsWith('VT-') && !n.hasAttribute('data-fixed-theme')) n.setAttribute('theme', theme)
            if (n.querySelector) for (const el of n.querySelectorAll('*')) {
                if (el.tagName.startsWith('VT-') && !el.hasAttribute('data-fixed-theme')) el.setAttribute('theme', theme)
            }
        }
    }).observe(document.body, { childList: true, subtree: true })
}
