// ─────────────────────────────────────────────────────────────────────────────
//  The common graph model — what both parsers produce and every view reads.
//
//  node = { id, data: {
//      side      'misp' | 'stix'
//      kind      what it is natively: event, object, attribute, galaxy, tag,
//                sdo, sco, indicator, marking…
//      type      fine type used to group and colour: `attr:ip-dst`, `obj:file`,
//                `stix:malware`, `galaxy:mitre-attack-pattern`…
//      typeLabel human name of the type (`ip-dst`, `file`, `malware`)
//      element   container | entity | indicator | object | observable | context | meta
//      family    network | file | email | host | threat | ttp | vuln | identity | knowledge | container
//      icon      Font Awesome class (`fa-globe`)
//      color, shape, size   resolved drawing (from the vocabulary)
//      label     short canvas label        value  full value / name
//      tlp       'clear' | 'green' | 'amber' | 'amber+strict' | 'red' | null
//      tags      [{ name, colour }]        tagNames  [name] (flat, for filters)
//      fields    type-specific details, read by the detail panel
//      uuid, event, raw
//  }}
//
//  edge = { from, to, data: { kind, relation, … } }
//
//  The flat keys (family, element, tlp, typeLabel, tagNames, toIds…) exist so
//  that Pivotick's filter panel and legend can read them directly.
// ─────────────────────────────────────────────────────────────────────────────

/** A DOM-safe, stable node id. */
export function nodeId(side, raw) {
    return `${side}_${String(raw).replace(/[^a-zA-Z0-9_\-]/g, '_')}`
}

export function makeNode({ id, side, kind, type, typeLabel, look, label, value, tlp = null,
                           tags = [], fields = {}, uuid = null, event = null, raw = null }) {
    return {
        id,
        data: {
            side, kind, type, typeLabel,
            element: look.element, family: look.family, icon: look.icon,
            color: look.color, shape: look.shape, size: look.size,
            label: label || typeLabel, value: value ?? '',
            tlp, tags, tagNames: tags.map(t => t.name),
            toIds: fields.toIds ?? null,
            hasSightings: !!fields.sightings?.total,
            category: fields.category ?? null,
            fields, uuid, event, raw,
        },
    }
}

let edgeSeq = 0
export function makeEdge(from, to, kind, extra = {}) {
    return { id: `e${++edgeSeq}`, from, to, data: { kind, relation: extra.relation ?? '', ...extra } }
}

/** Drop edges whose ends are missing and duplicate (from,to,kind,relation). */
export function cleanGraph(graph) {
    const ids = new Set(graph.nodes.map(n => n.id))
    const seen = new Set()
    graph.edges = graph.edges.filter(e => {
        if (!ids.has(e.from) || !ids.has(e.to) || e.from === e.to) return false
        const k = `${e.from}>${e.to}>${e.data.kind}>${e.data.relation}`
        if (seen.has(k)) return false
        seen.add(k); return true
    })
    return graph
}
