// ─────────────────────────────────────────────────────────────────────────────
//  Render layer — model → Pivotick `render` options.
//
//  Rules (see .scratch/pivotick-v3/PLAN.md, "Principes de lisibilité"):
//  - a node is an icon in its family colour, on a plain disc of the canvas
//    background with a thin ring of the same colour: no filled shapes, no
//    squares. The element (container, observable…) only changes the size;
//  - its label sits below it, short, and only appears once the zoom makes it
//    readable (Pivotick's `minLabelFontSize` gate);
//  - edges carry no text at rest: their kind is read from the line itself
//    (colour, width, dash) and the legend; the relation name shows at a
//    close zoom, on hover and in the sidebar;
//  - badges are kept for two facts only: a restrictive TLP and sightings.
// ─────────────────────────────────────────────────────────────────────────────

import { EDGE_KINDS, RELATION_COLORS, TLP } from '../model/vocabulary.js'

const fa = (icon) => `fa-solid ${icon}`

/** Badges: TLP (when it restricts sharing) on the north-east, sightings south-east. */
function badges(node) {
    const d = node.getData()
    const out = []
    if (d.tlp && d.tlp !== 'clear' && d.tlp !== 'white') {
        const t = TLP[d.tlp]
        out.push({ text: ' ', color: t.color, title: t.label, position: 'ne' })
    }
    const s = d.fields?.sightings
    if (s?.total) out.push({ text: String(s.total), color: '#d97706', title: `${s.total} sighting${s.total > 1 ? 's' : ''}`, position: 'se' })
    return out
}

/** Edge colour: relation colour for semantic edges, the kind's otherwise. */
function edgeColor(edge) {
    const d = edge.getData() ?? {}
    if ((d.kind === 'relationship' || d.kind === 'reference') && RELATION_COLORS[d.relation]) return RELATION_COLORS[d.relation]
    return EDGE_KINDS[d.kind]?.color ?? '#94a3b8'
}

/** Only semantic edges ever get a label, and only at a close zoom. */
function edgeLabel(edge) {
    const d = edge.getData() ?? {}
    if (d.kind === 'contains' || d.kind === 'galaxy' || d.kind === 'correlation') return ''
    return d.relation || ''
}

export function edgeStyleMap() {
    const map = {}
    for (const [kind, k] of Object.entries(EDGE_KINDS)) {
        map[kind] = {
            strokeWidth: k.width, dashed: k.dashed, animateDash: false,
            opacity: kind === 'contains' ? 0.55 : 0.9,
            markerEnd: kind === 'contains' || kind === 'correlation' || kind === 'galaxy' ? 'none' : 'arrow',
        }
    }
    return map
}

/** The `render` block handed to `new Pivotick()`. */
export function renderOptions() {
    return {
        nodeTypeAccessor: (node) => node.getData()?.type ?? 'unknown',
        edgeTypeAccessor: (edge) => edge.getData()?.kind,
        minLabelFontSize: 9,
        defaultNodeStyle: {
            shape: 'circle',
            color: 'var(--pvt-bg-color, #ffffff)',
            size: (node) => node.getData()?.size ?? 12,
            strokeColor: (node) => node.getData()?.color ?? '#64748b',
            strokeWidth: 1.2,
            iconClass: (node) => fa(node.getData()?.icon ?? 'fa-circle'),
            textColor: (node) => node.getData()?.color ?? '#64748b',
            text: (node) => node.getData()?.label ?? '',
            textVerticalShift: -1,
            textFontSize: 10,
            textTruncate: true,
            textMaxWidth: 150,
            badges,
        },
        defaultEdgeStyle: {
            strokeColor: '#94a3b8',
            strokeWidth: 1.2,
            curveStyle: 'straight',
            markerEnd: 'arrow',
            rotateLabel: true,
            styleCb: (edge) => ({ strokeColor: edgeColor(edge) }),
        },
        edgeStyleMap: edgeStyleMap(),
        defaultLabelStyle: {
            fontSize: 8,
            labelAccessor: edgeLabel,
        },
    }
}
