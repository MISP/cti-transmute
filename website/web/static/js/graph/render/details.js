// ─────────────────────────────────────────────────────────────────────────────
//  Details — what the sidebar and the tooltip say about one node or edge.
//
//  Never a JSON dump: each kind of element has its own sections, in a fixed
//  order (see SECTIONS). A section with nothing to say is not drawn, and a
//  field with no value is skipped. The raw document is still there, as the
//  last section, folded.
//
//  Everything converted is written with textContent: a value coming from a
//  converted document never reaches innerHTML. The only markup set directly
//  is our own (icons are `<i class>` elements).
// ─────────────────────────────────────────────────────────────────────────────

import { TLP, FAMILIES, EDGE_KINDS, RELATION_COLORS } from '../model/vocabulary.js'

// ── tiny DOM helpers ────────────────────────────────────────────────────────
function h(tag, cls, ...children) {
    const el = document.createElement(tag)
    if (cls) el.className = cls
    for (const c of children.flat(Infinity)) {
        if (c === null || c === undefined || c === false) continue
        el.append(c instanceof Node ? c : document.createTextNode(String(c)))
    }
    return el
}
const icon = (name, color) => {
    const i = h('i', `fa-solid ${name}`)
    if (color) i.style.color = color
    i.setAttribute('aria-hidden', 'true')
    return i
}

const DATE_FMT = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const DAY_FMT = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })
function fmtDate(v) {
    if (!v) return null
    const d = new Date(v)
    if (isNaN(d)) return String(v)
    return (d.getUTCHours() || d.getUTCMinutes()) ? DATE_FMT.format(d) : DAY_FMT.format(d)
}

const isHash = (s) => /^[a-f0-9]{32,128}$/i.test(String(s))
const isUrl = (s) => /^https?:\/\/\S+$/i.test(String(s))

/** A value cell: links stay links (opened in a new tab), hashes are monospace, all copyable. */
function value(v, { mono = false, copy = false } = {}) {
    if (v === null || v === undefined || v === '') return null
    if (typeof v === 'boolean') return h('span', `ctx-d-flag ${v ? 'on' : 'off'}`, v ? 'Yes' : 'No')
    const text = String(v)
    let el
    if (isUrl(text)) {
        el = h('a', 'ctx-d-link', text)
        el.href = text; el.target = '_blank'; el.rel = 'noopener noreferrer'
    } else {
        el = h('span', (mono || isHash(text)) ? 'ctx-d-mono' : null, text)
    }
    if (!copy) return el
    const btn = h('button', 'ctx-d-copy', icon('fa-copy'))
    btn.type = 'button'; btn.title = 'Copy'
    btn.addEventListener('click', (e) => {
        e.stopPropagation()
        navigator.clipboard?.writeText(text).then(() => {
            btn.replaceChildren(icon('fa-check')); setTimeout(() => btn.replaceChildren(icon('fa-copy')), 1200)
        }).catch(() => {})
    })
    return h('span', 'ctx-d-copyable', el, btn)
}

function chips(list, colorOf) {
    if (!list?.length) return null
    return h('span', 'ctx-d-chips', list.map(t => {
        const name = typeof t === 'string' ? t : t.name
        const c = h('span', 'ctx-d-chip', name)
        const col = colorOf?.(t)
        if (col) { c.style.background = col; c.style.color = readableOn(col); c.style.borderColor = col }
        return c
    }))
}

function readableOn(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex ?? '')
    if (!m) return 'inherit'
    const n = parseInt(m[1], 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#111827' : '#ffffff'
}

/** Rows of [label, value]; rows with no value are dropped, a section with no rows too. */
function rows(pairs) {
    const kept = pairs.filter(([, v]) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && !v.length))
    if (!kept.length) return null
    return h('dl', 'ctx-d-rows', kept.map(([k, v]) => [h('dt', null, k), h('dd', null, v instanceof Node ? v : value(v))]))
}

function section(title, body, { open = true, iconName } = {}) {
    if (!body) return null
    const d = h('details', 'ctx-d-section')
    d.open = open
    d.append(h('summary', null, iconName ? icon(iconName) : null, title), body)
    return d
}

function tlpPill(key) {
    const t = TLP[key]
    if (!t) return null
    const p = h('span', 'ctx-d-tlp', t.label)
    p.style.background = '#000'; p.style.color = t.color === '#ffffff' ? '#fff' : t.color
    return p
}

