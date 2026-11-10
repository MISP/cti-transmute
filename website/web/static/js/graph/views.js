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

/** The rules every view starts from: fold the repetition, keep the shape. */
function baseRules({ neighbours = 4, chains = 4, communities = false } = {}) {
    const rules = [
        { kind: 'neighbours', minSize: neighbours },
        { kind: 'chains', minSize: chains },
        { kind: 'degree', minDegree: 2, enabled: false },
        { kind: 'kcore', k: 2, enabled: false },
        { kind: 'communities', level: 4, enabled: communities },
        {
            kind: 'custom', id: 'byTlp', label: 'By TLP', enabled: false, minSize: 3,
            description: 'Observables sharing a TLP level fold together.',
            partition: (v) => new Map(v.nodes.filter(n => n.getData?.()?.element === 'observable')
                .map(n => [n.id, `tlp:${n.getData().tlp ?? 'none'}`])),
        },
        {
            kind: 'custom', id: 'byCategory', label: 'By MISP category', enabled: false, minSize: 3,
            description: 'Attributes of the same MISP category fold together.',
            partition: (v) => new Map(v.nodes.filter(n => n.getData?.()?.category)
                .map(n => [n.id, `cat:${n.getData().category}`])),
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

export const VIEWS = {
    structure: {
        label: 'Structure',
        description: 'What the event or bundle holds: containers, objects and their attributes.',
        // Radial tree only while it stays readable; past that, force + Simplify.
        layout: (g) => containers(g).length === 1 && g.nodes.length <= 300
            ? { type: 'tree', radial: true, rootId: containers(g)[0].id }
            : { type: 'force' },
        edgeKinds: { contains: true, reference: true, relationship: true, galaxy: true, sighting: false, correlation: true },
        simplify: (g) => baseRules({ communities: g.nodes.length > 4000 }),
    },
    relations: {
        label: 'Relations',
        description: 'Only the meaningful links: references, relationships and sightings, without the containment.',
        transform: (g) => {
            g.edges = g.edges.filter(e => ['reference', 'relationship', 'sighting', 'correlation', 'galaxy'].includes(e.data.kind))
            return dropIsolated(g)
        },
        layout: () => ({ type: 'force' }),
        simplify: (g) => baseRules({ neighbours: 3, communities: g.nodes.length > 3000 }),
    },
}
