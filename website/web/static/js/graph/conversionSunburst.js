// ─────────────────────────────────────────────────────────────────────────────
//  ConversionSunburst — CTI data distribution chart
//  Apache ECharts (Apache 2.0) — https://echarts.apache.org/
//  Features: sunburst + treemap, input/output side, dark/light theme,
//            click-slice → JsonViewer panel (highlight, tree, format, download, copy).
// ─────────────────────────────────────────────────────────────────────────────
import JsonViewer from './jsonViewer.js'
import { escapeHtml } from './searchHighlight.js'

const PALETTE = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
    '#06b6d4', '#a855f7', '#f97316', '#14b8a6', '#6366f1',
    '#ec4899', '#84cc16', '#0ea5e9', '#d946ef', '#22c55e',
    '#f43f5e', '#0891b2', '#7c3aed', '#65a30d', '#ea580c',
]

// ── ECharts lazy loader ───────────────────────────────────────────────────────
let _echartsPromise = null
function loadECharts() {
    if (window.echarts) return Promise.resolve(window.echarts)
    if (_echartsPromise) return _echartsPromise
    _echartsPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js'
        s.onload = () => resolve(window.echarts)
        s.onerror = () => reject(new Error('Failed to load ECharts from CDN'))
        document.head.appendChild(s)
    })
    return _echartsPromise
}

// ── MISP parser — returns { tree, stats, rows } ───────────────────────────────
function parseMisp(text) {
    let data
    try { data = JSON.parse(text) } catch { return null }

    const _KEYS = new Set(['info', 'uuid', 'Attribute', 'Object', 'Tag'])
    let ev = data?.Event
        ?? data?.response?.[0]?.Event
        ?? (Array.isArray(data) ? (data[0]?.Event ?? data[0]) : null)
        ?? (typeof data === 'object' && [..._KEYS].some(k => k in data) ? data : null)
    if (!ev) return null

    // Flat list of all raw attribute objects (with origin context for the viewer)
    const rows = []
    for (const a of (ev.Attribute || []))
        rows.push({ ...a, _origin: 'attribute' })
    for (const obj of (ev.Object || []))
        for (const a of (obj.Attribute || []))
            rows.push({ ...a, _object_name: obj.name, _origin: 'object' })

    if (!rows.length) return null

    // Group by category → type for the tree
    const catMap = {}
    for (const a of rows) {
        const cat = a.category || 'Other'
        const type = a.type || 'unknown'
        if (!catMap[cat]) catMap[cat] = {}
        catMap[cat][type] = (catMap[cat][type] || 0) + 1
    }

    let total = 0
    const children = Object.entries(catMap)
        .sort((a, b) => {
            const sa = Object.values(b[1]).reduce((x, y) => x + y, 0)
            const sb = Object.values(a[1]).reduce((x, y) => x + y, 0)
            return sa - sb
        })
        .map(([cat, types], ci) => {
            const color = PALETTE[ci % PALETTE.length]
            const typeChildren = Object.entries(types)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => {
                    total += count
                    return { name: type, value: count, itemStyle: { color }, _category: cat }
                })
            return { name: cat, itemStyle: { color }, children: typeChildren }
        })

    return {
        format: 'misp',
        tree: { name: 'MISP Event', children },
        stats: { types: Object.keys(catMap).length, total },
        rows,
    }
}