// ── header ──────────────────────────────────────────────────────────────────
function header(d) {
    const fam = FAMILIES[d.family]
    const badge = h('span', 'ctx-d-badge', icon(d.icon, d.color))
    badge.style.borderColor = d.color
    const sub = h('div', 'ctx-d-sub',
        h('span', 'ctx-d-type', d.typeLabel),
        h('span', 'ctx-d-dot', '·'),
        h('span', null, fam?.label ?? d.family),
        h('span', 'ctx-d-dot', '·'),
        h('span', 'ctx-d-side', d.side === 'misp' ? 'MISP' : 'STIX'),
        d.tlp ? tlpPill(d.tlp) : null)
    return h('div', 'ctx-d-head', badge, h('div', 'ctx-d-titles',
        h('div', 'ctx-d-value', value(d.value || d.label, { copy: true })), sub))
}

// ── per-kind sections ───────────────────────────────────────────────────────
const tags = (d) => section('Context', rows([
    ['Tags', chips(d.tags, t => t.colour)],
]), { iconName: 'fa-tags' })

function sightingsSection(s) {
    if (!s?.total) return null
    return section('Sightings', rows([
        ['Seen', s.seen ?? s.total], ['False positive', s.falsePositive || null],
        ['Expired', s.expired || null], ['Sources', chips(s.sources)],
    ]), { iconName: 'fa-eye' })
}

function killChain(list) {
    if (!list?.length) return null
    return chips(list.map(p => `${p.phase}`), () => null)
}

function externalRefs(list) {
    if (!list?.length) return null
    return h('ul', 'ctx-d-list', list.map(r => h('li', null,
        h('strong', null, r.source || 'reference'), r.id ? ` ${r.id}` : '',
        r.url ? h('div', null, value(r.url)) : null,
        r.description ? h('div', 'ctx-d-muted', r.description) : null)))
}

function attributeTable(attrs) {
    if (!attrs?.length) return null
    const t = h('table', 'ctx-d-table')
    t.append(h('tbody', null, attrs.map(a => h('tr', null,
        h('th', null, a.relation), h('td', null, value(a.value, { copy: true }), a.toIds ? h('span', 'ctx-d-ids', 'IDS') : null)))))
    return t
}

function patternBlock(pattern, observables) {
    if (!pattern) return null
    const pre = h('pre', 'ctx-d-pattern', pattern.replace(/\s+(AND|OR|FOLLOWEDBY)\s+/g, '\n$1 '))
    return h('div', null, pre, observables?.length
        ? rows(observables.map(o => [o.path === 'value' ? o.type : `${o.type} ${o.path}`, value(o.value, { copy: true })]))
        : null)
}

function description(text) {
    if (!text) return null
    return h('p', 'ctx-d-text', text)
}

