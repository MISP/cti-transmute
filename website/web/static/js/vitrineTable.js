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

export const VitrineTable = {
    props: {
        rows: { type: Array, default: () => [] },
        columns: { type: Array, default: null },
        rowKey: { type: String, default: 'id' },
        label: { type: String, default: '' },
        pageSize: { type: Number, default: 50 },
        persist: { type: String, default: '' },
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
                table.setAttribute('variant', 'full')
                table.setAttribute('selectable', 'none')
                table.setAttribute('row-key', props.rowKey)
                table.setAttribute('page-size', String(props.pageSize))
                table.setAttribute('density', 'comfortable')
                if (props.label) table.setAttribute('label', props.label)
                if (props.persist) table.setAttribute('persist', props.persist)
                table.addEventListener('vt-row-activate', (e) => emit('activate', e.detail?.row))
                host.value.replaceChildren(table)
            }
            if (props.columns) table.columns = props.columns
            table.data = props.rows.map((r) => ({ ...r }))
        }

        onMounted(render)
        watch(() => [props.rows, props.columns], render, { deep: false })
        return { host }
    },
}

/** A server timestamp without a zone is UTC: say so, or it reads as local time. */
export const utc = (v) => !v ? null : (/[zZ]|[+-]\d\d:?\d\d$/.test(v) ? v : `${String(v).replace(' ', 'T')}Z`)

/** The conversions of a history page as a table: name, type, author, tags… */
export const HistoryTable = {
    components: { 'vitrine-table': VitrineTable },
    props: { rows: { type: Array, default: () => [] } },
    template: `<vitrine-table :rows="flat" :columns="columns" row-key="id" label="Conversions"
        persist="cti-history-table" @activate="open"></vitrine-table>`,
    setup(props) {
        const { computed } = Vue
        const flat = computed(() => props.rows.map((c) => ({
            id: c.id,
            name: c.name || `Conversion #${c.id}`,
            type: c.conversion_type === 'MISP_TO_STIX' ? 'MISP → STIX' : c.conversion_type === 'STIX_TO_MISP' ? 'STIX → MISP' : (c.conversion_type || ''),
            author: c.author || '',
            visibility: c.public ? 'Public' : 'Private',
            favorite: c.is_favorite ? '★' : '',
            tags: (c.tags || []).map((t) => t.tag_name || t.name).filter(Boolean),
            created: utc(c.created_at),
            updated: utc(c.updated_at),
            description: c.description || '',
        })))
        const columns = [
            { key: 'name', label: 'Name', width: 280 },
            { key: 'type', label: 'Direction', display: 'badge', width: 130,
              colors: { 'MISP → STIX': '#2563eb', 'STIX → MISP': '#0f766e' } },
            { key: 'author', label: 'Author', width: 140 },
            { key: 'visibility', label: 'Visibility', display: 'badge', width: 110,
              colors: { Public: '#16a34a', Private: '#64748b' } },
            { key: 'favorite', label: '★', width: 60, align: 'center' },
            { key: 'tags', label: 'Tags', display: 'badge', autoColors: true, width: 260 },
            { key: 'created', label: 'Created', type: 'date', display: 'relative', width: 140 },
            { key: 'updated', label: 'Updated', type: 'date', display: 'relative', width: 140, hidden: true },
            { key: 'description', label: 'Description', maxLength: 160, hidden: true },
        ]
        const open = (row) => { if (row?.id) window.location.href = `/conversions/detail/${row.id}` }
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
