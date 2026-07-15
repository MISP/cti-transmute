// ─────────────────────────────────────────────────────────────────────────────
//  ConversionTable — flat tabular view of MISP / STIX conversion data
//  Parses JSON client-side (no backend round-trip).
//  Features: search, column sort, pagination, click-row → JsonViewer panel.
// ─────────────────────────────────────────────────────────────────────────────
import JsonViewer from '/static/js/graph/jsonViewer.js'
import { highlightMatches } from './searchHighlight.js'

const PAGE_SIZE = 50

// ── MISP parser ───────────────────────────────────────────────────────────────
function parseMispRows(text) {
    let data
    try { data = JSON.parse(text) } catch { return null }

    const _KEYS = new Set(['info', 'uuid', 'Attribute', 'Object', 'Tag'])
    let ev = data?.Event
        ?? data?.response?.[0]?.Event
        ?? (Array.isArray(data) ? (data[0]?.Event ?? data[0]) : null)
        ?? (typeof data === 'object' && [..._KEYS].some(k => k in data) ? data : null)
    if (!ev) return null

    const rows = []
    for (const a of (ev.Attribute || []))
        rows.push({
            category: a.category || '', type: a.type || '', value: a.value || '',
            comment: a.comment || '', to_ids: a.to_ids ?? false, object: '', _raw: a
        })
    for (const obj of (ev.Object || []))
        for (const a of (obj.Attribute || []))
            rows.push({
                category: a.category || '', type: a.type || '', value: a.value || '',
                comment: a.comment || '', to_ids: a.to_ids ?? false, object: obj.name || '', _raw: a
            })

    if (!rows.length) return null
    return {
        format: 'misp',
        rows,
        columns: [
            { key: 'category', label: 'Category', width: '14%' },
            { key: 'type', label: 'Type', width: '12%' },
            { key: 'value', label: 'Value', width: '35%', mono: true },
            { key: 'object', label: 'Object', width: '12%' },
            { key: 'comment', label: 'Comment', width: '18%' },
            { key: 'to_ids', label: 'To IDS', width: '9%', bool: true },
        ],
    }
}

// ── STIX parser ───────────────────────────────────────────────────────────────
function parseStixRows(text) {
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

    const rows = objects.map(obj => {
        let value = obj.name ?? obj.value ?? obj.pattern ?? obj.description?.slice(0, 120)
            ?? obj.relationship_type ?? ''
        return {
            type: obj.type || '',
            id: (obj.id || '').replace(/^[^-]+-/, '').slice(0, 16) + '…',
            id_full: obj.id || '',
            value,
            created: (obj.created || '').slice(0, 10),
            modified: (obj.modified || '').slice(0, 10),
            _raw: obj,
        }
    })

    return {
        format: 'stix',
        rows,
        columns: [
            { key: 'type', label: 'Object type', width: '14%' },
            { key: 'id', label: 'ID (prefix)', width: '16%', mono: true, title: 'id_full' },
            { key: 'value', label: 'Name / Value', width: '40%', mono: true },
            { key: 'created', label: 'Created', width: '15%' },
            { key: 'modified', label: 'Modified', width: '15%' },
        ],
    }
}

function detectFormat(text) {
    if (!text) return 'unknown'
    const s = text.trimStart()
    if (s.includes('"type":"bundle"') || s.includes('"type": "bundle"')) return 'stix'
    if (s.includes('"Event"') || s.includes('"Attribute"')) return 'misp'
    return 'unknown'
}