const SECTIONS = {
    event: (d, f) => [
        section('Summary', rows([
            ['Date', fmtDate(f.date)], ['Organisation', f.org], ['Threat level', f.threatLevel],
            ['Analysis', f.analysis], ['Distribution', f.distribution], ['Published', f.published],
            ['Last change', fmtDate(f.timestamp)],
        ]), { iconName: 'fa-circle-info' }),
        section('Content', rows([['Attributes', f.attributeCount], ['Objects', f.objectCount]]), { iconName: 'fa-cubes' }),
        tags(d),
        section('Reports', f.reports?.length ? h('ul', 'ctx-d-list', f.reports.map(r => h('li', null, r.name))) : null, { iconName: 'fa-file-lines' }),
    ],
    attribute: (d, f) => [
        section('Classification', rows([
            ['Type', f.attributeType], ['Category', f.category], ['Object relation', f.relation],
            ['For detection (to_ids)', f.toIds], ['Distribution', f.distribution],
        ]), { iconName: 'fa-shapes' }),
        section('Time', rows([
            ['First seen', fmtDate(f.firstSeen)], ['Last seen', fmtDate(f.lastSeen)], ['Last change', fmtDate(f.timestamp)],
        ]), { iconName: 'fa-clock' }),
        tags(d),
        sightingsSection(f.sightings),
        section('Comment', description(f.comment), { iconName: 'fa-comment' }),
        section('Belongs to', rows([['Object', f.parentObject?.name]]), { iconName: 'fa-cube' }),
    ],
    object: (d, f) => [
        section('Attributes', attributeTable(f.attributes), { iconName: 'fa-list' }),
        section('Object', rows([
            ['Template', f.objectName], ['Meta-category', f.metaCategory], ['Distribution', f.distribution],
            ['First seen', fmtDate(f.firstSeen)], ['Last seen', fmtDate(f.lastSeen)],
        ]), { iconName: 'fa-cube' }),
        section('Comment', description(f.comment), { iconName: 'fa-comment' }),
    ],
    galaxy: (d, f) => [
        section('Description', description(f.description), { iconName: 'fa-align-left' }),
        section('Cluster', rows([
            ['Galaxy', f.galaxy], ['ID', f.externalId], ['Synonyms', chips(f.synonyms)],
        ]), { iconName: 'fa-circle-nodes' }),
        section('References', f.refs?.length ? h('ul', 'ctx-d-list', f.refs.slice(0, 8).map(u => h('li', null, value(u)))) : null, { iconName: 'fa-link', open: false }),
    ],
    tag: () => [],
    indicator: (d, f) => [
        section('Pattern', patternBlock(f.pattern, f.patternObservables), { iconName: 'fa-code' }),
        section('Validity', rows([
            ['Valid from', fmtDate(f.valid_from)], ['Valid until', fmtDate(f.valid_until)],
            ['Indicator types', chips(f.indicator_types)], ['Kill chain', killChain(f.killChain)],
        ]), { iconName: 'fa-clock' }),
        section('Description', description(f.description), { iconName: 'fa-align-left' }),
        sightingsSection(f.sightings),
        tags(d), provenance(f),
    ],
    sco: (d, f) => [
        section('Properties', rows(scoRows(d.raw)), { iconName: 'fa-list' }),
        section('Observed', rows([
            ['First observed', fmtDate(f.observed?.firstObserved)], ['Last observed', fmtDate(f.observed?.lastObserved)],
            ['Times observed', f.observed?.numberObserved],
        ]), { iconName: 'fa-eye' }),
        provenance(f),
    ],
    sdo: (d, f) => [
        section('Description', description(f.description), { iconName: 'fa-align-left' }),
        section('Properties', rows(sdoRows(f)), { iconName: 'fa-list' }),
        section('Kill chain', killChain(f.killChain), { iconName: 'fa-route' }),
        section('External references', externalRefs(f.externalReferences), { iconName: 'fa-link' }),
        sightingsSection(f.sightings),
        tags(d), provenance(f),
    ],
}

const PRETTY = (k) => k.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase())

function sdoRows(f) {
    const skip = new Set(['stixType', 'description', 'created', 'modified', 'createdBy', 'confidence', 'killChain',
        'externalReferences', 'origin', 'sightings', 'category', 'toIds', 'pattern', 'patternObservables', 'hashes', 'observed'])
    return Object.entries(f).filter(([k]) => !skip.has(k)).map(([k, v]) =>
        [PRETTY(k), Array.isArray(v) ? chips(v.map(String)) : (/_seen$|^first|^last|published|valid/.test(k) ? fmtDate(v) : v)])
}

function scoRows(raw = {}) {
    const out = []
    for (const [k, v] of Object.entries(raw)) {
        if (['type', 'id', 'spec_version', 'object_marking_refs', 'defanged'].includes(k) || /_refs?$/.test(k)) continue
        if (k === 'hashes' && v && typeof v === 'object') {
            for (const [algo, hash] of Object.entries(v)) out.push([algo, value(hash, { copy: true, mono: true })])
        } else if (v && typeof v === 'object') {
            out.push([PRETTY(k), value(Array.isArray(v) ? v.join(', ') : JSON.stringify(v))])
        } else out.push([PRETTY(k), k === 'value' || k === 'name' ? value(v, { copy: true }) : v])
    }
    return out
}

function provenance(f) {
    return section('Provenance', rows([
        ['Created by', f.createdBy], ['Created', fmtDate(f.created)], ['Modified', fmtDate(f.modified)],
        ['Confidence', f.confidence], ['From MISP', f.origin ? [f.origin.type || f.origin.name, f.origin.category].filter(Boolean).join(' · ') : null],
    ]), { iconName: 'fa-fingerprint', open: false })
}

function rawSection(raw) {
    if (!raw) return null
    const pre = h('pre', 'ctx-d-raw')
    const d = section('Raw document', pre, { open: false, iconName: 'fa-code' })
    // Serialise only when opened: a large object costs nothing until asked for.
    d.addEventListener('toggle', () => { if (d.open && !pre.textContent) pre.textContent = JSON.stringify(raw, null, 2) })
    return d
}

