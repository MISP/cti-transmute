// ─────────────────────────────────────────────────────────────────────────────
//  ConvertSunburst — CTI data distribution chart
//  Visualises the distribution of object types / attribute categories
//  from a MISP or STIX conversion using Apache ECharts (Apache 2.0).
//  https://echarts.apache.org/
//
//  Two view modes:
//    - sunburst : radial hierarchy (category → type → count)
//    - treemap  : rectangular density map (same data, different feel)
//
//  Supports input/output side switching, dark/light theme, and both
//  MISP_TO_STIX and STIX_TO_MISP conversion directions.
// ─────────────────────────────────────────────────────────────────────────────

// Colour palette used for the top-level ring slices.
const PALETTE = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
    '#06b6d4', '#a855f7', '#f97316', '#14b8a6', '#6366f1',
    '#ec4899', '#84cc16', '#0ea5e9', '#d946ef', '#22c55e',
    '#f43f5e', '#0891b2', '#7c3aed', '#65a30d', '#ea580c',
]

// ── ECharts loader ────────────────────────────────────────────────────────────
// Loaded on first use — avoids an unnecessary script tag on pages that don't
// open the Sunburst tab.
let _echartsPromise = null
function loadECharts() {
    if (window.echarts) return Promise.resolve(window.echarts)
    if (_echartsPromise)  return _echartsPromise
    _echartsPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js'
        s.onload  = () => resolve(window.echarts)
        s.onerror = () => reject(new Error('Failed to load ECharts from CDN'))
        document.head.appendChild(s)
    })
    return _echartsPromise
}

// ── MISP JSON parser ──────────────────────────────────────────────────────────
// Returns { tree, stats } where tree is the ECharts hierarchy:
//   Event → [categories] → [attribute types with counts]
function parseMisp(text) {
    let data
    try { data = JSON.parse(text) } catch { return null }

    // Unwrap all common MISP JSON wrapper shapes
    const _KEYS = new Set(['info', 'uuid', 'Attribute', 'Object', 'Tag'])
    let ev = data?.Event
        ?? data?.response?.[0]?.Event
        ?? (Array.isArray(data) ? (data[0]?.Event ?? data[0]) : null)
        ?? (typeof data === 'object' && [..._KEYS].some(k => k in data) ? data : null)
    if (!ev) return null

    // Collect every attribute, whether standalone or inside an Object
    const allAttrs = []
    for (const a of (ev.Attribute || [])) allAttrs.push(a)
    for (const obj of (ev.Object || []))
        for (const a of (obj.Attribute || [])) allAttrs.push(a)

    if (!allAttrs.length) return null

    // Group by category → type
    const catMap = {}   // { category: { type: count } }
    for (const a of allAttrs) {
        const cat  = a.category || 'Other'
        const type = a.type     || 'unknown'
        if (!catMap[cat]) catMap[cat] = {}
        catMap[cat][type] = (catMap[cat][type] || 0) + 1
    }

    let total = 0
    const children = Object.entries(catMap)
        .sort((a, b) => {
            const sa = Object.values(b[1]).reduce((x, y) => x + y, 0)
            const sb = Object.values(a[1]).reduce((x, y) => x + y, 0)
            return sa - sb  // largest category first
        })
        .map(([cat, types], ci) => {
            const color = PALETTE[ci % PALETTE.length]
            const typeChildren = Object.entries(types)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => {
                    total += count
                    return { name: type, value: count, itemStyle: { color } }
                })
            return {
                name:      cat,
                itemStyle: { color },
                children:  typeChildren,
            }
        })

    return {
        tree:  { name: 'MISP Event', children },
        stats: { types: Object.keys(catMap).length, total },
    }
}

// ── STIX JSON parser ──────────────────────────────────────────────────────────
// Returns { tree, stats } where tree is:
//   Bundle → [STIX object types] → [sub-types / pattern types for indicators]
function parseStix(text) {
    let data
    try { data = JSON.parse(text) } catch { return null }

    // Handle both raw bundles and MISP-style {response:[{Event:{...}}]} output
    let objects = []
    if (data?.type === 'bundle' && Array.isArray(data.objects)) {
        objects = data.objects
    } else if (Array.isArray(data)) {
        // Could be an array of bundles
        for (const item of data) {
            if (item?.type === 'bundle') objects.push(...(item.objects || []))
        }
    }
    if (!objects.length) return null

    // Group by type, then optionally by sub-category
    const typeMap = {}   // { stix_type: { sub: count } }
    for (const obj of objects) {
        const t = obj.type || 'unknown'
        if (!typeMap[t]) typeMap[t] = {}

        let sub = 'object'
        // For indicators: try to detect the SCO type from the pattern string
        if (t === 'indicator' && obj.pattern) {
            const m = obj.pattern.match(/\[(\S+):/)
            sub = m ? m[1] : 'indicator'
        } else if (t === 'observed-data') {
            sub = 'observed-data'
        } else if (t === 'relationship' && obj.relationship_type) {
            sub = obj.relationship_type
        } else {
            sub = t
        }
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
                    return { name: sub, value: count, itemStyle: { color } }
                })

            // If there's only one sub equal to the type itself, flatten
            if (subChildren.length === 1 && subChildren[0].name === type) {
                return { name: type, value: subChildren[0].value, itemStyle: { color } }
            }
            return {
                name:      type,
                itemStyle: { color },
                children:  subChildren,
            }
        })

    return {
        tree:  { name: 'STIX Bundle', children },
        stats: { types: Object.keys(typeMap).length, total },
    }
}

