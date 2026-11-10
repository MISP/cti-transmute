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
            // No icon for nodes without one (Simplify groups draw their own html).
            iconClass: (node) => node.getData()?.icon ? fa(node.getData().icon) : undefined,
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
        groupStyle,
        defaultLabelStyle: {
            fontSize: 8,
            labelAccessor: edgeLabel,
        },
    }
}

// ── Simplify groups ──────────────────────────────────────────────────────────
//  A group reads like a node of its type, stacked: the same icon and colour on
//  a double ring, with the member count in a pill. A group mixing types gets a
//  neutral layered icon.

function groupLook(group) {
    const first = group.members?.[0]?.getData?.() ?? {}
    const mixed = Object.keys(group.typeCounts ?? {}).length > 1
    return mixed
        ? { color: '#64748b', icon: 'fa-layer-group' }
        : { color: first.color ?? '#64748b', icon: first.icon ?? 'fa-circle' }
}

const groupRadius = (n) => Math.min(30, 14 + 1.6 * Math.sqrt(n))

function groupElement(group) {
    const { color, icon } = groupLook(group)
    const n = group.members?.length ?? 0
    const r = groupRadius(n)
    const el = document.createElement('div')
    el.className = 'ctx-group'
    el.style.cssText = `position:relative;width:${2 * r}px;height:${2 * r}px;border-radius:50%;` +
        `background:var(--pvt-bg-color,#fff);border:2px solid ${color};` +
        `box-shadow:0 0 0 3px var(--pvt-bg-color,#fff),0 0 0 4.5px ${color};` +
        `display:grid;place-items:center;color:${color};font-size:${Math.round(r * 0.8)}px;box-sizing:border-box`
    const i = document.createElement('i')
    i.className = `fa-solid ${icon}`
    el.appendChild(i)
    const pill = document.createElement('span')
    pill.textContent = n > 999 ? '999+' : String(n)
    pill.style.cssText = `position:absolute;right:${-r * 0.55}px;top:${-r * 0.35}px;background:${color};color:#fff;` +
        `font:600 11px/1 system-ui,sans-serif;padding:3px 6px;border-radius:9px;white-space:nowrap;` +
        `box-shadow:0 0 0 2px var(--pvt-bg-color,#fff)`
    el.appendChild(pill)
    return el
}

export function groupStyle(group, base) {
    // Size and footprint match the drawing (ring + halo + pill) so the layout spaces groups.
    const r = groupRadius(group.members?.length ?? 0) + 8
    return { ...base, shape: 'none', html: () => groupElement(group), tiers: [], size: r, layoutSize: r }
}
