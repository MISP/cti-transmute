// ─────────────────────────────────────────────────────────────────────────────
//  STIX 2.x → graph model.
//
//  Reads a bundle (or a list of bundles / objects) and returns `{ nodes, edges }`
//  in the common model (model.js).
//
//  Nodes:
//    report, grouping                 container
//    SDOs (malware, threat-actor…)    entity
//    indicator                        indicator — coloured by the family of
//                                     the observable its pattern names
//    SCOs (ipv4-addr, file…)          observable
//    note, opinion                    context
//    marking-definition               not a node: read as each object's `tlp`
//    observed-data                    not a node by default: a wrapper. Its
//                                     SCOs take its place (first/last observed
//                                     copied onto them) and any edge to it is
//                                     redirected to them. `observedDataAsNodes`
//                                     keeps it as a context node.
//    sighting                         not a node: an edge `sighting` from each
//                                     `where_sighted_refs` to `sighting_of_ref`,
//                                     plus a count on the sighted object.
//
//  Edges, by kind:
//    contains       report/grouping → object_refs, observed-data → object_refs
//    relationship   SRO `relationship` (relationship_type kept as `relation`)
//    sighting       see above
//    embedded-ref   every other `*_ref` / `*_refs` (resolves_to_refs, src_ref,
//                   sample_refs…), named by the key; created_by_ref is a field
//    pattern        indicator → SCO whose value its pattern compares to
// ─────────────────────────────────────────────────────────────────────────────

import { describe, familyOfStixType, FAMILIES, shortLabel, tlpKey } from './vocabulary.js'
import { makeNode, makeEdge, nodeId } from './model.js'

// created_by_ref is read into `fields.createdBy`, not drawn: nearly every object
// carries it, and one identity linked to everything hides every other shape.
const SKIP_REFS = new Set(['created_by_ref', 'object_marking_refs', 'object_refs', 'sighting_of_ref',
    'where_sighted_refs', 'observed_data_refs', 'source_ref', 'target_ref'])
const SDO_CONTAINERS = new Set(['report', 'grouping'])

/** Every object of the input, flattened. */
export function stixObjects(json) {
    const list = Array.isArray(json) ? json : [json]
    const out = []
    for (const item of list) {
        if (!item || typeof item !== 'object') continue
        if (Array.isArray(item.objects)) out.push(...item.objects)
        else if (item.type && item.id) out.push(item)
    }
    return out.filter(o => o && o.id && o.type)
}

/** `misp:type="ip-dst"` labels → { type, category, name }. Other labels are tags. */
function readLabels(labels) {
    const origin = {}, tags = []
    for (const l of labels ?? []) {
        const m = /^misp:([a-z-]+)="?([^"]*)"?$/i.exec(l)
        if (m) origin[m[1]] = m[2]
        else tags.push({ name: l, colour: null })
    }
    return { origin, tags }
}

