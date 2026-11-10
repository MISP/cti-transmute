// ─────────────────────────────────────────────────────────────────────────────
//  VitrineTable — a Vue wrapper around Vitrine's <vt-table>.
//
//    <vitrine-table :rows="items" :columns="cols" row-key="id"
//                   @activate="row => …"></vitrine-table>
//
//  Sorting, per-column filters, search, column chooser, resizing, CSV / TSV
//  copy and download and a card layout on narrow screens come from Vitrine.
//  Rows are handed over as data, never as HTML.
// ─────────────────────────────────────────────────────────────────────────────

import { useVitrine } from './vitrine.js'
import { getTextColor, nameToColor } from './tags/utils/galaxie.js'

/**
 * A server-driven table keeps no local filter: hide <vt-table>'s "Show filters"
 * toggle. It only carries the generic `button` part, so the rule goes into the
 * element's own (open) shadow root.
 */
function hideLocalFilter(table) {
    const add = () => {
        const root = table.shadowRoot
        if (!root || root.querySelector('style[data-cti]')) return !!root
        const st = document.createElement('style')
        st.dataset.cti = 'no-local-filter'
        st.textContent = 'button[data-focus-key="filters"]{display:none!important}'
        root.append(st)
        return true
    }
    if (!add()) customElements.whenDefined('vt-table').then(() => requestAnimationFrame(add))
}

export const VitrineTable = {
    props: {
        rows: { type: Array, default: () => [] },
        columns: { type: Array, default: null },
        rowKey: { type: String, default: 'id' },
        label: { type: String, default: '' },
        pageSize: { type: Number, default: 50 },
        persist: { type: String, default: '' },
        // The page has its own filters: no second search bar or filter row in the table.
        search: { type: Boolean, default: false },
        // Rows already sorted and paginated by the server: no local sort or pager.
        serverSide: { type: Boolean, default: false },
    },
    emits: ['activate'],
    template: `<div ref="host" class="vt-table-host"></div>`,
    setup(props, { emit }) {
        const { ref, watch, onMounted } = Vue
        const host = ref(null)
        let table = null

        async function render() {
            if (!host.value) return
            const [ok] = await useVitrine('table')
            if (!ok) { host.value.textContent = 'The table viewer could not load.'; return }
            if (!table) {
                table = document.createElement('vt-table')
                // 'simple' and only what the page needs (a boolean attribute is on as
                // soon as it is present, even as "false", so features are added, not removed).
                table.setAttribute('variant', 'simple')
                // wrap: a cell grows (tags on several lines) instead of being cut.
                for (const a of ['header', 'copy', 'download', 'fullscreen', 'resizable', 'expandable', 'wrap']) table.setAttribute(a, '')
                // Column menus sort and filter locally: only when the data is all here.
                if (!props.serverSide) table.setAttribute('column-menu', '')
                if (props.search) { table.setAttribute('search', ''); table.setAttribute('filters', '') }
                table.setAttribute('row-key', props.rowKey)
                table.setAttribute('page-size', String(props.pageSize))
                if (!props.serverSide) table.setAttribute('sortable', '')
                table.setAttribute('density', 'comfortable')
                if (props.serverSide) {
                    // Sorted and paginated by the server: no local sort, one page.
                    table.setAttribute('page-size', '100')
                    table.classList.add('cti-server-table')
                }
                if (props.label) table.setAttribute('label', props.label)
                if (props.persist) table.setAttribute('persist', props.persist)
                table.addEventListener('vt-row-activate', (e) => emit('activate', e.detail?.row))
                host.value.replaceChildren(table)
                if (props.serverSide) hideLocalFilter(table)
            }
            // Server-driven: no local filtering or sorting at all (it would only act on
            // the rows of this page, not on the conversions the server holds).
            if (props.columns) table.columns = props.serverSide
                ? props.columns.map((c) => ({ ...c, filterable: false, sortable: false }))
                : props.columns
            table.data = props.rows.map((r) => ({ ...r }))
        }

        onMounted(render)
        watch(() => [props.rows, props.columns], render, { deep: false })
        return { host }
    },
}

/** A site colour token's current value (badges take literal colours). */
const cssVar = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

/** A server timestamp without a zone is UTC: say so, or it reads as local time. */
export const utc = (v) => !v ? null : (/[zZ]|[+-]\d\d:?\d\d$/.test(v) ? v : `${String(v).replace(' ', 'T')}Z`)

/** The conversions of a history page as a table: name, type, author, tags… */
const SVG = {
    open: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
}

