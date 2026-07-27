import { escapeGraphLabels, renderRawJson, textCell } from './graphSafety.js'

// ─────────────────────────────────────────────────────────────────────────────
//  GRAPH CONFIG — edit this object to change graph behaviour & appearance.
//  All options are documented inline. No need to touch the logic below.
// ─────────────────────────────────────────────────────────────────────────────
export const GRAPH_CONFIG = {

    // Maximum nodes rendered. Above this the graph is trimmed to the N most
    // connected nodes so the browser stays responsive on large CTI bundles.
    maxNodes: 3000,

    // Which side is shown first when the Graph tab opens ('input' | 'output').
    defaultSide: 'input',

    // Standalone MISP attributes of the same type are collapsed into a single
    // group node when their count reaches this threshold.
    groupingThreshold: 3,

    // Pivotick layout algorithm fed to new Pivotick(container, data, { layout }).
    // Other values Pivotick accepts: 'tree', 'radial', 'grid'.
    layout: { type: 'force' },

    // Pivotick top-level UI options (mode, sidebar default state, …).
    pivotickUI: {
        mode: 'full',
        sidebar: { collapsed: 'auto' },
    },

    // ── Node style maps ───────────────────────────────────────────────────────
    // Each key is a node "type" string.  Supported shapes: circle | square |
    // hexagon | triangle.  Size is the base radius in px.
    // Add or override entries here; unknown types fall back to _default.

    stixStyles: {
        'report': { shape: 'square', color: '#1d4ed8', size: 24 },
        'grouping': { shape: 'square', color: '#2563eb', size: 24 },
        'indicator': { shape: 'hexagon', color: '#7c3aed', size: 18 },
        'malware': { shape: 'hexagon', color: '#ef4444', size: 20 },
        'threat-actor': { shape: 'square', color: '#f97316', size: 22 },
        'attack-pattern': { shape: 'triangle', color: '#eab308', size: 18 },
        'campaign': { shape: 'square', color: '#f59e0b', size: 20 },
        'course-of-action': { shape: 'circle', color: '#10b981', size: 16 },
        'identity': { shape: 'square', color: '#8b5cf6', size: 16 },
        'vulnerability': { shape: 'hexagon', color: '#ec4899', size: 17 },
        'tool': { shape: 'triangle', color: '#a855f7', size: 16 },
        'infrastructure': { shape: 'hexagon', color: '#6366f1', size: 18 },
        'intrusion-set': { shape: 'square', color: '#14b8a6', size: 20 },
        'ipv4-addr': { shape: 'circle', color: '#0ea5e9', size: 13 },
        'ipv6-addr': { shape: 'circle', color: '#0284c7', size: 13 },
        'domain-name': { shape: 'circle', color: '#06b6d4', size: 13 },
        'url': { shape: 'circle', color: '#22d3ee', size: 12 },
        'file': { shape: 'circle', color: '#f97316', size: 13 },
        'email-addr': { shape: 'circle', color: '#fb923c', size: 12 },
        'network-traffic': { shape: 'circle', color: '#38bdf8', size: 11 },
        'marking-definition': { shape: 'square', color: '#dc2626', size: 11 },
        '_default': { shape: 'circle', color: '#64748b', size: 13 },
    },

    mispStyles: {
        'Event': { shape: 'square', color: '#2563eb', size: 26 },
        'Object': { shape: 'hexagon', color: '#7c3aed', size: 18 },
        'attr-network': { shape: 'circle', color: '#0ea5e9', size: 13 },
        'attr-payload': { shape: 'circle', color: '#f97316', size: 13 },
        'attr-external': { shape: 'circle', color: '#10b981', size: 12 },
        'attr-other': { shape: 'circle', color: '#64748b', size: 12 },
        'group-network': { shape: 'hexagon', color: '#0ea5e9', size: 18 },
        'group-payload': { shape: 'hexagon', color: '#f97316', size: 18 },
        'group-external': { shape: 'hexagon', color: '#10b981', size: 17 },
        'group-other': { shape: 'hexagon', color: '#64748b', size: 17 },
        '_default': { shape: 'circle', color: '#64748b', size: 12 },
    },

    // MISP attribute types that belong to the "network" or "payload" families.
    // Extend these sets to reclassify how attributes are coloured.
    mispNetworkTypes: new Set(['ip-src', 'ip-dst', 'domain', 'hostname', 'url', 'uri', 'email-src', 'email-dst']),
    mispPayloadTypes: new Set(['md5', 'sha1', 'sha256', 'sha512', 'filename', 'malware-sample']),
}