/** Observables a STIX pattern compares to: [{ type, path, value }]. */
export function patternObservables(pattern) {
    const out = []
    const re = /([a-z0-9-]+):([a-zA-Z0-9_.'\[\]*-]+)\s*(=|!=|LIKE|MATCHES|IN|>|<|>=|<=)\s*'((?:[^'\\]|\\.)*)'/g
    let m
    while ((m = re.exec(String(pattern ?? '')))) {
        if (/\.type$/.test(m[2])) continue
        out.push({ type: m[1], path: m[2], op: m[3], value: m[4].replace(/\\'/g, "'") })
    }
    return out
}

/** The value an SCO stands for on the canvas. */
function scoValue(o) {
    if (o.value !== undefined) return String(o.value)
    if (o.type === 'file') return o.name || Object.values(o.hashes ?? {})[0] || 'file'
    if (o.type === 'network-traffic') return [o.protocols?.join('/'), o.dst_port].filter(Boolean).join(' :') || 'network traffic'
    if (o.type === 'email-message') return o.subject || 'email'
    if (o.type === 'process') return o.command_line || o.pid?.toString() || 'process'
    if (o.type === 'windows-registry-key') return o.key || 'registry key'
    if (o.type === 'x509-certificate') return o.subject || o.serial_number || 'certificate'
    if (o.type === 'autonomous-system') return `AS${o.number ?? ''}`
    if (o.type === 'user-account') return o.account_login || o.user_id || 'account'
    if (o.type === 'directory') return o.path || 'directory'
    if (o.type === 'software') return [o.name, o.version].filter(Boolean).join(' ')
    if (o.type === 'artifact') return o.hashes ? Object.values(o.hashes)[0] : 'artifact'
    return o.name || o.type
}

const FIELD_PICK = {
    'malware': ['malware_types', 'is_family', 'capabilities', 'implementation_languages', 'architecture_execution_envs', 'first_seen', 'last_seen', 'aliases'],
    'tool': ['tool_types', 'tool_version', 'aliases'],
    'threat-actor': ['threat_actor_types', 'aliases', 'roles', 'goals', 'sophistication', 'resource_level', 'primary_motivation', 'secondary_motivations', 'first_seen', 'last_seen'],
    'intrusion-set': ['aliases', 'goals', 'resource_level', 'primary_motivation', 'first_seen', 'last_seen'],
    'campaign': ['aliases', 'objective', 'first_seen', 'last_seen'],
    'attack-pattern': ['aliases'],
    'identity': ['identity_class', 'sectors', 'roles', 'contact_information'],
    'location': ['region', 'country', 'administrative_area', 'city', 'latitude', 'longitude'],
    'vulnerability': [],
    'infrastructure': ['infrastructure_types', 'aliases', 'first_seen', 'last_seen'],
    'report': ['report_types', 'published'],
    'grouping': ['context'],
    'note': ['abstract', 'content', 'authors'],
    'opinion': ['opinion', 'explanation', 'authors'],
    'indicator': ['indicator_types', 'pattern_type', 'valid_from', 'valid_until'],
    'observed-data': ['first_observed', 'last_observed', 'number_observed'],
    'malware-analysis': ['product', 'version', 'result', 'analysis_started', 'analysis_ended'],
}

/**
 * @param {object|array} json
 * @param {object} [opts]
 * @param {boolean} [opts.observedDataAsNodes]  keep observed-data as nodes
 */
export function stixToGraph(json, opts = {}) {
    const { observedDataAsNodes = false } = opts
    const objects = stixObjects(json)
    const byId = new Map(objects.map(o => [o.id, o]))
    const nodes = [], edges = []
    const seen = new Set()
    const redirect = new Map()          // observed-data id → [SCO ids]
    const sightingCount = new Map()

    // TLP of each marking-definition id.
    const markingTlp = new Map()
    for (const o of objects) {
        if (o.type !== 'marking-definition') continue
        markingTlp.set(o.id, tlpKey(o.definition?.tlp ? `tlp:${o.definition.tlp}` : o.name))
    }
    const tlpOf = (o) => {
        for (const ref of o.object_marking_refs ?? []) if (markingTlp.get(ref)) return markingTlp.get(ref)
        return null
    }

    // observed-data: SCOs inherit its observation window.
    const observedOn = new Map()
    for (const o of objects) {
        if (o.type !== 'observed-data') continue
        const refs = (o.object_refs ?? []).filter(r => byId.has(r))
        if (!observedDataAsNodes) redirect.set(o.id, refs)
        for (const r of refs) observedOn.set(r, {
            firstObserved: o.first_observed || null, lastObserved: o.last_observed || null,
            numberObserved: o.number_observed ?? null, ...readLabels(o.labels).origin,
        })
    }
    for (const o of objects) if (o.type === 'sighting' && o.sighting_of_ref)
        sightingCount.set(o.sighting_of_ref, (sightingCount.get(o.sighting_of_ref) ?? 0) + (o.count ?? 1))

    const id = (stixId) => nodeId('stix', stixId)
    const ends = (stixId) => redirect.has(stixId) ? redirect.get(stixId).map(id) : [id(stixId)]

    for (const o of objects) {
        if (o.type === 'relationship' || o.type === 'sighting' || o.type === 'marking-definition') continue
        if (o.type === 'observed-data' && !observedDataAsNodes) continue
        if (o.type === 'extension-definition' || o.type === 'language-content') continue

        const { origin, tags } = readLabels(o.labels)
        let look = describe('stix', o.type)
        let value, label, fields = {}

        if (o.type === 'indicator') {
            const obs = patternObservables(o.pattern)
            const first = obs[0]
            const fam = first ? familyOfStixType(first.type) : 'network'
            look = { ...look, family: fam, color: FAMILIES[fam].color }
            value = first ? first.value : (o.name || o.pattern || '')
            label = shortLabel(o.name || value)
            fields = { pattern: o.pattern || '', patternObservables: obs }
        } else if (look.element === 'observable') {
            value = scoValue(o)
            label = shortLabel(value)
            fields = { hashes: o.hashes || null, observed: observedOn.get(o.id) || null }
        } else if (o.type === 'x-misp-attribute') {
            look = describe('misp', o.x_misp_type, { category: o.x_misp_category })
            value = String(o.x_misp_value ?? '')
            label = shortLabel(value)
            fields = { attributeType: o.x_misp_type, category: o.x_misp_category }
        } else {
            value = o.name || o.value || o.abstract || o.opinion || o.type
            label = shortLabel(value, 32)
        }

        for (const k of FIELD_PICK[o.type] ?? []) if (o[k] !== undefined) fields[k] = o[k]
        Object.assign(fields, {
            stixType: o.type, description: o.description || '',
            created: o.created || null, modified: o.modified || null,
            createdBy: o.created_by_ref ? (byId.get(o.created_by_ref)?.name || o.created_by_ref) : null,
            confidence: o.confidence ?? null,
            killChain: (o.kill_chain_phases ?? []).map(p => ({ chain: p.kill_chain_name, phase: p.phase_name })),
            externalReferences: (o.external_references ?? []).map(r => ({
                source: r.source_name, id: r.external_id || null, url: r.url || null, description: r.description || null,
            })),
            origin: Object.keys(origin).length ? origin : (observedOn.get(o.id) && {
                type: observedOn.get(o.id).type, category: observedOn.get(o.id).category, name: observedOn.get(o.id).name,
            }) || null,
            sightings: sightingCount.get(o.id) ? { total: sightingCount.get(o.id) } : null,
            category: origin.category || observedOn.get(o.id)?.category || null,
            toIds: o.type === 'indicator' ? true : null,
        })

        const n = makeNode({
            id: id(o.id), side: 'stix', kind: o.type === 'indicator' ? 'indicator' : (look.element === 'observable' ? 'sco' : 'sdo'),
            type: `stix:${o.type === 'x-misp-attribute' ? 'x-misp-attribute' : o.type}`,
            typeLabel: o.type === 'x-misp-attribute' ? (o.x_misp_type || 'misp attribute') : o.type,
            look, label, value, tlp: tlpOf(o), tags, fields, uuid: o.id, raw: o,
        })
        if (!seen.has(n.id)) { seen.add(n.id); nodes.push(n) }
    }

    const link = (fromStix, toStix, kind, extra) => {
        for (const f of ends(fromStix)) for (const t of ends(toStix)) {
            if (seen.has(f) && seen.has(t)) edges.push(makeEdge(f, t, kind, extra))
        }
    }

    const scoIndex = new Map()
    for (const s of objects) if (describe('stix', s.type).element === 'observable') scoIndex.set(`${s.type}|${scoValue(s)}`, s.id)

    for (const o of objects) {
        if (o.type === 'relationship') {
            link(o.source_ref, o.target_ref, 'relationship', {
                relation: o.relationship_type || 'related-to', description: o.description || '',
                startTime: o.start_time || null, stopTime: o.stop_time || null,
                confidence: o.confidence ?? null, uuid: o.id, raw: o,
            })
            continue
        }
        if (o.type === 'sighting') {
            const where = o.where_sighted_refs?.length ? o.where_sighted_refs : (o.created_by_ref ? [o.created_by_ref] : [])
            for (const w of where) link(w, o.sighting_of_ref, 'sighting', {
                relation: 'sighted', count: o.count ?? 1, firstSeen: o.first_seen || null,
                lastSeen: o.last_seen || null, uuid: o.id, raw: o,
            })
            continue
        }
        if (o.type === 'marking-definition') continue
        if (SDO_CONTAINERS.has(o.type) || (o.type === 'observed-data' && observedDataAsNodes)) {
            for (const r of o.object_refs ?? []) if (byId.get(r)?.type !== 'marking-definition')
                link(o.id, r, 'contains', { relation: 'object_refs' })
        }
        // The author is drawn once, from the report or grouping that carries it,
        // not from every object (see SKIP_REFS): it stays on the graph, attached.
        if (SDO_CONTAINERS.has(o.type) && o.created_by_ref && byId.has(o.created_by_ref))
            link(o.id, o.created_by_ref, 'relationship', { relation: 'created by' })
        for (const [key, val] of Object.entries(o)) {
            if (SKIP_REFS.has(key) || !/_refs?$/.test(key)) continue
            for (const r of Array.isArray(val) ? val : [val]) {
                if (typeof r === 'string' && byId.has(r)) link(o.id, r, 'embedded-ref', { relation: key.replace(/_refs?$/, '').replace(/_/g, ' ') })
            }
        }
    }

    // Pattern links. One adds nothing where a based-on relationship already ties
    // the indicator to its observables: it would only stop Simplify from folding
    // indicator → observable.
    // An indicator already `based-on` its observables is not linked again by pattern.
    const basedOn = new Set(objects.filter(o => o.type === 'relationship' && o.relationship_type === 'based-on').map(o => o.source_ref))
    for (const o of objects) {
        if (o.type !== 'indicator' || basedOn.has(o.id)) continue
        for (const ob of patternObservables(o.pattern)) {
            const match = scoIndex.get(`${ob.type}|${ob.value}`)
            if (match) link(o.id, match, 'pattern', { relation: ob.path })
        }
    }

    return { nodes, edges }
}