// ── public ─────────────────────────────────────────────────────────────────

/** The sidebar body for one node. */
export function nodeDetails(node) {
    ensureStyles()
    const d = node.getData() ?? {}
    if (!d.kind) return null      // a Simplify group: Pivotick's own panel lists its members
    const build = SECTIONS[d.kind] ?? SECTIONS.sdo
    return h('div', 'ctx-d', header(d), build(d, d.fields ?? {}), rawSection(d.raw))
}

function edgeEnd(node) {
    const d = node?.getData?.() ?? {}
    const c = h('span', 'ctx-d-end', d.icon ? icon(d.icon, d.color) : null, d.label ?? node?.id ?? '?')
    return c
}

/** The sidebar body for one edge. */
export function edgeDetails(edge) {
    ensureStyles()
    const d = edge.getData() ?? {}
    const kind = EDGE_KINDS[d.kind]
    const color = RELATION_COLORS[d.relation] ?? kind?.color
    const rel = h('span', 'ctx-d-rel', d.relation || kind?.label || 'link')
    if (color) { rel.style.borderColor = color; rel.style.color = color }
    return h('div', 'ctx-d',
        h('div', 'ctx-d-edge', edgeEnd(edge.source ?? edge.from), h('span', 'ctx-d-arrow', '→'), rel, h('span', 'ctx-d-arrow', '→'), edgeEnd(edge.target ?? edge.to)),
        section('Link', rows([
            ['Kind', kind?.label], ['Relation', d.relation], ['Description', d.description],
            ['Start', fmtDate(d.startTime)], ['Stop', fmtDate(d.stopTime)], ['Confidence', d.confidence],
            ['Times sighted', d.kind === 'sighting' ? d.count : null],
            ['First seen', fmtDate(d.firstSeen)], ['Last seen', fmtDate(d.lastSeen)], ['Comment', d.comment],
        ]), { iconName: 'fa-link' }),
        rawSection(d.raw))
}

/** One fact line of the hover card: icon, label, value. Nothing for an empty value. */
function fact(iconName, label, v, opts) {
    const el = value(v, opts)
    if (!el) return null
    return h('div', 'ctx-t-fact', icon(iconName), h('span', 'ctx-t-key', label), h('span', 'ctx-t-val', el))
}

/**
 * The hover card, under Pivotick's own header: the TLP, a few facts, each
 * with its icon and chosen per kind (empty ones are skipped), and the tags.
 */
export function nodeTooltip(node) {
    ensureStyles()
    const d = node.getData() ?? {}
    if (!d.kind) return null
    const f = d.fields ?? {}
    const facts = {
        event: [fact('fa-calendar', 'Date', fmtDate(f.date)), fact('fa-building', 'Org', f.org),
            fact('fa-gauge-high', 'Threat level', f.threatLevel), fact('fa-cubes', 'Content', f.attributeCount ? `${f.attributeCount} attributes · ${f.objectCount} objects` : null)],
        attribute: [fact('fa-shapes', 'Category', f.category), fact('fa-bullseye', 'For detection', f.toIds),
            fact('fa-clock', 'Last seen', fmtDate(f.lastSeen)), fact('fa-cube', 'In object', f.parentObject?.name),
            fact('fa-comment', 'Comment', f.comment)],
        object: (f.attributes ?? []).slice(0, 4).map(a => fact('fa-angle-right', a.relation, a.value)),
        galaxy: [fact('fa-circle-nodes', 'Galaxy', f.galaxy), fact('fa-hashtag', 'ID', f.externalId),
            fact('fa-align-left', 'About', f.description ? f.description.slice(0, 160) + (f.description.length > 160 ? '…' : '') : null)],
        tag: [],
        indicator: [fact('fa-code', 'Pattern', f.pattern, { mono: true }), fact('fa-clock', 'Valid from', fmtDate(f.valid_from)),
            fact('fa-route', 'Kill chain', f.killChain?.map(k => k.phase).join(', ') || null)],
        sco: [fact('fa-eye', 'First observed', fmtDate(f.observed?.firstObserved)),
            ...(d.raw?.hashes ? Object.entries(d.raw.hashes).slice(0, 2).map(([k, v]) => fact('fa-hashtag', k, v, { mono: true })) : [])],
        sdo: [fact('fa-align-left', 'About', f.description ? f.description.slice(0, 160) + (f.description.length > 160 ? '…' : '') : null),
            fact('fa-tags', 'Aliases', (f.aliases ?? []).join(', ') || null),
            fact('fa-user-pen', 'Created by', f.createdBy)],
    }[d.kind] ?? []
    if (f.sightings?.total) facts.push(fact('fa-eye', 'Sightings', String(f.sightings.total)))
    const kept = facts.filter(Boolean).slice(0, 4)
    const more = d.kind === 'object' && (f.attributes?.length ?? 0) > 4 ? h('div', 'ctx-d-muted', `+ ${f.attributes.length - 4} more attributes`) : null
    // Pivotick draws the header (icon, title, subtitle from graphView's
    // tooltip.nodeHeaderMap); this card only adds what it does not say.
    return h('div', 'ctx-d ctx-d-tip',
        d.tlp ? h('div', null, tlpPill(d.tlp)) : null,
        kept.length ? h('div', 'ctx-t-facts', kept) : null, more,
        d.tags?.length ? chips(d.tags.slice(0, 5), t => t.colour) : null,
        h('div', 'ctx-t-hint', 'Click for all details'))
}