// ── Vue component ─────────────────────────────────────────────────────────────
const ConversionTable = {
    delimiters: ['[[', ']]'],
    components: { 'json-viewer': JsonViewer },
    props: { conversionData: { type: Object, default: null } },
    template: `
<div class="ctbl-wrapper">

    <div class="ctbl-toolbar">
        <div class="ctbl-btn-group">
            <button class="ctbl-tab-btn" :class="{active: side==='input'}"  @click="setSide('input')">
                <i class="fas fa-file-import me-1"></i> Input
            </button>
            <button class="ctbl-tab-btn" :class="{active: side==='output'}" @click="setSide('output')">
                <i class="fas fa-file-export me-1"></i> Output
            </button>
        </div>
        <div class="ctbl-search-wrap">
            <i class="fas fa-search ctbl-search-icon"></i>
            <input class="ctbl-search-input" type="text" v-model="search"
                placeholder="Filter rows…" @input="currentPage = 1">
            <button v-if="search" class="ctbl-search-clear" @click="search = ''; currentPage = 1">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="ctbl-stats" v-if="parsed">
            <span class="ctbl-stat-chip">
                <i class="fas fa-table-list" style="font-size:.7rem;"></i>
                [[ filteredRows.length ]] / [[ parsed.rows.length ]] rows
            </span>
            <span class="ctbl-stat-chip ctbl-format-chip">
                [[ parsed.format === 'misp' ? 'MISP' : 'STIX' ]]
            </span>
        </div>
    </div>

    <div v-if="loading" class="ctbl-state">
        <div class="spinner-border spinner-border-sm me-2" style="color:var(--accent);"></div>
        Parsing data…
    </div>
    <div v-else-if="error" class="ctbl-state ctbl-state--error">
        <i class="fas fa-exclamation-triangle me-2"></i>[[ error ]]
    </div>
    <div v-else-if="!parsed" class="ctbl-state">
        <i class="fas fa-table" style="font-size:1.4rem; opacity:.25;"></i>
        No data to display for this side.
    </div>

    <template v-else>
        <div class="ctbl-scroll">
            <table class="ctbl-table">
                <thead>
                    <tr>
                        <th v-for="col in parsed.columns" :key="col.key"
                            :style="{ width: col.width }"
                            class="ctbl-th"
                            :class="{ 'ctbl-th--sorted': sortKey === col.key }"
                            @click="setSort(col.key)">
                            [[ col.label ]]
                            <i class="fas ctbl-sort-icon"
                                :class="sortKey === col.key
                                    ? (sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down')
                                    : 'fa-sort'"></i>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, i) in pageRows" :key="i"
                        class="ctbl-tr"
                        :class="{ 'ctbl-tr--selected': selectedRow === row }"
                        @click="selectRow(row)">
                        <td v-for="col in parsed.columns" :key="col.key"
                            class="ctbl-td"
                            :class="{ 'ctbl-td--mono': col.mono }"
                            :title="col.title ? row[col.title] : ''">
                            <template v-if="col.bool">
                                <span class="ctbl-bool" :class="row[col.key] ? 'ctbl-bool--yes' : 'ctbl-bool--no'">
                                    <i :class="row[col.key] ? 'fas fa-check' : 'fas fa-minus'"></i>
                                </span>
                            </template>
                            <template v-else-if="col.key === 'type' && parsed.format === 'misp'">
                                <span class="ctbl-type-pill">[[ row[col.key] ]]</span>
                            </template>
                            <template v-else-if="col.key === 'type' && parsed.format === 'stix'">
                                <span class="ctbl-stix-pill"
                                    :style="{ background: stixColor(row[col.key]) + '22',
                                              color: stixColor(row[col.key]),
                                              borderColor: stixColor(row[col.key]) + '55' }">
                                    [[ row[col.key] ]]
                                </span>
                            </template>
                            <template v-else-if="search && row[col.key]">
                                <span v-html="highlight(String(row[col.key]))"></span>
                            </template>
                            <template v-else>[[ row[col.key] ]]</template>
                        </td>
                    </tr>
                    <tr v-if="!pageRows.length">
                        <td :colspan="parsed.columns.length" class="ctbl-empty">
                            No rows match your search.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="ctbl-pagination" v-if="totalPages > 1">
            <button class="ctbl-page-btn" :disabled="currentPage === 1"
                @click="currentPage = 1"><i class="fas fa-angles-left"></i></button>
            <button class="ctbl-page-btn" :disabled="currentPage === 1"
                @click="currentPage--"><i class="fas fa-chevron-left"></i></button>
            <span class="ctbl-page-info">Page [[ currentPage ]] / [[ totalPages ]]</span>
            <button class="ctbl-page-btn" :disabled="currentPage === totalPages"
                @click="currentPage++"><i class="fas fa-chevron-right"></i></button>
            <button class="ctbl-page-btn" :disabled="currentPage === totalPages"
                @click="currentPage = totalPages"><i class="fas fa-angles-right"></i></button>
        </div>

        <!-- Row JSON viewer -->
        <div v-if="selectedRow" class="ctbl-json-panel">
            <div class="ctbl-json-panel-header">
                <span>
                    <i class="fas fa-code me-2" style="color:var(--accent);"></i>
                    Raw JSON — <strong>[[ selectedRow.type || selectedRow.category ]]</strong>
                    <span v-if="selectedRow.value" style="color:var(--text-3); font-size:.8rem;">
                        · [[ String(selectedRow.value).slice(0, 60) ]][[ String(selectedRow.value).length > 60 ? '…' : '' ]]
                    </span>
                </span>
                <button class="ctbl-json-close" @click="selectedRow = null">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <json-viewer
                :json="selectedRow._raw"
                :filename="(selectedRow.type || selectedRow.category || 'item')">
            </json-viewer>
        </div>
    </template>

</div>
    `,

    setup(props) {
        const { ref, computed, watch } = Vue

        const side = ref('input')
        const search = ref('')
        const sortKey = ref('')
        const sortDir = ref('asc')
        const currentPage = ref(1)
        const loading = ref(false)
        const error = ref('')
        const parsed = ref(null)
        const selectedRow = ref(null)

        const STIX_COLORS = {
            'indicator': '#7c3aed', 'malware': '#ef4444', 'threat-actor': '#f97316',
            'attack-pattern': '#eab308', 'campaign': '#f59e0b', 'course-of-action': '#10b981',
            'identity': '#8b5cf6', 'vulnerability': '#ec4899', 'tool': '#a855f7',
            'infrastructure': '#6366f1', 'intrusion-set': '#14b8a6', 'relationship': '#94a3b8',
            'report': '#1d4ed8', 'grouping': '#2563eb', 'ipv4-addr': '#0ea5e9',
            'domain-name': '#06b6d4', 'url': '#22d3ee', 'file': '#84cc16',
        }
        function stixColor(type) { return STIX_COLORS[type] || '#64748b' }

        function highlight(text) {
            return highlightMatches(text, search.value)
        }

        const filteredRows = computed(() => {
            if (!parsed.value) return []
            const q = search.value.trim().toLowerCase()
            let rows = q
                ? parsed.value.rows.filter(row =>
                    Object.entries(row)
                        .filter(([k]) => k !== '_raw')
                        .some(([, v]) => String(v).toLowerCase().includes(q))
                )
                : [...parsed.value.rows]

            if (sortKey.value) {
                const k = sortKey.value
                rows.sort((a, b) => {
                    const va = String(a[k] ?? '').toLowerCase()
                    const vb = String(b[k] ?? '').toLowerCase()
                    return sortDir.value === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
                })
            }
            return rows
        })

        const totalPages = computed(() => Math.ceil(filteredRows.value.length / PAGE_SIZE) || 1)
        const pageRows = computed(() => {
            const start = (currentPage.value - 1) * PAGE_SIZE
            return filteredRows.value.slice(start, start + PAGE_SIZE)
        })

        function parse() {
            if (!props.conversionData) return
            const text = side.value === 'input'
                ? props.conversionData.input_text
                : props.conversionData.output_text

            if (!text) { parsed.value = null; return }

            loading.value = true
            error.value = ''
            parsed.value = null
            selectedRow.value = null
            search.value = ''
            currentPage.value = 1
            sortKey.value = ''

            // Defer so the spinner renders before the synchronous parse
            setTimeout(() => {
                const fmt = detectFormat(text)
                const result = fmt === 'misp' ? parseMispRows(text)
                    : fmt === 'stix' ? parseStixRows(text)
                        : null
                if (!result) {
                    error.value = 'Could not parse data — unsupported format or empty content.'
                } else {
                    parsed.value = result
                }
                loading.value = false
            }, 30)
        }

        function setSide(s) { side.value = s; parse() }

        function setSort(key) {
            if (sortKey.value === key) {
                sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
            } else {
                sortKey.value = key
                sortDir.value = 'asc'
            }
            currentPage.value = 1
        }

        function selectRow(row) {
            selectedRow.value = selectedRow.value === row ? null : row
        }

        // immediate: true — fires on mount even when conversionData is already set
        watch(
            () => props.conversionData,
            v => { if (v?.input_text || v?.output_text) parse() },
            { immediate: true }
        )

        return {
            side, search, sortKey, sortDir, currentPage,
            loading, error, parsed, selectedRow,
            filteredRows, totalPages, pageRows,
            setSide, setSort, highlight, stixColor, selectRow,
        }
    },
}

export default ConversionTable