// ── STIX parser — returns { tree, stats, rows } ───────────────────────────────
function parseStix(text) {
    let data
    try { data = JSON.parse(text) } catch { return null }

    let objects = []
    if (data?.type === 'bundle' && Array.isArray(data.objects)) {
        objects = data.objects
    } else if (Array.isArray(data)) {
        for (const item of data)
            if (item?.type === 'bundle') objects.push(...(item.objects || []))
    }
    if (!objects.length) return null

    const typeMap = {}
    for (const obj of objects) {
        const t = obj.type || 'unknown'
        let sub = t
        if (t === 'indicator' && obj.pattern) {
            const m = obj.pattern.match(/\[(\S+):/)
            sub = m ? m[1] : 'indicator'
        } else if (t === 'relationship' && obj.relationship_type) {
            sub = obj.relationship_type
        }
        if (!typeMap[t]) typeMap[t] = {}
        typeMap[t][sub] = (typeMap[t][sub] || 0) + 1
    }

    let total = 0
    const children = Object.entries(typeMap)
        .sort((a, b) => {
            const sa = Object.values(b[1]).reduce((x, y) => x + y, 0)
            const sb = Object.values(a[1]).reduce((x, y) => x + y, 0)
            return sa - sb
        })
        .map(([type, subs], ci) => {
            const color = PALETTE[ci % PALETTE.length]
            const subChildren = Object.entries(subs)
                .sort((a, b) => b[1] - a[1])
                .map(([sub, count]) => {
                    total += count
                    return { name: sub, value: count, itemStyle: { color }, _type: type }
                })
            if (subChildren.length === 1 && subChildren[0].name === type)
                return { name: type, value: subChildren[0].value, itemStyle: { color } }
            return { name: type, itemStyle: { color }, children: subChildren }
        })

    return {
        format: 'stix',
        tree: { name: 'STIX Bundle', children },
        stats: { types: Object.keys(typeMap).length, total },
        rows: objects,
    }
}

function detectFormat(text) {
    if (!text) return 'unknown'
    const s = text.trimStart()
    if (s.includes('"type":"bundle"') || s.includes('"type": "bundle"')) return 'stix'
    if (s.includes('"Event"') || s.includes('"Attribute"')) return 'misp'
    return 'unknown'
}

// ── Tooltip formatters ────────────────────────────────────────────────────────
// ECharts parses a function formatter's return value as HTML, and the slice
// names come straight from the converted bundle (STIX type, relationship_type,
// pattern prefix; MISP category/type) - attacker-controlled. Only the
// interpolated values need escaping; the surrounding markup is ours. The
// canvas-drawn label formatters inside the option objects render as text and
// need none of this.
export function sunburstTooltipFormatter(p) {
    return `<strong>${escapeHtml(p.name)}</strong>${p.data?.value ? '<br>' + escapeHtml(p.data.value) + ' item(s)' : ''}`
}

export function treemapTooltipFormatter(p) {
    return `<strong>${escapeHtml(p.name)}</strong><br>${escapeHtml(p.value)} item(s)`
}

// ── Vue component ─────────────────────────────────────────────────────────────
const ConversionSunburst = {
    delimiters: ['[[', ']]'],
    components: { 'json-viewer': JsonViewer },
    props: { conversionData: { type: Object, default: null } },
    template: `
<div class="csb-wrapper">

    <div class="csb-toolbar">
        <div class="csb-btn-group">
            <button class="csb-tab-btn" :class="{active: side==='input'}"  @click="setSide('input')">
                <i class="fas fa-file-import me-1"></i> Input
            </button>
            <button class="csb-tab-btn" :class="{active: side==='output'}" @click="setSide('output')">
                <i class="fas fa-file-export me-1"></i> Output
            </button>
        </div>
        <div class="csb-btn-group">
            <button class="csb-tab-btn" :class="{active: viewMode==='sunburst'}" @click="setView('sunburst')">
                <i class="fas fa-circle-dot me-1"></i> Sunburst
            </button>
            <button class="csb-tab-btn" :class="{active: viewMode==='treemap'}" @click="setView('treemap')">
                <i class="fas fa-table-cells me-1"></i> Treemap
            </button>
        </div>
        <div class="csb-stats" v-if="stats">
            <span class="csb-stat-chip">
                <i class="fas fa-layer-group" style="font-size:.7rem;"></i>
                [[ stats.types ]] categories
            </span>
            <span class="csb-stat-chip">
                <i class="fas fa-hashtag" style="font-size:.7rem;"></i>
                [[ stats.total ]] items
            </span>
            <span class="csb-stat-chip csb-format-chip">[[ detectedFormat ]]</span>
        </div>
    </div>

    <div v-if="loading" class="csb-state">
        <div class="spinner-border spinner-border-sm me-2" style="color:var(--accent);"></div>
        Building chart…
    </div>
    <div v-else-if="error" class="csb-state csb-state--error">
        <i class="fas fa-exclamation-triangle me-2"></i>[[ error ]]
    </div>
    <div v-else-if="!stats" class="csb-state">
        <i class="fas fa-circle-dot me-2" style="opacity:.3; font-size:1.4rem;"></i>
        No data to display for this side.
    </div>
    <div v-show="stats && !loading && !error" ref="chartEl" class="csb-chart"
        style="cursor:pointer;" title="Click a slice to see the matching items"></div>

    <!-- Legend -->
    <div class="csb-legend" v-if="legendItems.length">
        <span v-for="item in legendItems" :key="item.name" class="csb-legend-item">
            <span class="csb-legend-dot" :style="{background: item.color}"></span>
            [[ item.name ]]
            <span class="csb-legend-count">([[ item.total ]])</span>
        </span>
    </div>

    <!-- Powered by -->
    <div class="mt-2 text-end" style="font-size:0.72rem; color:var(--text-3);">
        Sunburst powered by <a href="https://echarts.apache.org/" target="_blank" rel="noopener"
            style="color:var(--text-3); text-decoration:underline; text-underline-offset:2px;">Apache ECharts</a>
        <span style="opacity:.5; margin:0 4px;">·</span>
        <a href="https://github.com/apache/echarts" target="_blank" rel="noopener"
            style="color:var(--text-3); text-decoration:underline; text-underline-offset:2px;">Apache 2.0</a>
    </div>

    <!-- Slice JSON viewer -->
    <div v-if="selectedSlice" class="csb-json-panel">
        <div class="csb-json-panel-header">
            <span>
                <i class="fas fa-code me-2" style="color:var(--accent);"></i>
                <strong>[[ selectedSlice.name ]]</strong>
                <span style="color:var(--text-3); font-size:.8rem; margin-left:.5rem;">
                    — [[ selectedSlice.items.length ]] item(s)
                    <span v-if="selectedSlice.truncated"> (first 200 shown)</span>
                </span>
            </span>
            <button class="csb-json-close" @click="selectedSlice = null">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <json-viewer
            :json="selectedSlice.items"
            :filename="selectedSlice.name">
        </json-viewer>
    </div>

</div>
    `,

    setup(props) {
        const { ref, watch, onMounted, onUnmounted, computed } = Vue

        const side = ref('input')
        const viewMode = ref('sunburst')
        const loading = ref(false)
        const error = ref('')
        const stats = ref(null)
        const legendItems = ref([])
        const chartEl = ref(null)
        const selectedSlice = ref(null)
        let chartInst = null
        let parsedData = null   // holds { format, tree, rows } for click handler
        let resizeObs = null

        const detectedFormat = computed(() => {
            if (!props.conversionData) return ''
            const text = side.value === 'input'
                ? props.conversionData.input_text
                : props.conversionData.output_text
            const f = detectFormat(text || '')
            return f === 'misp' ? 'MISP' : f === 'stix' ? 'STIX' : ''
        })

        function isDark() {
            const cls = document.documentElement.className
            return cls.includes('dark') || cls.includes('dusk')
        }

        function buildSunburstOption(tree, dark) {
            return {
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'item',
                    formatter: sunburstTooltipFormatter
                },
                series: [{
                    type: 'sunburst',
                    data: tree.children,
                    radius: ['15%', '90%'],
                    nodeClick: 'zoomToNode',
                    sort: undefined,
                    emphasis: { focus: 'ancestor' },
                    levels: [
                        {},
                        { r0: '15%', r: '50%', label: { rotate: 'tangential', fontSize: 11, fontWeight: 600 }, itemStyle: { borderWidth: 2 } },
                        { r0: '50%', r: '90%', label: { align: 'right', fontSize: 10, formatter: p => p.data.value > 0 ? `${p.name}\n${p.data.value}` : p.name }, itemStyle: { borderWidth: 1 } },
                    ],
                    label: { color: dark ? '#e2e8f0' : '#1e293b' },
                }],
            }
        }

        function buildTreemapOption(tree, dark) {
            const flatData = tree.children.map(cat => ({
                name: cat.name,
                value: cat.children ? cat.children.reduce((s, c) => s + (c.value || 0), 0) : (cat.value || 0),
                itemStyle: cat.itemStyle,
                children: cat.children,
            }))
            return {
                backgroundColor: 'transparent',
                tooltip: { formatter: treemapTooltipFormatter },
                series: [{
                    type: 'treemap',
                    data: flatData,
                    width: '100%',
                    height: '100%',
                    roam: false,
                    nodeClick: 'zoomToNode',
                    breadcrumb: { show: true, height: 24 },
                    label: { show: true, fontSize: 12, fontWeight: 600, color: dark ? '#e2e8f0' : '#1e293b', formatter: p => `${p.name}\n${p.value}` },
                    upperLabel: { show: true, height: 28, fontSize: 11, fontWeight: 700, color: '#fff' },
                    levels: [
                        { itemStyle: { borderWidth: 3, borderColor: dark ? '#1a1f2e' : '#f1f5f9', gapWidth: 3 }, upperLabel: { show: true } },
                        { itemStyle: { borderWidth: 1, borderColor: dark ? '#252d3d' : '#e2e8f0', gapWidth: 1 } },
                    ],
                }],
            }
        }

        // ── Find rows matching a clicked slice name ───────────────────────────
        function getSliceItems(name) {
            if (!parsedData) return []
            const { format, rows, tree } = parsedData

            if (format === 'misp') {
                // name could be a category or an attribute type
                const isCat = tree.children.some(c => c.name === name)
                return isCat
                    ? rows.filter(r => r.category === name)
                    : rows.filter(r => r.type === name)
            } else {
                // name could be a STIX object type or a sub-type (relationship_type / SCO)
                const isType = tree.children.some(c => c.name === name)
                if (isType) return rows.filter(r => r.type === name)
                // sub-type: indicator pattern type or relationship type
                return rows.filter(r => {
                    if (r.type === 'indicator' && r.pattern) {
                        const m = r.pattern.match(/\[(\S+):/)
                        return m && m[1] === name
                    }
                    return r.relationship_type === name
                })
            }
        }

        async function render() {
            if (!props.conversionData) return
            loading.value = true
            error.value = ''
            stats.value = null
            legendItems.value = []
            selectedSlice.value = null
            parsedData = null

            const text = side.value === 'input'
                ? props.conversionData.input_text
                : props.conversionData.output_text

            if (!text) { loading.value = false; return }

            const fmt = detectFormat(text)
            const parsed = fmt === 'misp' ? parseMisp(text)
                : fmt === 'stix' ? parseStix(text)
                    : null

            if (!parsed) {
                error.value = 'Could not parse data — unsupported format or empty content.'
                loading.value = false
                return
            }

            parsedData = parsed
            stats.value = parsed.stats

            legendItems.value = (parsed.tree.children || []).map(c => ({
                name: c.name,
                color: c.itemStyle?.color ?? '#888',
                total: c.children ? c.children.reduce((s, cc) => s + (cc.value || 0), 0) : (c.value || 0),
            }))

            let ec
            try { ec = await loadECharts() }
            catch {
                error.value = 'Could not load ECharts from CDN. Check your internet connection.'
                loading.value = false
                return
            }

            loading.value = false
            await Vue.nextTick()
            if (!chartEl.value) return

            const dark = isDark()
            if (chartInst) { chartInst.dispose(); chartInst = null }
            chartInst = ec.init(chartEl.value, dark ? 'dark' : null)

            const option = viewMode.value === 'sunburst'
                ? buildSunburstOption(parsed.tree, dark)
                : buildTreemapOption(parsed.tree, dark)

            chartInst.setOption(option, true)

            // Click handler — find raw items for the clicked slice
            chartInst.on('click', params => {
                const name = params.data?.name || params.name
                if (!name || name === 'MISP Event' || name === 'STIX Bundle') return
                const all = getSliceItems(name)
                const items = all.slice(0, 200)
                selectedSlice.value = all.length
                    ? { name, items, truncated: all.length > 200 }
                    : null
            })

            // If the tab was hidden on init, ECharts has 0 dimensions.
            // ResizeObserver fires when the container becomes visible → resize.
            if (resizeObs) resizeObs.disconnect()
            resizeObs = new ResizeObserver(() => {
                if (chartInst && chartEl.value?.offsetWidth > 0) {
                    chartInst.resize()
                }
            })
            resizeObs.observe(chartEl.value)
        }

        function setSide(s) { side.value = s; render() }
        function setView(v) { viewMode.value = v; render() }

        function onResize() { chartInst?.resize() }
        window.addEventListener('resize', onResize)
        document.documentElement.addEventListener('themechange', render)

        onUnmounted(() => {
            window.removeEventListener('resize', onResize)
            document.documentElement.removeEventListener('themechange', render)
            resizeObs?.disconnect()
            chartInst?.dispose()
        })

        // immediate: true — fires right on mount when conversionData is already set
        watch(
            () => props.conversionData,
            v => { if (v?.input_text || v?.output_text) render() },
            { immediate: true }
        )

        return {
            side, viewMode, loading, error, stats, legendItems, detectedFormat,
            chartEl, selectedSlice,
            setSide, setView,
        }
    },
}

export default ConversionSunburst