// ─────────────────────────────────────────────────────────────────────────────
//  Internal helpers — no need to edit below unless changing the graph logic.
// ─────────────────────────────────────────────────────────────────────────────

function safeId(id) {
    return String(id).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '_')
}

function _mispAttrStyle(attr) {
    const { mispNetworkTypes, mispPayloadTypes } = GRAPH_CONFIG
    if (mispNetworkTypes.has(attr.type)) return 'attr-network'
    if (mispPayloadTypes.has(attr.type)) return 'attr-payload'
    if (attr.category === 'External analysis') return 'attr-external'
    return 'attr-other'
}

function _mispGroupStyle(attrType, category) {
    const { mispNetworkTypes, mispPayloadTypes } = GRAPH_CONFIG
    if (mispNetworkTypes.has(attrType)) return 'group-network'
    if (mispPayloadTypes.has(attrType)) return 'group-payload'
    if (category === 'External analysis') return 'group-external'
    return 'group-other'
}

function _parseMispEvent(event, nodes, edges) {
    const { groupingThreshold } = GRAPH_CONFIG
    const uuidToSafe = {}
    const addedAttrIds = new Set()

    const evId = safeId(event.uuid || 'event-root')
    uuidToSafe[event.uuid || 'event-root'] = evId
    const tlp = (event.Tag || []).find(t => t.name?.startsWith('tlp:'))?.name || ''
    nodes.push({
        id: evId, data: {
            label: event.info || `Event #${event.id || '?'}`,
            sublabel: tlp ? 'TLP:' + tlp.split(':')[1].toUpperCase() : 'Event',
            type: 'Event', raw: event,
        }
    })

    const standaloneAttrs = (event.Attribute ?? []).filter(
        a => !a.object_id || String(a.object_id) === '0'
    )

    const typeGroups = {}
    for (const attr of standaloneAttrs) {
        const t = attr.type || '_unknown'
        if (!typeGroups[t]) typeGroups[t] = []
        typeGroups[t].push(attr)
    }

    for (const [type, attrs] of Object.entries(typeGroups)) {
        if (attrs.length >= groupingThreshold) {
            const clusterId = safeId(`grp-${evId}-${type}`)
            const sampleAttr = attrs[0]
            nodes.push({
                id: clusterId, data: {
                    label: `${type} (${attrs.length})`,
                    sublabel: 'group',
                    type: _mispGroupStyle(type, sampleAttr.category),
                    raw: null,
                }
            })
            edges.push({ from: evId, to: clusterId, data: { label: type } })
            for (const attr of attrs) {
                const nId = safeId(attr.uuid || attr.id)
                if (addedAttrIds.has(nId)) continue
                addedAttrIds.add(nId)
                uuidToSafe[attr.uuid || attr.id] = nId
                nodes.push({
                    id: nId, data: {
                        label: String(attr.value).slice(0, 60),
                        sublabel: attr.type,
                        type: _mispAttrStyle(attr), raw: attr,
                    }
                })
                edges.push({ from: clusterId, to: nId, data: { label: '' } })
            }
        } else {
            for (const attr of attrs) {
                const nId = safeId(attr.uuid || attr.id)
                if (addedAttrIds.has(nId)) continue
                addedAttrIds.add(nId)
                uuidToSafe[attr.uuid || attr.id] = nId
                nodes.push({
                    id: nId, data: {
                        label: String(attr.value).slice(0, 60),
                        sublabel: attr.type,
                        type: _mispAttrStyle(attr), raw: attr,
                    }
                })
                edges.push({ from: evId, to: nId, data: { label: attr.type || '' } })
            }
        }
    }

    const referencedByObject = new Set()
    for (const obj of event.Object ?? []) {
        const oId = safeId(obj.uuid || obj.id)
        uuidToSafe[obj.uuid || obj.id] = oId
        const childAttrs = (obj.Attribute ?? []).reduce((acc, a) => {
            if (a.object_relation && a.value) acc[a.object_relation] = a.value
            return acc
        }, {})
        nodes.push({
            id: oId, data: {
                label: obj.name || `Object #${obj.id}`,
                sublabel: obj['meta-category'] || '',
                type: 'Object', raw: obj, childAttrs,
            }
        })
        edges.push({ from: evId, to: oId, data: { label: '', _default: true } })

        for (const attr of obj.Attribute ?? []) {
            const aId = safeId(attr.uuid || attr.id)
            if (addedAttrIds.has(aId)) {
                edges.push({ from: oId, to: aId, data: { label: attr.object_relation || '' } })
                continue
            }
            addedAttrIds.add(aId)
            uuidToSafe[attr.uuid || attr.id] = aId
            nodes.push({
                id: aId, data: {
                    label: String(attr.value).slice(0, 60),
                    sublabel: attr.object_relation || attr.type,
                    type: _mispAttrStyle(attr), raw: attr,
                }
            })
            edges.push({ from: oId, to: aId, data: { label: attr.object_relation || '' } })
        }

        for (const ref of obj.ObjectReference ?? []) {
            const srcId = uuidToSafe[ref.object_uuid || obj.uuid]
            const dstId = uuidToSafe[ref.referenced_uuid]
            if (!srcId || !dstId) continue
            edges.push({ from: srcId, to: dstId, data: { label: ref.relationship_type || '' } })
            referencedByObject.add(dstId)
        }
    }

    for (let i = edges.length - 1; i >= 0; i--) {
        if (edges[i].data?._default && referencedByObject.has(edges[i].to))
            edges.splice(i, 1)
    }
}

