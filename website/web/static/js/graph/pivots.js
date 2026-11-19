// ─────────────────────────────────────────────────────────────────────────────
//  Local pivots — expand from a node using only the document already loaded.
//
//  A view shows part of the document (Infrastructure drops the files, Threat
//  the observables…). A pivot brings back, around the nodes you picked, what
//  the full document holds: no request ever leaves the page.
//
//    neighbours   what the node links to in the full document
//    sameValue    the same value elsewhere in the input (another event, or a
//                 duplicate observable)
//    context      the tags and galaxy clusters the node carries
//
//  Results land grouped by type (Pivotick's `pivotIngestGrouped`), and each
//  pivot offers a facet to narrow by type before anything lands.
// ─────────────────────────────────────────────────────────────────────────────

import { EDGE_KINDS } from './model/vocabulary.js'

/** Adjacency of a model: id → [{ edge, other }]. */
function index(model) {
    const byId = new Map(model.nodes.map(n => [n.id, n]))
    const adj = new Map()
    const add = (a, entry) => { if (!adj.has(a)) adj.set(a, []); adj.get(a).push(entry) }
    for (const e of model.edges) {
        add(e.from, { edge: e, other: e.to })
        add(e.to, { edge: e, other: e.from })
    }
    const byValue = new Map()
    for (const n of model.nodes) {
        const v = String(n.data.value ?? '').toLowerCase()
        if (!v || n.data.element === 'container') continue
        if (!byValue.has(v)) byValue.set(v, [])
        byValue.get(v).push(n.id)
    }
    return { byId, adj, byValue }
}

const plainNode = (n) => ({ id: n.id, data: n.data })
const plainEdge = (e) => ({ id: e.id, from: e.from, to: e.to, data: e.data })

/** A provider from a function: origin nodes → { nodes, edges } candidates. */
function provider({ id, label, collect, appliesTo }) {
    const run = (nodes, narrowing) => {
        const { nodes: found, edges } = collect(nodes)
        const types = narrowing?.type?.length ? new Set(narrowing.type) : null
        const kept = types ? found.filter(n => types.has(n.data.typeLabel)) : found
        const keep = new Set(kept.map(n => n.id))
        return { nodes: kept, edges: edges.filter(e => keep.has(e.from) || keep.has(e.to)) }
    }
    return {
        id, label, maxCandidates: 2000,
        appliesTo,
        summarize: async (nodes, narrowing) => {
            const { nodes: found } = collect(nodes)
            const counts = new Map()
            for (const n of found) counts.set(n.data.typeLabel, (counts.get(n.data.typeLabel) ?? 0) + 1)
            const types = narrowing?.type?.length ? new Set(narrowing.type) : null
            return {
                total: types ? found.filter(n => types.has(n.data.typeLabel)).length : found.length,
                facets: [{
                    key: 'type', label: 'Type', type: 'multiselect',
                    options: [...counts].sort((a, b) => b[1] - a[1]).map(([t, c]) => ({ label: t, value: t, count: c })),
                }],
            }
        },
        fetch: async (nodes, narrowing) => {
            const r = run(nodes, narrowing)
            return { nodes: r.nodes.map(plainNode), edges: r.edges.map(plainEdge) }
        },
    }
}

/**
 * @param {object} full     the whole document as a model (tags as nodes too)
 * @param {object} shown    the view's model (what is on the canvas at mount)
 */
export function localPivots(full) {
    const { byId, adj, byValue } = index(full)
    const known = (n) => byId.has(n.id)

    const neighbours = provider({
        id: 'document', label: 'In this document',
        appliesTo: (nodes) => nodes.filter(known),
        collect: (nodes) => {
            const out = new Map(), edges = []
            for (const n of nodes) for (const { edge, other } of adj.get(n.id) ?? []) {
                const o = byId.get(other)
                if (!o || o.data.kind === 'tag' || o.data.kind === 'galaxy') continue
                out.set(o.id, o); edges.push(edge)
            }
            for (const n of nodes) out.delete(n.id)
            return { nodes: [...out.values()], edges }
        },
    })

    const sameValue = provider({
        id: 'sameValue', label: 'Same value elsewhere',
        appliesTo: (nodes) => nodes.filter(n => known(n) && String(n.getData?.()?.value ?? '').length),
        collect: (nodes) => {
            const out = new Map(), edges = []
            for (const n of nodes) {
                const v = String(n.getData?.()?.value ?? '').toLowerCase()
                for (const id of byValue.get(v) ?? []) {
                    if (id === n.id) continue
                    out.set(id, byId.get(id))
                    edges.push({ id: `same:${n.id}:${id}`, from: n.id, to: id, data: { kind: 'correlation', relation: 'same value', label: 'same value' } })
                }
            }
            return { nodes: [...out.values()], edges }
        },
    })

    const context = provider({
        id: 'context', label: 'Tags & galaxies',
        appliesTo: (nodes) => nodes.filter(known),
        collect: (nodes) => {
            const out = new Map(), edges = []
            for (const n of nodes) for (const { edge, other } of adj.get(n.id) ?? []) {
                const o = byId.get(other)
                if (o && (o.data.kind === 'tag' || o.data.kind === 'galaxy')) { out.set(o.id, o); edges.push(edge) }
            }
            return { nodes: [...out.values()], edges }
        },
    })

    return [neighbours, sameValue, context]
}

export { EDGE_KINDS }
