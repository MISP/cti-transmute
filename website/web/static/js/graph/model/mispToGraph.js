// ─────────────────────────────────────────────────────────────────────────────
//  MISP → graph model.
//
//  Reads one MISP event, a `{response: [...]}` search result, or a list of
//  events, and returns `{ nodes, edges }` in the common model shared with
//  stixToGraph.js (see `makeNode` / `makeEdge` in model.js).
//
//  What becomes a node:
//    Event                         container
//    Object                        object      (file, domain-ip, email…)
//    Attribute                     observable  (standalone, or inside its object)
//    Galaxy cluster                context     (ATT&CK technique, threat actor…)
//    Tag (only with `tagsAsNodes`) context
//
//  What becomes an edge, by kind:
//    contains      Event → Object / standalone Attribute, Object → its Attributes
//    reference     ObjectReference (relationship_type kept as `relation`)
//    galaxy        Event / Attribute → galaxy cluster (and → tag with tagsAsNodes)
//    sighting      not an edge: counted on the attribute (`sightings`)
//    correlation   same type+value in two different events of the input
//
//  No grouping happens here: folding is Simplify's job, as a view.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, shortLabel, tlpKey, strictestTlp } from './vocabulary.js'
import { makeNode, makeEdge, nodeId } from './model.js'

const THREAT_LEVEL = { 1: 'High', 2: 'Medium', 3: 'Low', 4: 'Undefined' }
const ANALYSIS = { 0: 'Initial', 1: 'Ongoing', 2: 'Complete' }
const DISTRIBUTION = {
    0: 'Your organisation only', 1: 'This community only', 2: 'Connected communities',
    3: 'All communities', 4: 'Sharing group', 5: 'Inherit event',
}

/** Normalise the accepted inputs to a list of bare events. */
export function mispEvents(json) {
    let raw = json
    if (raw && !Array.isArray(raw) && Array.isArray(raw.response)) raw = raw.response
    const list = Array.isArray(raw) ? raw : [raw]
    return list.map(item => item?.Event ?? item).filter(e => e && typeof e === 'object')
}

function tagNames(tags) {
    return (tags ?? []).map(t => t?.name).filter(Boolean)
}

/** Tags without the TLP ones (TLP has its own field and badge). */
function plainTags(tags) {
    return (tags ?? []).filter(t => t?.name && !tlpKey(t.name) && !t.name.startsWith('misp-galaxy:'))
        .map(t => ({ name: t.name, colour: t.colour || null }))
}

function sightingCounts(list) {
    const c = { seen: 0, falsePositive: 0, expired: 0, sources: new Set() }
    for (const s of list ?? []) {
        const t = String(s.type ?? '0')
        if (t === '1') c.falsePositive++
        else if (t === '2') c.expired++
        else c.seen++
        const src = s.source || s.Organisation?.name
        if (src) c.sources.add(src)
    }
    return { ...c, sources: [...c.sources], total: c.seen + c.falsePositive + c.expired }
}

function toDate(v) {
    if (v === undefined || v === null || v === '') return null
    if (/^\d+$/.test(String(v))) return new Date(Number(v) * 1000).toISOString()
    const d = new Date(v)
    return isNaN(d) ? null : d.toISOString()
}

/**
 * @param {object|array} json            the MISP document
 * @param {object} [opts]
 * @param {boolean} [opts.tagsAsNodes]   draw tags as context nodes (Context view)
 * @param {boolean} [opts.galaxies=true] draw galaxy clusters as nodes
 */