function parseMisp(json) {
    const nodes = [], edges = []
    let raw = Array.isArray(json) ? json[0] : json

    if (raw && !raw.Event && Array.isArray(raw.response)) {
        for (const item of raw.response) {
            const event = item?.Event ?? item
            if (event && typeof event === 'object') _parseMispEvent(event, nodes, edges)
        }
        return { nodes, edges }
    }

    const event = raw?.Event ?? raw
    if (event && typeof event === 'object') _parseMispEvent(event, nodes, edges)
    return { nodes, edges }
}

function parseStix(json) {
    const bundle = Array.isArray(json) ? json[0] : json
    const objects = bundle?.objects ?? []
    const nodes = [], edges = []
    const SKIP = new Set(['observed-data'])
    const idMap = {}

    for (const obj of objects) {
        if (!obj.id || obj.type === 'relationship' || SKIP.has(obj.type)) continue
        const sid = safeId(obj.id)
        idMap[obj.id] = sid
        const label = obj.name || obj.value
            || (obj.pattern ? obj.pattern.slice(0, 55) + '…' : null)
            || (obj.definition?.tlp ? 'TLP:' + obj.definition.tlp.toUpperCase() : null)
            || obj.type
        const mispType = (obj.labels || []).find(l => l.startsWith('misp:type='))
        nodes.push({
            id: sid, data: {
                label: String(label).slice(0, 60),
                sublabel: mispType ? mispType.replace('misp:type=', '').replace(/"/g, '') : obj.type,
                type: obj.type, raw: obj,
            }
        })
    }

    const nodeIds = new Set(nodes.map(n => n.id))
    const linked = new Set()

    for (const obj of objects) {
        if (obj.type !== 'relationship') continue
        const from = idMap[obj.source_ref]
        const to = idMap[obj.target_ref]
        if (!from || !to || !nodeIds.has(from) || !nodeIds.has(to)) continue
        edges.push({ from, to, data: { label: obj.relationship_type || '' } })
        linked.add(from)
        linked.add(to)
    }

    for (const obj of objects) {
        if (obj.type !== 'report') continue
        const fromId = idMap[obj.id]
        if (!fromId) continue
        for (const ref of obj.object_refs ?? []) {
            const toId = idMap[ref]
            if (!toId || !nodeIds.has(toId) || linked.has(toId)) continue
            edges.push({ from: fromId, to: toId, data: { label: '' } })
        }
    }

    return { nodes, edges }
}

export function _nodeProperties(node) {
    const d = node.getData()
    const raw = d?.raw ?? {}
    const props = []

    if (d?.childAttrs && Object.keys(d.childAttrs).length) {
        for (const [key, val] of Object.entries(d.childAttrs))
            props.push({ name: key, value: String(val) })
        props.push({ name: '─────', value: '' })
    }

    if (raw.value) props.push({ name: 'Value', value: String(raw.value) })
    if (raw.type) props.push({ name: 'Type', value: raw.type })
    if (raw.category) props.push({ name: 'Category', value: raw.category })
    if (raw.object_relation) props.push({ name: 'Relation', value: raw.object_relation })
    if (raw.to_ids !== undefined) props.push({ name: 'To IDS', value: raw.to_ids ? 'Yes' : 'No' })
    if (raw['meta-category']) props.push({ name: 'Meta-category', value: raw['meta-category'] })
    if (raw.date) props.push({ name: 'Date', value: raw.date })
    if (raw.name) props.push({ name: 'Name', value: raw.name })
    if (raw.description) props.push({ name: 'Description', value: raw.description })
    if (raw.pattern) props.push({ name: 'Pattern', value: raw.pattern })
    if (raw.created) props.push({ name: 'Created', value: raw.created })
    if (raw.modified) props.push({ name: 'Modified', value: raw.modified })
    if (raw.valid_from) props.push({ name: 'Valid from', value: raw.valid_from })
    if (raw.aliases?.length) props.push({ name: 'Aliases', value: raw.aliases.join(', ') })
    if (raw.labels?.length) props.push({ name: 'Labels', value: raw.labels.filter(l => !l.startsWith('misp:')).join(', ') })
    if (raw.definition?.tlp) props.push({ name: 'TLP', value: raw.definition.tlp.toUpperCase() })
    if (raw.hashes && typeof raw.hashes === 'object') {
        for (const [algo, hash] of Object.entries(raw.hashes))
            props.push({ name: algo, value: String(hash) })
    }

    // Wrap every cell so Pivotick never HTML-parses a converted value: `raw` and
    // `childAttrs` are the untouched originals, and both the name and the value
    // position reach the same sink (childAttrs keys and hash algo names included).
    return props
        .filter(p => p.value !== undefined && p.value !== '')
        .map(p => ({ name: textCell(p.name), value: textCell(p.value) }))
}

function _buildTooltip(node) {
    const d = node.getData()
    const raw = d?.raw ?? {}
    const wrap = document.createElement('div')
    wrap.style.cssText = 'font-size:0.78rem;max-width:300px;line-height:1.6;'

    const addRow = (key, val) => {
        if (!val) return
        const row = document.createElement('div')
        row.style.cssText = 'display:flex;gap:6px;padding:1px 0;'
        const k = document.createElement('span')
        k.style.cssText = 'color:#94a3b8;min-width:80px;flex-shrink:0;font-size:0.72rem;padding-top:1px;'
        k.textContent = key
        const v = document.createElement('span')
        v.style.cssText = 'word-break:break-all;font-weight:500;'
        v.textContent = String(val).slice(0, 120) + (String(val).length > 120 ? '…' : '')
        row.appendChild(k)
        row.appendChild(v)
        wrap.appendChild(row)
    }

    if (d?.childAttrs && Object.keys(d.childAttrs).length) {
        for (const [key, val] of Object.entries(d.childAttrs)) addRow(key, val)
        return wrap
    }

    if (raw.value) addRow('value', raw.value)
    if (raw.category) addRow('category', raw.category)
    if (raw.object_relation) addRow('relation', raw.object_relation)
    if (raw.hashes) {
        for (const [algo, hash] of Object.entries(raw.hashes)) addRow(algo, hash)
    }
    if (raw.pattern) addRow('pattern', raw.pattern)
    if (raw.description) addRow('desc', raw.description)
    if (raw.aliases?.length) addRow('aliases', raw.aliases.join(', '))

    return wrap.children.length ? wrap : null
}

function _showSpinner(containerId, message) {
    const el = document.getElementById(containerId)
    if (!el) return
    el.innerHTML =
        `<div class="graph-spinner-overlay">
            <div class="spinner-border spinner-border-sm" role="status" style="color:var(--accent);"></div>
            <span>${message}</span>
        </div>`
}

async function _initViewer(containerId, jsonText, format) {
    const container = document.getElementById(containerId)
    if (!container) return

    if (typeof window.Pivotick !== 'function') {
        _showSpinner(containerId, 'Loading Pivotick…')
        const retry = () => _initViewer(containerId, jsonText, format)
        window.addEventListener('pivotick-ready', retry, { once: true })
        let attempts = 0
        const poll = setInterval(() => {
            attempts++
            if (typeof window.Pivotick === 'function') {
                clearInterval(poll)
                window.removeEventListener('pivotick-ready', retry)
                _initViewer(containerId, jsonText, format)
            } else if (attempts > 15) {
                clearInterval(poll)
                container.innerHTML = '<p style="padding:2rem;text-align:center;color:#888">Could not load Pivotick.</p>'
            }
        }, 200)
        return
    }

    _showSpinner(containerId, 'Parsing data…')

    // Yield to browser before heavy parsing so the spinner actually renders
    await new Promise(r => setTimeout(r, 0))

    let parsed
    try {
        parsed = format === 'misp' ? parseMisp(JSON.parse(jsonText)) : parseStix(JSON.parse(jsonText))
        escapeGraphLabels(parsed)
    } catch {
        container.innerHTML = '<p style="padding:2rem;text-align:center;color:#888">Could not parse JSON.</p>'
        return
    }

    if (!parsed.nodes.length) {
        container.innerHTML = '<p style="padding:2rem;text-align:center;color:#888">No graph data found.</p>'
        return
    }

    const { maxNodes, layout, pivotickUI, stixStyles, mispStyles } = GRAPH_CONFIG
    if (parsed.nodes.length > maxNodes) {
        const degree = {}
        for (const e of parsed.edges) {
            degree[e.from] = (degree[e.from] || 0) + 1
            degree[e.to] = (degree[e.to] || 0) + 1
        }
        parsed.nodes.sort((a, b) => (degree[b.id] || 0) - (degree[a.id] || 0))
        const kept = new Set(parsed.nodes.slice(0, maxNodes).map(n => n.id))
        parsed.nodes = parsed.nodes.filter(n => kept.has(n.id))
        parsed.edges = parsed.edges.filter(e => kept.has(e.from) && kept.has(e.to))
        container.insertAdjacentHTML('beforebegin',
            `<div class="alert alert-warning py-1 px-3 mb-2" style="font-size:0.8rem">
                <i class="fas fa-triangle-exclamation me-1"></i>
                Large graph — showing the ${maxNodes} most connected nodes.
            </div>`)
    }

    _showSpinner(containerId, 'Building graph…')

    await new Promise(r => setTimeout(r, 0))

    container.innerHTML = ''
    const styleMap = format === 'misp' ? mispStyles : stixStyles

    new window.Pivotick(container, parsed, {
        isDirected: true,
        layout,
        simulation: {
            useWorker: false,
            warmupTicks: parsed.nodes.length > 300 ? 0 : 'auto',
        },
        render: {
            nodeTypeAccessor: (node) => node.getData()?.type ?? '_default',
            nodeStyleMap: styleMap,
            defaultNodeStyle: styleMap['_default'],
            defaultEdgeStyle: { markerEnd: 'arrow' },
            nodeHeaderMap: {
                title: (node) => node.getData()?.label ?? '',
                subtitle: (node) => node.getData()?.sublabel ?? '',
            },
        },
        UI: {
            ...pivotickUI,
            mainHeader: {
                nodeHeaderMap: {
                    title: (node) => node.getData()?.label ?? String(node.id),
                    subtitle: (node) => node.getData()?.sublabel ?? node.getData()?.type ?? '',
                },
                edgeHeaderMap: {
                    title: (edge) => edge.getData()?.label || 'Relationship',
                    subtitle: (edge) => `${edge.from} → ${edge.to}`,
                },
            },
            propertiesPanel: {
                nodePropertiesMap: (node) => _nodeProperties(node),
                edgePropertiesMap: (edge) => [
                    { name: textCell('Relationship'), value: textCell(edge.getData()?.label || '—') },
                    { name: textCell('From'), value: textCell(String(edge.from)) },
                    { name: textCell('To'), value: textCell(String(edge.to)) }
                ],
            },
            tooltip: {
                nodeHeaderMap: {
                    title: (node) => node.getData()?.label ?? '',
                    subtitle: (node) => node.getData()?.sublabel ?? '',
                },
                renderNodeExtra: (node) => _buildTooltip(node),
            },
            contextMenu: {
                menuNode: {
                    topbar: [{
                        text: 'Copy value',
                        iconClass: 'fas fa-copy',
                        onclick: (evt, node) => {
                            const d = node.getData()
                            const raw = d?.raw ?? {}
                            let val
                            if (d?.childAttrs && Object.keys(d.childAttrs).length) {
                                val = Object.entries(d.childAttrs).map(([k, v]) => `${k}: ${v}`).join('\n')
                            } else {
                                val = raw.value || raw.name || raw.pattern || d?.label || String(node.id)
                            }
                            navigator.clipboard.writeText(val).catch(() => { })
                        },
                    }],
                    menu: [{
                        text: 'Open raw JSON',
                        iconClass: 'fas fa-code',
                        onclick: (evt, node) => {
                            const raw = node.getData()?.raw ?? {}
                            const isDark = document.documentElement.classList.contains('dark-mode')
                            const win = window.open('', '_blank')
                            if (win) renderRawJson(win, raw, isDark)
                        },
                    }],
                },
            },
        },
    })
}

// ─────────────────────────────────────────────────────────────────────────────
//  Public API
// ─────────────────────────────────────────────────────────────────────────────

let _conversionData = null
let _renderedSides = { input: false, output: false }

function _renderSide(side) {
    if (!_conversionData || _renderedSides[side]) return
    _renderedSides[side] = true
    const isStixToMisp = _conversionData.conversion_type === 'STIX_TO_MISP'
    const containerId = side === 'input' ? 'graph-container' : 'graph-container-output'
    const format = side === 'input'
        ? (isStixToMisp ? 'stix' : 'misp')
        : (isStixToMisp ? 'misp' : 'stix')
    const text = side === 'input' ? _conversionData.input_text : _conversionData.output_text
    _showSpinner(containerId, 'Building graph…')
    _initViewer(containerId, text, format)
}

/** Switch the visible graph side. Triggers lazy render of the new side if needed. */
export function showGraphSide(side) {
    const inEl = document.getElementById('graph-container')
    const outEl = document.getElementById('graph-container-output')
    const btnIn = document.getElementById('graph-view-input')
    const btnOut = document.getElementById('graph-view-output')
    if (!inEl || !outEl) return
    inEl.style.display = side === 'input' ? '' : 'none'
    outEl.style.display = side === 'output' ? '' : 'none'
    if (btnIn) btnIn.className = 'btn btn-sm ' + (side === 'input' ? 'btn-primary' : 'btn-outline-secondary')
    if (btnOut) btnOut.className = 'btn btn-sm ' + (side === 'output' ? 'btn-primary' : 'btn-outline-secondary')
    _renderSide(side)
}

/** Deep-merge a config patch into GRAPH_CONFIG. */
export function applyConfig(patch) {
    if (patch.maxNodes !== undefined) GRAPH_CONFIG.maxNodes = +patch.maxNodes || GRAPH_CONFIG.maxNodes
    if (patch.defaultSide !== undefined) GRAPH_CONFIG.defaultSide = patch.defaultSide
    if (patch.groupingThreshold !== undefined) GRAPH_CONFIG.groupingThreshold = +patch.groupingThreshold || GRAPH_CONFIG.groupingThreshold
    if (patch.layout?.type !== undefined) GRAPH_CONFIG.layout.type = patch.layout.type
    if (patch.pivotickUI?.mode !== undefined) GRAPH_CONFIG.pivotickUI.mode = patch.pivotickUI.mode
    if (patch.pivotickUI?.sidebar?.collapsed !== undefined) GRAPH_CONFIG.pivotickUI.sidebar.collapsed = patch.pivotickUI.sidebar.collapsed
    if (patch.stixStyles) {
        for (const [k, v] of Object.entries(patch.stixStyles)) {
            GRAPH_CONFIG.stixStyles[k] = { ...(GRAPH_CONFIG.stixStyles[k] ?? {}), ...v }
        }
    }
    if (patch.mispStyles) {
        for (const [k, v] of Object.entries(patch.mispStyles)) {
            GRAPH_CONFIG.mispStyles[k] = { ...(GRAPH_CONFIG.mispStyles[k] ?? {}), ...v }
        }
    }
    if (Array.isArray(patch.mispNetworkTypes)) GRAPH_CONFIG.mispNetworkTypes = new Set(patch.mispNetworkTypes)
    if (Array.isArray(patch.mispPayloadTypes)) GRAPH_CONFIG.mispPayloadTypes = new Set(patch.mispPayloadTypes)
}

/** Re-render the currently visible side (call after applyConfig). */
export function reRenderGraph() {
    if (!_conversionData) return
    document.querySelectorAll('.alert.alert-warning').forEach(el => {
        if (el.textContent.includes('most connected nodes')) el.remove()
    })
    // Detect which side is currently visible and re-render only that one
    const outEl = document.getElementById('graph-container-output')
    const activeSide = outEl?.style.display === 'none' || !outEl ? 'input' : 'output'
    _renderedSides[activeSide] = false
    _renderSide(activeSide)
}

/**
 * Call this once the conversion data is available (after the API response).
 * It registers the lazy-render hook so the graph only builds when the tab
 * is first opened.
 *
 * @param {object} conversionData  — the object returned by /conversions/get_conversion
 */
export function initConversionGraph(conversionData) {
    _conversionData = conversionData
    _renderedSides = { input: false, output: false }

    window.onGraphTabClick = function () {
        // Render only the default side on first tab open
        const side = GRAPH_CONFIG.defaultSide
        showGraphSide(side)
    }

    // Expose globals for onclick= attributes in the template
    window.showGraphSide = showGraphSide
}
