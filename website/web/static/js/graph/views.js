// ─────────────────────────────────────────────────────────────────────────────
//  Views — one document, several ways to look at it.
//
//  A view is a recipe over the same model:
//    label            name in the view picker
//    description      one line, shown under the picker
//    tagsAsNodes / observedDataAsNodes   parser switches
//    transform(g)     keep / drop nodes and edges (returns the graph)
//    layout(g)        Pivotick `layout` option
//    edgeKinds        edge layers on (true) / off (false) at first; the
//                     others follow EDGE_KINDS[kind].on
//    simplify(g)      Simplify rules, in run order
//
//  Simplify folds a view, never the data: the table, the search and the
//  exports still see every node.
// ─────────────────────────────────────────────────────────────────────────────

const containers = (g) => g.nodes.filter(n => n.data.element === 'container')

/**
 * The graph being drawn, set by graphView once Pivotick exists. Custom rules
 * read it to leave alone the members of a group the reader opened: without
 * that, opening "135 × ip-dst" let "By type" fold the same 135 nodes again at
 * once, and the group only stayed open on the second try.
 */
export const ruleContext = { graph: null }

function openMembers() {
    const groups = ruleContext.graph?.simplify?.getGroups?.() ?? []
    const ids = new Set()
    for (const g of groups) if (g.open) for (const m of g.members ?? []) ids.add(m.id)
    return ids
}

/** A custom rule's partition, minus the nodes an opened group gave back. */
function partitionBy(filter, key) {
    return (v) => {
        const opened = openMembers()
        return new Map(v.nodes.filter(n => !opened.has(n.id) && filter(n.getData?.() ?? {})).map(n => [n.id, key(n.getData())]))
    }
}

/** The rules every view starts from: fold the repetition, keep the shape. */
function baseRules({ neighbours = 4, chains = 4, byType = false } = {}) {
    const rules = [
        // chains first: placed after neighbours, Pivotick's chains rule folded
        // again the members of a neighbours group the reader had just opened.
        { kind: 'chains', minSize: chains },
        { kind: 'neighbours', minSize: neighbours },
        {
            // What the structural rules leave (nodes with one extra link, a
            // sighting, an opinion…) still folds by type: "349 × indicator".
            kind: 'custom', id: 'byType', label: 'By type', enabled: byType, minSize: 8,
            description: 'Indicators and observables of the same type fold together, whatever they link to.',
            partition: partitionBy(d => ['indicator', 'observable'].includes(d.element), d => d.type),
        },
        {
            // Last resort for very large documents: one group per family and type of
            // element (all network observables, all file objects…) still reads as one kind.
            kind: 'custom', id: 'byFamily', label: 'By family', enabled: false, minSize: 8,
            description: 'Everything of one family and element folds together: all network observables, all file objects…',
            partition: partitionBy(d => d.element && d.element !== 'container', d => `${d.element}:${d.family}`),
        },
        { kind: 'degree', minDegree: 2, enabled: false },
        { kind: 'kcore', k: 2, enabled: false },
        { kind: 'communities', level: 4, enabled: false },
        {
            kind: 'custom', id: 'byTlp', label: 'By TLP', enabled: false, minSize: 3,
            description: 'Observables sharing a TLP level fold together.',
            partition: partitionBy(d => d.element === 'observable', d => `tlp:${d.tlp ?? 'none'}`),
        },
        {
            kind: 'custom', id: 'byCategory', label: 'By MISP category', enabled: false, minSize: 3,
            description: 'Attributes of the same MISP category fold together.',
            partition: partitionBy(d => !!d.category, d => `cat:${d.category}`),
        },
    ]
    return rules
}

/** Drop nodes left with no edge once edges are filtered. */
function dropIsolated(g) {
    const linked = new Set()
    for (const e of g.edges) { linked.add(e.from); linked.add(e.to) }
    g.nodes = g.nodes.filter(n => linked.has(n.id))
    return g
}

/**
 * Keep a container's direct `contains` edge only for what nothing else reaches.
 * An SCO a STIX indicator is based on, or a MISP object another object
 * references, hangs off that node instead: the tree reads as cause → effect,
 * and chains (indicator → observable) become foldable.
 */
function pruneContainment(g) {
    const reached = new Set(g.edges.filter(e => e.data.kind === 'reference' || e.data.kind === 'relationship').map(e => e.to))
    const isContainer = new Set(g.nodes.filter(n => n.data.element === 'container').map(n => n.id))
    g.edges = g.edges.filter(e => !(e.data.kind === 'contains' && isContainer.has(e.from) && reached.has(e.to)))
    return g
}