/** "namespace:value" as the cards show it (SingleTagDisplay). */
function tagLabel(name) {
    if (!name) return ''
    let ns = ''
    if (name.includes(':')) ns = name.startsWith('misp-galaxy:') && name.includes('=') ? name.split(':')[1].split('=')[0] : name.split(':')[0]
    const m = name.match(/="(.+)"$/)
    const val = m ? m[1] : (name.includes(':') ? name.split(':').slice(1).join(':') : name)
    return ns ? `${ns}:${val}` : val
}

const TAG_GLYPH = '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Zm4.5-4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/></svg>'

/** A tag as the cards draw it: dark icon part, coloured name part (text only). */
function tagChip(name, color) {
    const bg = /^#[0-9a-fA-F]{6}$/.test(color || '') ? color : nameToColor(name || 'tag')
    const pill = document.createElement('span')
    pill.title = name
    pill.style.cssText = 'display:inline-flex;border-radius:.5rem;overflow:hidden;font:800 .78rem/1 var(--font-ui,system-ui);' +
        'box-shadow:1px 3px 5px rgba(0,0,0,.22);vertical-align:middle;max-width:100%'
    const left = document.createElement('span')
    left.style.cssText = 'display:flex;align-items:center;padding:.32rem .5rem;background:#343a40;color:#fff;flex-shrink:0'
    left.innerHTML = TAG_GLYPH
    const right = document.createElement('span')
    right.textContent = tagLabel(name)
    right.style.cssText = `display:block;padding:.32rem .6rem;white-space:normal;overflow-wrap:anywhere;` +
        `background:${bg};color:${getTextColor(bg)}`
    pill.append(left, right)
    return pill
}

/** The "+N" after the first tags. */
function moreChip(n) {
    const c = document.createElement('span')
    c.textContent = `+${n}`
    c.style.cssText = 'display:inline-flex;align-items:center;padding:.32rem .55rem;border-radius:.5rem;font:700 .75rem/1 var(--font-ui,system-ui);' +
        'background:var(--surface-2,#f1f5f9);color:var(--text-2,#475569);border:1px solid var(--border,#e3e8f0)'
    return c
}

/** A small button for a table cell (it lives in Vitrine's shadow DOM, so it is
 *  styled with the site's CSS variables, not with Bootstrap classes). */
function cellButton(icon, title, onClick, { tone = 'default', filled = false } = {}) {
    const b = document.createElement('button')
    b.type = 'button'
    b.title = title
    b.setAttribute('aria-label', title)
    const color = tone === 'danger' ? 'var(--danger,#ef4444)' : tone === 'star' ? 'var(--warning,#f59e0b)' : 'var(--accent,#2563eb)'
    b.style.cssText = 'display:inline-grid;place-items:center;width:30px;height:30px;margin-right:6px;padding:0;cursor:pointer;' +
        `border:1px solid var(--border,#e3e8f0);border-radius:var(--radius-sm,6px);background:var(--surface,#fff);color:${color}`
    b.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVG[icon]}</svg>`
    b.addEventListener('click', (e) => { e.stopPropagation(); onClick() })
    return b
}

/**
 * The conversions of a history page as a table. The page owns the data: the
 * server filters, sorts and paginates (50 a page); this only draws the rows
 * and hands the actions back to the page.
 *
 *   <history-table :rows="conversion_history" :can-edit="fn" :signed-in="bool"
 *       @favorite="toggleFavorite(item)" @delete="openDelete(id)"></history-table>
 */
export const HistoryTable = {
    components: { 'vitrine-table': VitrineTable },
    props: {
        rows: { type: Array, default: () => [] },
        signedIn: { type: Boolean, default: false },
        canEdit: { type: Function, default: () => false },
    },
    emits: ['favorite', 'delete'],
    template: `<vitrine-table :rows="flat" :columns="columns" row-key="id" label="Conversions"
        persist="cti-history-table" server-side @activate="open"></vitrine-table>`,
    setup(props, { emit }) {
        const { computed } = Vue
        const byId = computed(() => new Map(props.rows.map((c) => [c.id, c])))
        const flat = computed(() => props.rows.map((c) => ({
            id: c.id,
            name: c.name || `Conversion #${c.id}`,
            type: c.conversion_type === 'MISP_TO_STIX' ? 'MISP → STIX' : c.conversion_type === 'STIX_TO_MISP' ? 'STIX → MISP' : (c.conversion_type || ''),
            author: c.author || '',
            visibility: c.public ? 'Public' : 'Private',
            tags: (c.tags || []).map((t) => t.tag_name || t.name).filter(Boolean),
            created: utc(c.created_at),
            updated: utc(c.updated_at),
            description: c.description || '',
            // Read here so that toggling a favorite rebuilds the rows (and the star).
            actions: c.is_favorite ? 'favorite' : '',
        })))
        // Each tag keeps the colour it has everywhere else on the site.
        const tagColors = computed(() => {
            const map = {}
            for (const c of props.rows) for (const t of c.tags || []) {
                const name = t.tag_name || t.name
                const color = t.color || t.colour || t.tag_color
                if (name && color) map[name] = color
            }
            return map
        })
        const open = (row) => { if (row?.id) window.location.href = `/conversions/detail/${row.id}` }
        const columns = computed(() => [
            {
                key: 'actions', label: 'Actions', width: 130, sortable: false, filterable: false,
                render: (_, row) => {
                    const item = byId.value.get(row.id)
                    const box = document.createElement('span')
                    box.append(cellButton('open', 'Open', () => open(row)))
                    if (props.signedIn && item) box.append(cellButton('star', item.is_favorite ? 'Remove from favorites' : 'Add to favorites',
                        () => emit('favorite', item), { tone: 'star', filled: !!item.is_favorite }))
                    if (item && props.canEdit(item)) box.append(cellButton('trash', 'Delete', () => emit('delete', item.id), { tone: 'danger' }))
                    return box
                },
            },
            { key: 'name', label: 'Name', width: 300 },
            // Vitrine's badge palette is named: the closest to the site's tokens.
            { key: 'type', label: 'Direction', display: 'badge', width: 130,
              colors: { 'MISP → STIX': 'blue', 'STIX → MISP': 'teal' } },
            { key: 'author', label: 'Author', width: 140 },
            { key: 'visibility', label: 'Visibility', display: 'badge', width: 110,
              colors: { Public: 'green', Private: 'gray' } },
            {
                // Tags keep their own colour, exactly as on the cards.
                key: 'tags', label: 'Tags', width: 300, sortable: false,
                render: (value) => {
                    const box = document.createElement('span')
                    // Tags go to the next line rather than being cut (the table wraps).
                    box.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;padding:3px 0;white-space:normal'
                    for (const name of (value || []).slice(0, 6)) box.append(tagChip(name, tagColors.value[name]))
                    if ((value || []).length > 6) box.append(moreChip(value.length - 6))
                    return box
                },
            },
            { key: 'created', label: 'Created', type: 'date', display: 'relative', width: 140 },
            { key: 'updated', label: 'Updated', type: 'date', display: 'relative', width: 140, hidden: true },
            { key: 'description', label: 'Description', maxLength: 160, hidden: true },
        ])
        return { flat, columns, open }
    },
}