// ── Detect JSON format from text ──────────────────────────────────────────────
function detectFormat(text) {
    if (!text) return 'unknown'
    const s = text.trimStart()
    if (s.includes('"type":"bundle"') || s.includes('"type": "bundle"')) return 'stix'
    if (s.includes('"Event"') || s.includes('"Attribute"')) return 'misp'
    return 'unknown'
}

// ── Vue component ─────────────────────────────────────────────────────────────
const ConvertSunburst = {
    delimiters: ['[[', ']]'],
    props: {
        convertData: { type: Object, default: null },
    },
    template: `
<div class="csb-wrapper">

    <!-- Toolbar: side + view mode + stats -->
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
            <button class="csb-tab-btn" :class="{active: viewMode==='sunburst'}" @click="setView('sunburst')"
                title="Radial sunburst — hierarchy by ring">
                <i class="fas fa-circle-dot me-1"></i> Sunburst
            </button>
            <button class="csb-tab-btn" :class="{active: viewMode==='treemap'}" @click="setView('treemap')"
                title="Treemap — area proportional to count">
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
            <span class="csb-stat-chip csb-format-chip">
                [[ detectedFormat ]]
            </span>
        </div>
    </div>

    <!-- Loading / error / chart -->
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
    <div v-show="stats && !loading && !error" ref="chartEl" class="csb-chart"></div>

    <!-- Legend: top-level categories -->
    <div class="csb-legend" v-if="legendItems.length">
        <span v-for="item in legendItems" :key="item.name" class="csb-legend-item">
            <span class="csb-legend-dot" :style="{background: item.color}"></span>
            [[ item.name ]]
            <span class="csb-legend-count">([[ item.total ]])</span>
        </span>
    </div>

</div>
    `,

    setup(props) {
        const { ref, watch, onMounted, onUnmounted, computed } = Vue

        const side         = ref('input')
        const viewMode     = ref('sunburst')
        const loading      = ref(false)
        const error        = ref('')
        const stats        = ref(null)
        const legendItems  = ref([])
        const chartEl      = ref(null)
        let   chartInst    = null   // ECharts instance

        // ── Detect format of the currently displayed side ─────────────────────
        const detectedFormat = computed(() => {
            if (!props.convertData) return ''
            const text = side.value === 'input'
                ? props.convertData.input_text
                : props.convertData.output_text
            const f = detectFormat(text || '')
            return f === 'misp' ? 'MISP' : f === 'stix' ? 'STIX' : ''
        })

        // ── Detect current theme (dark / light) for ECharts ──────────────────
        function isDark() {
            const cls = document.documentElement.className
            return cls.includes('dark') || cls.includes('dusk')
        }

        // ── Build ECharts option for sunburst ─────────────────────────────────
        function buildSunburstOption(tree, dark) {
            return {
                backgroundColor: 'transparent',
                tooltip: {
                    trigger:   'item',
                    formatter: p => {
                        const val = p.data?.value ?? ''
                        return `<strong>${p.name}</strong>${val ? '<br>' + val + ' item(s)' : ''}`
                    },
                },
                series: [{
                    type:           'sunburst',
                    data:           tree.children,
                    radius:         ['15%', '90%'],
                    nodeClick:      'zoomToNode',
                    sort:           undefined,
                    emphasis:       { focus: 'ancestor' },
                    levels: [
                        {},
                        {
                            r0: '15%', r: '50%',
                            label: { rotate: 'tangential', fontSize: 11, fontWeight: 600 },
                            itemStyle: { borderWidth: 2 },
                        },
                        {
                            r0: '50%', r: '90%',
                            label: {
                                align: 'right', fontSize: 10,
                                formatter: p => p.data.value > 0 ? `${p.name}\n${p.data.value}` : p.name,
                            },
                            itemStyle: { borderWidth: 1 },
                        },
                    ],
                    label: {
                        color: dark ? '#e2e8f0' : '#1e293b',
                    },
                }],
            }
        }

        // ── Build ECharts option for treemap ──────────────────────────────────
        function buildTreemapOption(tree, dark) {
            // Flatten to one level for treemap legibility
            const flatData = tree.children.map(cat => {
                const subtotal = cat.children
                    ? cat.children.reduce((s, c) => s + (c.value || 0), 0)
                    : (cat.value || 0)
                return {
                    name:      cat.name,
                    value:     subtotal,
                    itemStyle: cat.itemStyle,
                    children:  cat.children,
                }
            })
            return {
                backgroundColor: 'transparent',
                tooltip: {
                    formatter: p => `<strong>${p.name}</strong><br>${p.value} item(s)`,
                },
                series: [{
                    type:           'treemap',
                    data:           flatData,
                    width:          '100%',
                    height:         '100%',
                    roam:           false,
                    nodeClick:      'zoomToNode',
                    breadcrumb:     { show: true, height: 24 },
                    label: {
                        show:     true,
                        fontSize: 12,
                        fontWeight: 600,
                        color:    dark ? '#e2e8f0' : '#1e293b',
                        formatter: p => `${p.name}\n${p.value}`,
                    },
                    upperLabel: {
                        show:      true,
                        height:    28,
                        fontSize:  11,
                        fontWeight: 700,
                        color:     '#fff',
                    },
                    levels: [
                        {
                            itemStyle: { borderWidth: 3, borderColor: dark ? '#1a1f2e' : '#f1f5f9', gapWidth: 3 },
                            upperLabel: { show: true },
                        },
                        {
                            itemStyle: { borderWidth: 1, borderColor: dark ? '#252d3d' : '#e2e8f0', gapWidth: 1 },
                        },
                    ],
                }],
            }
        }

        // ── Main render ───────────────────────────────────────────────────────
        async function render() {
            if (!props.convertData) return
            loading.value = true
            error.value   = ''
            stats.value   = null
            legendItems.value = []

            // Choose the right side
            const text = side.value === 'input'
                ? props.convertData.input_text
                : props.convertData.output_text

            if (!text) {
                loading.value = false
                return
            }

            // Parse according to detected format
            const fmt    = detectFormat(text)
            const parsed = fmt === 'misp' ? parseMisp(text)
                         : fmt === 'stix' ? parseStix(text)
                         : null

            if (!parsed) {
                error.value   = 'Could not parse data — unsupported format or empty content.'
                loading.value = false
                return
            }

            stats.value = parsed.stats

            // Build legend from top-level tree children
            legendItems.value = (parsed.tree.children || []).map(c => {
                const total = c.children
                    ? c.children.reduce((s, cc) => s + (cc.value || 0), 0)
                    : (c.value || 0)
                return { name: c.name, color: c.itemStyle?.color ?? '#888', total }
            })

            // Load ECharts (cached after first load)
            let ec
            try { ec = await loadECharts() }
            catch (e) {
                error.value   = 'Could not load ECharts from CDN. Check your internet connection.'
                loading.value = false
                return
            }

            loading.value = false

            // Wait for the DOM element to be visible (tab may be hidden)
            await Vue.nextTick()
            if (!chartEl.value) return

            const dark = isDark()

            // Destroy previous instance if any, then create fresh
            if (chartInst) { chartInst.dispose(); chartInst = null }
            chartInst = ec.init(chartEl.value, dark ? 'dark' : null)
            chartInst.showLoading({ text: '', color: 'var(--accent)', maskColor: 'transparent' })

            const option = viewMode.value === 'sunburst'
                ? buildSunburstOption(parsed.tree, dark)
                : buildTreemapOption(parsed.tree, dark)

            chartInst.hideLoading()
            chartInst.setOption(option, true)
        }

        function setSide(s)  { side.value = s;     render() }
        function setView(v)  { viewMode.value = v; render() }

        // Resize when window changes
        function onResize() { chartInst?.resize() }
        window.addEventListener('resize', onResize)

        // Re-render when convert data arrives
        watch(() => props.convertData, v => { if (v) render() }, { deep: false })

        // Listen to theme changes
        document.documentElement.addEventListener('themechange', render)

        onUnmounted(() => {
            window.removeEventListener('resize', onResize)
            document.documentElement.removeEventListener('themechange', render)
            chartInst?.dispose()
        })

        return { side, viewMode, loading, error, stats, legendItems, detectedFormat, chartEl, setSide, setView }
    },
}

export default ConvertSunburst