export const VIEWS = {
    structure: {
        label: 'Structure',
        description: 'What the event or bundle holds: containers, objects and their attributes.',
        transform: pruneContainment,
        // Radial tree only while it stays readable; past that, force + Simplify.
        layout: (g) => containers(g).length === 1 && g.nodes.length <= 300
            ? { type: 'tree', radial: true, rootId: containers(g)[0].id }
            : { type: 'force' },
        edgeKinds: { contains: true, reference: true, relationship: true, galaxy: true, sighting: false, correlation: true },
        simplify: (g) => baseRules({ byType: g.nodes.length > 600 }),
    },
    relations: {
        label: 'Relations',
        description: 'Only the meaningful links: references, relationships and sightings, without the containment.',
        transform: (g) => {
            g.edges = g.edges.filter(e => ['reference', 'relationship', 'sighting', 'correlation', 'galaxy'].includes(e.data.kind))
            return dropIsolated(g)
        },
        layout: () => ({ type: 'force' }),
        simplify: (g) => baseRules({ neighbours: 3 }),
    },
    infrastructure: {
        label: 'Infrastructure',
        description: 'The network side only: domains, IPs, URLs, connections and how they resolve to each other.',
        transform: (g) => {
            const keep = new Set(g.nodes.filter(n => n.data.family === 'network' || n.data.family === 'email').map(n => n.id))
            g.nodes = g.nodes.filter(n => keep.has(n.id))
            g.edges = g.edges.filter(e => keep.has(e.from) && keep.has(e.to))
            return dropIsolated(g)
        },
        layout: () => ({ type: 'force' }),
        edgeKinds: { 'embedded-ref': true, pattern: true },
        simplify: (g) => baseRules({ neighbours: 3, chains: 3, byType: g.nodes.length > 600 }),
    },
    threat: {
        label: 'Threat & ATT&CK',
        description: 'Who and how: threat actors, malware, tools, ATT&CK techniques, vulnerabilities and what they target.',
        transform: (g) => {
            const families = new Set(['threat', 'ttp', 'vuln', 'identity', 'container'])
            const keep = new Set(g.nodes.filter(n => families.has(n.data.family) || n.data.kind === 'galaxy').map(n => n.id))
            // Keep the indicators that point at a kept node, so "what detects it" stays visible.
            for (const e of g.edges) if (keep.has(e.to) && e.data.kind === 'relationship') keep.add(e.from)
            g.nodes = g.nodes.filter(n => keep.has(n.id))
            g.edges = g.edges.filter(e => keep.has(e.from) && keep.has(e.to))
            return dropIsolated(g)
        },
        layout: (g) => g.nodes.length <= 150 ? { type: 'tree', horizontal: true } : { type: 'force' },
        edgeKinds: { contains: true, galaxy: true, relationship: true },
        simplify: (g) => baseRules({ byType: g.nodes.length > 600 }),
    },
    context: {
        label: 'Context',
        description: 'Tags and galaxy clusters as nodes: which indicators share a TLP, a technique or an actor.',
        tagsAsNodes: true,
        transform: (g) => {
            const ctx = new Set(g.nodes.filter(n => n.data.element === 'context').map(n => n.id))
            g.edges = g.edges.filter(e => e.data.kind === 'galaxy' || ctx.has(e.to))
            // STIX has no tag nodes: its labels become chips, so link objects to their markings' TLP instead.
            return dropIsolated(g)
        },
        layout: () => ({ type: 'force' }),
        edgeKinds: { galaxy: true },
        simplify: (g) => baseRules({ neighbours: 3, byType: g.nodes.length > 600 }),
    },
    detection: {
        label: 'Detection',
        description: 'What a sensor can use: attributes flagged for IDS and STIX indicators, with what they detect.',
        transform: (g) => {
            const keep = new Set(g.nodes.filter(n => n.data.toIds === true || n.data.kind === 'indicator' || n.data.element === 'container').map(n => n.id))
            for (const e of g.edges) if (keep.has(e.from) && e.data.kind === 'relationship') keep.add(e.to)
            g.nodes = g.nodes.filter(n => keep.has(n.id))
            g.edges = g.edges.filter(e => keep.has(e.from) && keep.has(e.to))
            return dropIsolated(g)
        },
        layout: () => ({ type: 'force' }),
        simplify: (g) => baseRules({ byType: g.nodes.length > 600 }),
    },
    explore: {
        label: 'Explore',
        description: 'Start small and pivot: the containers and the threat entities only (actors, malware, techniques…). Select a node, open Pivot and pull in what it links to.',
        transform: (g) => {
            const keep = new Set(g.nodes.filter(n => ['container', 'entity', 'context'].includes(n.data.element)).map(n => n.id))
            g.nodes = g.nodes.filter(n => keep.has(n.id))
            g.edges = g.edges.filter(e => keep.has(e.from) && keep.has(e.to))
            return g
        },
        layout: () => ({ type: 'force' }),
        simplify: (g) => baseRules({ byType: g.nodes.length > 600 }),
    },
}
