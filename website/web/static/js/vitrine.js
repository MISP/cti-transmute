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
/* Vitrine's design tokens mapped onto CTI Transmute's: every component takes the
   site's colours, fonts and radii, and follows its theme (the site redefines
   these variables per *-mode class). */
:where(vt-json, vt-code, vt-markdown, vt-table, vt-chart, vt-openapi, vt-timeline, vt-field, vt-search, vt-tags, vt-stats, vt-diff, vt-http) {
  --vt-accent: var(--accent, #2563eb);
  --vt-accent-soft: var(--accent-light, #eff4ff);
  --vt-on-accent: var(--text-inv, #fff);
  --vt-bg: var(--surface, #fff);
  --vt-surface: var(--surface, #fff);
  --vt-surface-raised: var(--surface, #fff);
  --vt-surface-sunken: var(--surface-2, #f9fafb);
  --vt-border: var(--border, #e3e8f0);
  --vt-border-strong: var(--border-2, #d0d7e3);
  --vt-fg: var(--text, #0f172a);
  --vt-fg-muted: var(--text-2, #475569);
  --vt-success: var(--success, #10b981);
  --vt-danger: var(--danger, #ef4444);
  --vt-warning: var(--warning, #f59e0b);
  --vt-info: var(--accent-2, #0ea5e9);
  --vt-highlight: var(--accent-light, #eff4ff);
  --vt-font-ui: var(--font-ui, system-ui, sans-serif);
  --vt-font-body: var(--font-ui, system-ui, sans-serif);
  --vt-font-mono: var(--font-mono, ui-monospace, monospace);
  --vt-radius: var(--radius-sm, 6px);
  --vt-radius-sm: var(--radius-xs, 4px);
  --vt-radius-lg: var(--radius-md, 10px);
  --vt-shadow: var(--shadow-sm, none);
  --vt-chart-1: var(--accent, #2563eb);
  --vt-chart-2: var(--accent-2, #0ea5e9);
  --vt-chart-3: var(--success, #10b981);
  --vt-chart-4: var(--warning, #f59e0b);
  --vt-chart-5: var(--danger, #ef4444);
  --vt-chart-6: #8b5cf6;
  --vt-chart-7: #ec4899;
  --vt-chart-8: var(--text-3, #94a3b8);
}
/* Server-paginated tables: the page's own pagination is the pager. */
vt-table.cti-server-table::part(pager) { display: none; }
/* A chart already sits in a site card: no second frame around it. */
vt-chart.cti-bare::part(container) { border: 0; box-shadow: none; background: transparent; }
`
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