export function mispToGraph(json, opts = {}) {
    const { tagsAsNodes = false, galaxies = true } = opts
    const nodes = [], edges = []
    const seen = new Set()
    const byValue = new Map()             // `${type}|${value}` → [{ id, event }]
    const contextNodes = new Map()        // cluster/tag key → node id

    const push = (node) => {
        if (seen.has(node.id)) return false
        seen.add(node.id); nodes.push(node); return true
    }

    const contextNode = (key, build) => {
        if (contextNodes.has(key)) return contextNodes.get(key)
        const node = build()
        push(node)
        contextNodes.set(key, node.id)
        return node.id
    }

    const linkGalaxies = (fromId, galaxyList, eventUuid) => {
        if (!galaxies) return
        for (const g of galaxyList ?? []) {
            for (const c of g.GalaxyCluster ?? []) {
                const key = `cluster:${c.uuid || c.tag_name || c.value}`
                const look = describe('galaxy', c.type || g.type)
                const id = contextNode(key, () => makeNode({
                    id: nodeId('misp', key), side: 'misp', kind: 'galaxy',
                    type: `galaxy:${c.type || g.type}`, typeLabel: g.name || c.type || g.type, look,
                    label: shortLabel(c.value, 32), value: c.value,
                    fields: {
                        galaxy: g.name || g.type, description: c.description || '',
                        externalId: c.meta?.external_id?.[0] || null,
                        synonyms: c.meta?.synonyms || [], refs: c.meta?.refs || [],
                    },
                    uuid: c.uuid, event: eventUuid, raw: c,
                }))
                edges.push(makeEdge(fromId, id, 'galaxy', { relation: g.name || 'galaxy' }))
            }
        }
    }

    const linkTags = (fromId, tags) => {
        if (!tagsAsNodes) return
        for (const t of tags ?? []) {
            if (!t?.name || t.name.startsWith('misp-galaxy:')) continue
            const key = `tag:${t.name}`
            const tlp = tlpKey(t.name)
            const id = contextNode(key, () => makeNode({
                id: nodeId('misp', key), side: 'misp', kind: 'tag',
                type: tlp ? 'tag:tlp' : 'tag', typeLabel: tlp ? 'TLP' : 'Tag',
                look: describe('galaxy', 'tag'), label: shortLabel(t.name, 32), value: t.name,
                fields: { colour: t.colour || null }, raw: t,
            }))
            edges.push(makeEdge(fromId, id, 'galaxy', { relation: 'tagged' }))
        }
    }

    const attributeNode = (a, ev, parent) => {
        const look = describe('misp', a.type, { category: a.category })
        const tlp = tlpKey(tagNames(a.Tag).find(n => tlpKey(n))) ?? ev.tlp
        const sightings = sightingCounts(a.Sighting)
        return makeNode({
            id: nodeId('misp', a.uuid || `${ev.uuid}:${a.id}`), side: 'misp', kind: 'attribute',
            type: `attr:${a.type}`, typeLabel: a.type, look,
            label: shortLabel(a.value), value: String(a.value ?? ''),
            tlp, tags: plainTags(a.Tag),
            fields: {
                attributeType: a.type, category: a.category || '', relation: a.object_relation || null,
                toIds: !!a.to_ids, distribution: DISTRIBUTION[a.distribution] ?? null,
                comment: a.comment || '', firstSeen: toDate(a.first_seen), lastSeen: toDate(a.last_seen),
                timestamp: toDate(a.timestamp), sightings, deleted: !!a.deleted,
                parentObject: parent ? { id: parent.id, name: parent.name } : null,
            },
            uuid: a.uuid, event: ev.uuid, raw: a,
        })
    }

    for (const ev of mispEvents(json)) {
        const evUuid = ev.uuid || `event-${ev.id ?? nodes.length}`
        const evTags = ev.Tag ?? []
        const evTlp = strictestTlp(tagNames(evTags).map(tlpKey))
        const evCtx = { uuid: evUuid, tlp: evTlp }
        const evId = nodeId('misp', evUuid)
        const attrs = ev.Attribute ?? []
        const objs = ev.Object ?? []

        push(makeNode({
            id: evId, side: 'misp', kind: 'event', type: 'event', typeLabel: 'Event',
            look: describe('event'), label: shortLabel(ev.info || `Event ${ev.id ?? ''}`, 40),
            value: ev.info || '', tlp: evTlp, tags: plainTags(evTags),
            fields: {
                date: ev.date || null, org: ev.Orgc?.name || ev.Org?.name || null,
                threatLevel: THREAT_LEVEL[ev.threat_level_id] ?? null,
                analysis: ANALYSIS[ev.analysis] ?? null,
                distribution: DISTRIBUTION[ev.distribution] ?? null,
                published: !!ev.published, timestamp: toDate(ev.timestamp),
                attributeCount: attrs.length + objs.reduce((n, o) => n + (o.Attribute?.length ?? 0), 0),
                objectCount: objs.length,
                reports: (ev.EventReport ?? []).map(r => ({ name: r.name, content: r.content })),
            },
            uuid: evUuid, event: evUuid, raw: ev,
        }))
        linkGalaxies(evId, ev.Galaxy, evUuid)
        linkTags(evId, evTags)

        const index = (node) => {
            const k = `${node.data.fields.attributeType}|${node.data.value}`
            if (!byValue.has(k)) byValue.set(k, [])
            byValue.get(k).push({ id: node.id, event: evUuid })
        }

        // Standalone attributes
        for (const a of attrs) {
            if (a.object_id && String(a.object_id) !== '0') continue
            const n = attributeNode(a, evCtx, null)
            if (!push(n)) continue
            index(n)
            edges.push(makeEdge(evId, n.id, 'contains', { relation: a.category || '' }))
            linkGalaxies(n.id, a.Galaxy, evUuid)
            linkTags(n.id, a.Tag)
        }

        // Objects and their attributes
        const objectIds = new Map()
        for (const o of objs) {
            const oId = nodeId('misp', o.uuid || `${evUuid}:obj:${o.id}`)
            objectIds.set(o.uuid, oId)
            const members = o.Attribute ?? []
            const main = members.find(a => a.object_relation === pickMainRelation(o.name, members)) ?? members[0]
            const objTlp = strictestTlp(members.flatMap(a => tagNames(a.Tag).map(tlpKey))) ?? evTlp
            push(makeNode({
                id: oId, side: 'misp', kind: 'object', type: `obj:${o.name}`, typeLabel: o.name,
                look: describe('misp-object', o.name),
                label: main ? shortLabel(main.value) : o.name, value: main ? String(main.value) : o.name,
                tlp: objTlp,
                fields: {
                    objectName: o.name, metaCategory: o['meta-category'] || '',
                    template: o.template_uuid ? `${o.template_uuid} v${o.template_version ?? '?'}` : null,
                    comment: o.comment || '', distribution: DISTRIBUTION[o.distribution] ?? null,
                    attributes: members.map(a => ({ relation: a.object_relation || a.type, type: a.type, value: String(a.value ?? ''), toIds: !!a.to_ids })),
                    firstSeen: toDate(o.first_seen), lastSeen: toDate(o.last_seen), timestamp: toDate(o.timestamp),
                },
                uuid: o.uuid, event: evUuid, raw: o,
            }))
            edges.push(makeEdge(evId, oId, 'contains', { relation: o['meta-category'] || '' }))
            for (const a of members) {
                const n = attributeNode(a, evCtx, { id: oId, name: o.name })
                if (push(n)) index(n)
                edges.push(makeEdge(oId, n.id, 'contains', { relation: a.object_relation || '' }))
                linkGalaxies(n.id, a.Galaxy, evUuid)
                linkTags(n.id, a.Tag)
            }
        }

        // Object references (after every object is known)
        for (const o of objs) {
            for (const ref of o.ObjectReference ?? []) {
                const from = objectIds.get(ref.object_uuid || o.uuid)
                const to = objectIds.get(ref.referenced_uuid) ?? (seen.has(nodeId('misp', ref.referenced_uuid)) ? nodeId('misp', ref.referenced_uuid) : null)
                if (!from || !to) continue
                edges.push(makeEdge(from, to, 'reference', {
                    relation: ref.relationship_type || 'related-to', comment: ref.comment || '', uuid: ref.uuid,
                }))
            }
        }
    }

    // Correlations: one edge per pair of events sharing a value (chained, not a clique).
    for (const hits of byValue.values()) {
        const events = new Map()
        for (const h of hits) if (!events.has(h.event)) events.set(h.event, h.id)
        const ids = [...events.values()]
        for (let i = 1; i < ids.length; i++) edges.push(makeEdge(ids[i - 1], ids[i], 'correlation', { relation: 'same value' }))
    }

    return { nodes, edges }
}

/** The attribute that names an object best on the canvas. */
function pickMainRelation(name, members) {
    const prefer = {
        'file': ['filename', 'sha256', 'md5'], 'domain-ip': ['domain', 'ip'], 'url': ['url'],
        'email': ['subject', 'from'], 'network-connection': ['ip-dst', 'hostname-dst'],
        'person': ['full-name', 'last-name'], 'whois': ['domain', 'registrant-email'],
        'x509': ['subject', 'x509-fingerprint-sha1'], 'process': ['name', 'pid'],
        'vulnerability': ['id'], 'ip-port': ['ip', 'ip-dst'], 'dns-record': ['queried-domain'],
    }[name] ?? []
    const present = new Set(members.map(a => a.object_relation))
    return prefer.find(r => present.has(r)) ?? members[0]?.object_relation
}