export function edgeTooltip(edge) {
    ensureStyles()
    const d = edge.getData() ?? {}
    const kind = EDGE_KINDS[d.kind]
    const rel = h('span', 'ctx-d-rel', d.relation || kind?.label || 'link')
    const color = RELATION_COLORS[d.relation] ?? kind?.color
    if (color) { rel.style.borderColor = color; rel.style.color = color }
    const facts = [fact('fa-link', 'Kind', kind?.label), fact('fa-align-left', 'About', d.description),
        fact('fa-eye', 'Times sighted', d.kind === 'sighting' ? d.count : null)].filter(Boolean)
    return h('div', 'ctx-d ctx-d-tip',
        h('div', 'ctx-d-edge', edgeEnd(edge.source ?? edge.from), h('span', 'ctx-d-arrow', '→'), rel, h('span', 'ctx-d-arrow', '→'), edgeEnd(edge.target ?? edge.to)),
        facts.length ? h('div', 'ctx-t-facts', facts) : null)
}

/** Under a Simplify group's tooltip: its first members, each with its icon. */
export function groupTooltipExtra(group) {
    ensureStyles()
    const members = (group.members ?? []).slice(0, 6)
    if (!members.length) return null
    const more = (group.members?.length ?? 0) - members.length
    return h('div', 'ctx-d ctx-d-tip',
        h('div', 'ctx-t-facts', members.map(n => {
            const d = n.getData?.() ?? {}
            return h('div', 'ctx-t-member', d.icon ? icon(d.icon, d.color) : null, h('span', 'ctx-t-val', d.value || d.label || n.id))
        })),
        more > 0 ? h('div', 'ctx-t-hint', `and ${more} more · double-click to open`) : null)
}

