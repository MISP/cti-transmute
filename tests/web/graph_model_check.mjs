// Checks of the Graph tab's model layer (static/js/graph/model/): what the
// MISP and STIX parsers turn a document into. Run by test_graph_model.py.
// Prints "ok <name>" or "FAIL <name>: <why>", exits 1 on any failure.

import { mispToGraph } from '../../website/web/static/js/graph/model/mispToGraph.js'
import { stixToGraph, patternObservables } from '../../website/web/static/js/graph/model/stixToGraph.js'
import { cleanGraph } from '../../website/web/static/js/graph/model/model.js'
import { describe, shortLabel, strictestTlp, tlpKey } from '../../website/web/static/js/graph/model/vocabulary.js'

let failed = 0
function check(name, fn) {
    try { fn(); console.log(`ok ${name}`) }
    catch (e) { failed++; console.log(`FAIL ${name}: ${e.message}`) }
}
function eq(a, b, what) {
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`)
}
const kinds = (g) => g.edges.map(e => e.data.kind).sort()
const node = (g, pred) => g.nodes.find(pred)

const UUID = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

const event = {
    Event: {
        uuid: UUID(1), info: 'Phishing wave', date: '2026-01-01', threat_level_id: '1', analysis: '2',
        Tag: [{ name: 'tlp:amber' }, { name: 'PAP:GREEN', colour: '#009900' }],
        Galaxy: [{ name: 'Attack Pattern', type: 'mitre-attack-pattern', GalaxyCluster: [
            { uuid: UUID(90), type: 'mitre-attack-pattern', value: 'Phishing - T1566', meta: { external_id: ['T1566'] } }] }],
        Attribute: [
            { uuid: UUID(2), type: 'ip-dst', category: 'Network activity', value: '198.51.100.7', to_ids: true,
              Sighting: [{ type: '0' }, { type: '1' }] },
            { uuid: UUID(3), type: 'sha256', category: 'Payload delivery', value: 'a'.repeat(64), to_ids: true,
              Tag: [{ name: 'tlp:red' }] },
        ],
        Object: [
            { uuid: UUID(10), name: 'file', 'meta-category': 'file',
              Attribute: [
                  { uuid: UUID(11), type: 'filename', object_relation: 'filename', value: 'invoice.docm' },
                  { uuid: UUID(12), type: 'md5', object_relation: 'md5', value: 'b'.repeat(32) }],
              ObjectReference: [{ object_uuid: UUID(10), referenced_uuid: UUID(20), relationship_type: 'connects-to' }] },
            { uuid: UUID(20), name: 'domain-ip', 'meta-category': 'network',
              Attribute: [{ uuid: UUID(21), type: 'domain', object_relation: 'domain', value: 'evil.example' }] },
        ],
    },
}

check('misp: one node per event, object, attribute and galaxy cluster', () => {
    const g = cleanGraph(mispToGraph(event))
    eq(g.nodes.length, 1 + 2 + 2 + 3 + 1, 'node count')
    eq(g.nodes.filter(n => n.data.kind === 'attribute').length, 5, 'attributes')
})

check('misp: edges are contains, reference and galaxy', () => {
    const g = cleanGraph(mispToGraph(event))
    eq(kinds(g), ['contains', 'contains', 'contains', 'contains', 'contains', 'contains', 'contains', 'galaxy', 'reference'], 'kinds')
    const ref = g.edges.find(e => e.data.kind === 'reference')
    eq(ref.data.relation, 'connects-to', 'reference relation')
})

check('misp: attribute carries type, family, TLP, sightings', () => {
    const g = mispToGraph(event)
    const ip = node(g, n => n.data.value === '198.51.100.7')
    eq([ip.data.type, ip.data.family, ip.data.element, ip.data.icon], ['attr:ip-dst', 'network', 'observable', 'fa-network-wired'], 'look')
    eq(ip.data.tlp, 'amber', 'inherits event TLP')
    eq(ip.data.fields.sightings.seen, 1, 'seen'); eq(ip.data.fields.sightings.falsePositive, 1, 'false positive')
    const hash = node(g, n => n.data.type === 'attr:sha256')
    eq(hash.data.tlp, 'red', 'own TLP wins'); eq(hash.data.label, 'aaaaaa…aaaa', 'hash label keeps both ends')
})

check('misp: object is named by its main attribute and lists its members', () => {
    const g = mispToGraph(event)
    const file = node(g, n => n.data.type === 'obj:file')
    eq(file.data.label, 'invoice.docm', 'label')
    eq(file.data.fields.attributes.map(a => a.relation), ['filename', 'md5'], 'members')
})

check('misp: TLP and galaxy tags are not plain tags', () => {
    const ev = node(mispToGraph(event), n => n.data.kind === 'event')
    eq(ev.data.tagNames, ['PAP:GREEN'], 'tags'); eq(ev.data.tlp, 'amber', 'tlp')
    eq(ev.data.fields.threatLevel, 'High', 'threat level')
})

check('misp: tagsAsNodes draws tags as context nodes', () => {
    const g = mispToGraph(event, { tagsAsNodes: true })
    eq(g.nodes.filter(n => n.data.kind === 'tag').length, 3, 'one node per distinct tag: amber, PAP, red')
})

check('misp: shared values across events correlate, once per pair of events', () => {
    const second = JSON.parse(JSON.stringify(event))
    second.Event.uuid = UUID(100)
    second.Event.Attribute.forEach((a, i) => { a.uuid = UUID(200 + i) })
    second.Event.Object.forEach((o, i) => { o.uuid = UUID(300 + i); o.Attribute.forEach((a, j) => { a.uuid = UUID(400 + i * 10 + j) }) })
    const g = cleanGraph(mispToGraph([second, event]))
    eq(g.edges.filter(e => e.data.kind === 'correlation').length, 5, 'one per shared value')
})

const bundle = {
    type: 'bundle', objects: [
        { type: 'marking-definition', id: 'marking-definition--1', definition_type: 'tlp', definition: { tlp: 'green' } },
        { type: 'identity', id: 'identity--1', name: 'CIRCL', created: 'x', modified: 'x' },
        { type: 'report', id: 'report--1', name: 'Report', created: 'x', modified: 'x',
          object_refs: ['indicator--1', 'observed-data--1', 'malware--1'], object_marking_refs: ['marking-definition--1'] },
        { type: 'indicator', id: 'indicator--1', created: 'x', modified: 'x', created_by_ref: 'identity--1',
          pattern: "[ipv4-addr:value = '203.0.113.9'] AND [network-traffic:dst_ref.type = 'ipv4-addr']",
          labels: ['misp:type="ip-dst"', 'misp:category="Network activity"', 'suspicious'] },
        { type: 'observed-data', id: 'observed-data--1', created: 'x', modified: 'x', object_refs: ['ipv4-addr--1'],
          first_observed: '2026-01-01T00:00:00Z', labels: ['misp:type="ip-dst"'] },
        { type: 'ipv4-addr', id: 'ipv4-addr--1', value: '203.0.113.9' },
        { type: 'malware', id: 'malware--1', name: 'Emotet', created: 'x', modified: 'x', is_family: true },
        { type: 'relationship', id: 'relationship--1', source_ref: 'indicator--1', target_ref: 'observed-data--1', relationship_type: 'based-on' },
        { type: 'relationship', id: 'relationship--2', source_ref: 'indicator--1', target_ref: 'malware--1', relationship_type: 'indicates' },
        { type: 'sighting', id: 'sighting--1', sighting_of_ref: 'indicator--1', where_sighted_refs: ['identity--1'], count: 3 },
    ],
}

check('stix: markings, observed-data, SROs and sightings are not nodes', () => {
    const g = cleanGraph(stixToGraph(bundle))
    eq(g.nodes.map(n => n.data.typeLabel).sort(), ['identity', 'indicator', 'ipv4-addr', 'malware', 'report'], 'node types')
})

check('stix: observed-data edges are redirected to its observables', () => {
    const g = cleanGraph(stixToGraph(bundle))
    const based = g.edges.find(e => e.data.relation === 'based-on')
    eq(based.to, 'stix_ipv4-addr--1', 'based-on lands on the SCO')
    const contains = g.edges.filter(e => e.data.kind === 'contains').map(e => e.to).sort()
    eq(contains, ['stix_indicator--1', 'stix_ipv4-addr--1', 'stix_malware--1'], 'report contains')
})

check('stix: edge kinds', () => {
    const g = cleanGraph(stixToGraph(bundle))
    // created_by_ref is a field, not an edge; the pattern link duplicates based-on, so it is dropped.
    eq([...new Set(kinds(g))], ['contains', 'relationship', 'sighting'], 'kinds')
    eq(node(g, n => n.data.kind === 'indicator').data.fields.createdBy, 'CIRCL', 'created by')
    eq(g.edges.find(e => e.data.kind === 'sighting').data.count, 3, 'sighting count')
})

check('stix: indicator takes the family of its pattern and the MISP origin', () => {
    const g = stixToGraph(bundle)
    const ind = node(g, n => n.data.kind === 'indicator')
    eq([ind.data.family, ind.data.value, ind.data.element], ['network', '203.0.113.9', 'indicator'], 'indicator')
    eq(ind.data.fields.origin, { type: 'ip-dst', category: 'Network activity' }, 'origin')
    eq(ind.data.tagNames, ['suspicious'], 'misp: labels are not tags')
    eq(ind.data.fields.sightings.total, 3, 'sightings')
    const rep = node(g, n => n.data.kind === 'sdo' && n.data.typeLabel === 'report')
    eq(rep.data.tlp, 'green', 'tlp from marking')
})

check('stix: pattern observables skip the type comparisons', () => {
    eq(patternObservables("[file:hashes.'SHA-256' = 'abc' AND file:name = 'x.exe']").map(o => o.value), ['abc', 'x.exe'], 'values')
})

check('vocabulary: same family for the same thing on both sides', () => {
    eq(describe('misp', 'ip-dst').family, describe('stix', 'ipv4-addr').family, 'ip')
    eq(describe('misp', 'domain').icon, describe('stix', 'domain-name').icon, 'domain icon')
    eq(describe('misp', 'unknown-type', { category: 'Payload delivery' }).family, 'file', 'category fallback')
})

check('vocabulary: labels and TLP helpers', () => {
    eq(shortLabel('https://very-long-domain-name.example.com/path/to/thing'), 'very-long-domain-…h/to/thing', 'url: no scheme, middle cut')
    eq(tlpKey('TLP:AMBER+STRICT'), 'amber+strict', 'tlp key')
    eq(strictestTlp(['green', null, 'amber']), 'amber', 'strictest')
})

process.exit(failed ? 1 : 0)