// ─────────────────────────────────────────────────────────────────────────────
//  ActivityTimeline — the public activity feed as Vitrine's <vt-timeline>.
//  Events are grouped by day, coloured by kind, searchable, and each title
//  links to its Conversion. Text only: titles and details are never HTML.
// ─────────────────────────────────────────────────────────────────────────────

const ACTIVITY = {
    conversion_created: { verb: 'created', kind: 'success' },
    conversion_edited: { verb: 'updated', kind: 'changed' },
    conversion_visibility_changed: { verb: 'made public', kind: 'release' },
    conversion_favorited: { verb: 'favorited', kind: 'info' },
    eval_like: { verb: 'liked', kind: 'success' },
    eval_dislike: { verb: 'disliked', kind: 'warning' },
    eval_reaction: { verb: 'reacted to', kind: 'info' },
}

export const ActivityTimeline = {
    props: { items: { type: Array, default: () => [] }, limit: { type: Number, default: 30 } },
    template: `<div ref="host" class="vt-timeline-host"></div>`,
    setup(props) {
        const { ref, watch, onMounted } = Vue
        const host = ref(null)
        async function render() {
            if (!host.value) return
            const [ok] = await useVitrine('timeline')
            if (!ok) { host.value.textContent = 'The activity could not be shown.'; return }
            const events = props.items.slice(0, props.limit).map((a) => {
                const conf = ACTIVITY[a.event_type] ?? { verb: String(a.event_type || '').replace(/_/g, ' '), kind: 'neutral' }
                const reaction = (a.details || '').match(/'([^']+)'/)?.[1]
                return {
                    id: String(a.id),
                    time: utc(a.created_at),
                    title: `${a.actor_name || 'Someone'} ${conf.verb} ${a.target_name || 'a conversion'}`,
                    kind: conf.kind,
                    tags: reaction ? [reaction] : [],
                    link: a.target_id ? `${location.origin}/conversions/detail/${a.target_id}` : undefined,
                }
            })
            const el = document.createElement('vt-timeline')
            el.setAttribute('group', 'day')
            el.setAttribute('collapse', '2')
            el.setAttribute('max-height', '440px')
            el.content = JSON.stringify(events)
            host.value.replaceChildren(el)
        }
        onMounted(render)
        watch(() => props.items, render)
        return { host }
    },
}