// ── styles (once) ───────────────────────────────────────────────────────────
let styled = false
function ensureStyles() {
    if (styled || typeof document === 'undefined') return
    styled = true
    const css = `
.ctx-d{font-size:13px;line-height:1.45;color:var(--pvt-text-color,inherit);display:flex;flex-direction:column;gap:10px;min-width:0}
.ctx-d-head{display:flex;gap:10px;align-items:flex-start}
.ctx-d-badge{flex:none;width:34px;height:34px;border-radius:50%;border:2px solid;display:grid;place-items:center;font-size:15px;background:var(--pvt-bg, #fff)}
.ctx-d-titles{min-width:0;display:flex;flex-direction:column;gap:2px}
.ctx-d-value{font-weight:600;font-size:14px;overflow-wrap:anywhere}
.ctx-d-sub{display:flex;flex-wrap:wrap;gap:4px;align-items:center;font-size:12px;opacity:.75}
.ctx-d-type{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.ctx-d-dot{opacity:.5}
.ctx-d-side{font-weight:600;letter-spacing:.04em}
.ctx-d-tlp{font:700 10px/1 ui-monospace,monospace;padding:3px 6px;border-radius:3px;margin-left:4px;opacity:1}
.ctx-d-section{border-top:1px solid var(--pvt-border-color,rgba(127,127,127,.25));padding-top:6px}
.ctx-d-section>summary{cursor:pointer;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;opacity:.7;display:flex;gap:6px;align-items:center;list-style:none;padding:2px 0}
.ctx-d-section>summary::-webkit-details-marker{display:none}
.ctx-d-section>summary::after{content:'▾';margin-left:auto;opacity:.6}
.ctx-d-section:not([open])>summary::after{content:'▸'}
.ctx-d-rows{display:grid;grid-template-columns:minmax(80px,auto) 1fr;gap:3px 12px;margin:6px 0 2px}
.ctx-d-rows dt{opacity:.65;font-size:12px}
.ctx-d-rows dd{margin:0;min-width:0;overflow-wrap:anywhere}
.ctx-d-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;overflow-wrap:anywhere}
.ctx-d-link{color:var(--pvt-primary-color,#2563eb);overflow-wrap:anywhere}
.ctx-d-copyable{display:inline-flex;gap:6px;align-items:baseline;min-width:0}
.ctx-d-copy{border:0;background:none;padding:0 2px;cursor:pointer;opacity:.45;color:inherit;font-size:11px}
.ctx-d-copy:hover,.ctx-d-copy:focus-visible{opacity:1}
.ctx-d-flag{font-size:11px;font-weight:600;padding:1px 7px;border-radius:8px}
.ctx-d-flag.on{background:rgba(22,163,74,.15);color:#15803d}
.ctx-d-flag.off{background:rgba(127,127,127,.15)}
.ctx-d-chips{display:flex;flex-wrap:wrap;gap:4px}
.ctx-d-chip{font-size:11px;padding:1px 7px;border-radius:9px;border:1px solid rgba(127,127,127,.35)}
.ctx-d-table{border-collapse:collapse;width:100%;margin-top:6px}
.ctx-d-table th{text-align:left;font-weight:500;opacity:.65;font-size:12px;padding:3px 10px 3px 0;vertical-align:top;white-space:nowrap}
.ctx-d-table td{padding:3px 0;overflow-wrap:anywhere}
.ctx-d-table tr+tr{border-top:1px solid rgba(127,127,127,.15)}
.ctx-d-ids{font:700 9px/1 system-ui;margin-left:6px;white-space:nowrap;display:inline-block;padding:2px 4px;border-radius:3px;background:rgba(124,58,237,.15);color:#7c3aed}
.ctx-d-pattern{font:12px/1.5 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere;background:rgba(127,127,127,.1);padding:8px;border-radius:4px;margin:6px 0}
.ctx-d-raw{font:11px/1.45 ui-monospace,monospace;max-height:320px;overflow:auto;background:rgba(127,127,127,.1);padding:8px;border-radius:4px;margin:6px 0}
.ctx-d-text{margin:6px 0;white-space:pre-wrap}
.ctx-d-list{margin:6px 0;padding-left:18px}
.ctx-d-muted{opacity:.65;font-size:12px}
.ctx-d-edge{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.ctx-d-end{display:inline-flex;gap:5px;align-items:center;font-weight:600;overflow-wrap:anywhere}
.ctx-d-arrow{opacity:.5}
.ctx-d-rel{font-size:12px;font-weight:600;padding:1px 8px;border:1.5px solid;border-radius:10px}
.ctx-d-tip{max-width:340px;gap:6px;white-space:normal;overflow-wrap:anywhere}
.ctx-d-tip *{white-space:normal}
.ctx-d-tip{padding:2px}
.ctx-d-tip .ctx-d-head{padding-bottom:8px;border-bottom:1px solid var(--pvt-border-color,rgba(127,127,127,.25))}
.ctx-t-facts{display:flex;flex-direction:column;gap:5px}
.ctx-t-fact{display:grid;grid-template-columns:16px auto 1fr;gap:6px;align-items:baseline;font-size:12.5px}
.ctx-t-fact>i{opacity:.55;font-size:11px;text-align:center}
.ctx-t-key{opacity:.65;white-space:nowrap}
.ctx-t-val{min-width:0;overflow-wrap:anywhere;font-weight:500}
.ctx-t-hint{font-size:11px;opacity:.5;padding-top:2px}
.ctx-t-member{display:grid;grid-template-columns:16px 1fr;gap:6px;align-items:baseline;font-size:12.5px}
.ctx-t-member>i{font-size:11px;text-align:center}
.ctx-d-tip .ctx-d-rows{grid-template-columns:auto 1fr}
`
    const el = document.createElement('style')
    el.dataset.ctx = 'graph-details'
    el.textContent = css
    document.head.appendChild(el)
}
