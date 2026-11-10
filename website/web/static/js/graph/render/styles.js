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

const LABEL_CSS = `
.pvt-node-label-group > rect, g.label-container rect { fill: transparent !important; stroke: none !important; }
.pvt-node-label, g.label-container text {
  paint-order: stroke fill; stroke: var(--pvt-bg, #fff); stroke-width: 3.5px; stroke-linejoin: round;
  font-weight: 500; letter-spacing: .01em;
}
.pvt-node-label { fill: var(--ctx-label-color, #334155); }
g.label-container text { fill: var(--ctx-edge-label-color, #64748b); font-style: italic; }
[data-theme="dark"] { --ctx-label-color: #cbd5e1; --ctx-edge-label-color: #94a3b8; }
`
let labelCss = false
function ensureLabelCss() {
    if (labelCss || typeof document === 'undefined') return
    labelCss = true
    const el = document.createElement('style')
    el.dataset.ctx = 'graph-labels'
    el.textContent = LABEL_CSS
    document.head.appendChild(el)
}

/** The `render` block handed to `new Pivotick()`. */
export function renderOptions() {
    ensureLabelCss()
    return {
        nodeTypeAccessor: (node) => node.getData()?.type ?? 'unknown',
        edgeTypeAccessor: (edge) => edge.getData()?.kind,
        minLabelFontSize: 9,
        defaultNodeStyle: {
            shape: 'circle',
            color: 'var(--pvt-bg, #ffffff)',
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
        // No grey pill behind labels: plain text with a halo of the canvas colour
        // (see LABEL_CSS), so a label stays readable over the lines it crosses.
        defaultLabelStyle: {
            backgroundColor: 'transparent',
            color: 'var(--ctx-label-color, #334155)',
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
    // Everything is drawn inside the measured box: Pivotick clips an html node
    // to its own size, so no shadow halo and no pill hanging outside it.
    const pad = 9
    const box = document.createElement('div')
    box.className = 'ctx-group'
    box.style.cssText = `position:relative;width:${2 * r + 2 * pad}px;height:${2 * r + 2 * pad}px;` +
        `display:grid;place-items:center;box-sizing:border-box`
    const ring = document.createElement('div')
    ring.style.cssText = `width:${2 * r}px;height:${2 * r}px;border-radius:50%;box-sizing:border-box;` +
        `background:var(--pvt-bg,#fff);border:5px double ${color};` +
        `display:grid;place-items:center;color:${color};font-size:${Math.round(r * 0.75)}px`
    const i = document.createElement('i')
    i.className = `fa-solid ${icon}`
    ring.appendChild(i)
    box.appendChild(ring)
    const pill = document.createElement('span')
    pill.textContent = n > 999 ? '999+' : String(n)
    pill.style.cssText = `position:absolute;right:0;top:0;background:${color};color:#fff;` +
        `font:600 10px/1 system-ui,sans-serif;padding:3px 5px;border-radius:8px;white-space:nowrap;` +
        `border:1.5px solid var(--pvt-bg,#fff)`
    box.appendChild(pill)
    return box
}

export function groupStyle(group, base) {
    // Size and footprint match the drawing (ring + halo + pill) so the layout spaces groups.
    const r = groupRadius(group.members?.length ?? 0) + 9
    return { ...base, shape: 'none', html: () => groupElement(group), tiers: [], size: r, layoutSize: r }
}
