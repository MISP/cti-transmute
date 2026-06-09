// ─────────────────────────────────────────────────────────────────────────────
//  JsonViewer — reusable JSON display component
//  Same features as the Input/Output viewer in detail.html:
//    - Syntax highlighting via highlight.js (already loaded in the page)
//    - Collapsible tree view (same jtBuildNode renderer as detail.html)
//    - Format (pretty-print), Download (.json), Copy buttons
//
//  Props:
//    json     : Object | Array | String — data to display
//    filename : String — base name for the downloaded file (no extension)
// ─────────────────────────────────────────────────────────────────────────────

// ── Tree builder — exact copy of jtEl / jtPrimitive / jtBuildNode / jtRender
// from detail.html so the viewer is fully self-contained.
function jtEl(tag, cls, text) {
    const e = document.createElement(tag)
    if (cls)             e.className   = cls
    if (text !== undefined) e.textContent = text
    return e
}

function jtPrimitive(val) {
    if (val === null)             return jtEl('span', 'jt-null',  'null')
    if (typeof val === 'boolean') return jtEl('span', 'jt-bool',  String(val))
    if (typeof val === 'number')  return jtEl('span', 'jt-num',   String(val))
    return jtEl('span', 'jt-str', JSON.stringify(val))
}

function jtBuildNode(val, key, isLast, depth) {
    const isPrim  = val === null || typeof val !== 'object'
    const isArr   = !isPrim && Array.isArray(val)
    const open    = isArr ? '[' : '{'
    const close   = isArr ? ']' : '}'
    const entries = isPrim ? null : (isArr ? val.map((v) => [null, v]) : Object.entries(val))

    if (isPrim || !entries.length) {
        const row = document.createElement('div')
        row.className = 'jt-row'
        if (key !== null) {
            row.appendChild(jtEl('span', 'jt-key',   JSON.stringify(key)))
            row.appendChild(jtEl('span', 'jt-punct', ': '))
        }
        row.appendChild(isPrim ? jtPrimitive(val) : jtEl('span', 'jt-punct', open + close))
        if (!isLast) row.appendChild(jtEl('span', 'jt-punct', ','))
        return row
    }

    const n   = entries.length
    const lbl = isArr ? `${n} item${n !== 1 ? 's' : ''}` : `${n} key${n !== 1 ? 's' : ''}`
    const det = document.createElement('details')
    if (depth < 2) det.open = true

    const sum = document.createElement('summary')
    sum.appendChild(jtEl('span', 'jt-toggle', '▶'))
    if (key !== null) {
        sum.appendChild(jtEl('span', 'jt-key',   JSON.stringify(key)))
        sum.appendChild(jtEl('span', 'jt-punct', ': '))
    }
    sum.appendChild(jtEl('span', 'jt-punct', open))
    sum.appendChild(jtEl('span', 'jt-preview', ` ${lbl} ${close}`))
    det.appendChild(sum)

    const body = document.createElement('div')
    body.className = 'jt-body'
    entries.forEach(([k, v], i) => body.appendChild(jtBuildNode(v, k, i === n - 1, depth + 1)))
    det.appendChild(body)

    const footer = jtEl('div', 'jt-footer')
    footer.appendChild(jtEl('span', 'jt-punct', close))
    if (!isLast) footer.appendChild(jtEl('span', 'jt-punct', ','))
    det.appendChild(footer)
    return det
}

function jtRender(jsonText, container) {
    container.innerHTML = ''
    if (jsonText.length > 800 * 1024) {
        container.innerHTML = `<p style="padding:2rem;text-align:center;color:var(--text-3)"><i class="fas fa-info-circle me-2"></i>File too large for tree view (${Math.round(jsonText.length / 1024)} KB)</p>`
        return
    }
    try {
        const wrap = document.createElement('div')
        wrap.appendChild(jtBuildNode(JSON.parse(jsonText), null, true, 0))
        container.appendChild(wrap)
    } catch {
        container.innerHTML = '<p style="padding:1.5rem;color:var(--danger)"><i class="fas fa-xmark me-2"></i>Invalid JSON</p>'
    }
}

// ── Vue component ─────────────────────────────────────────────────────────────
const JsonViewer = {
    delimiters: ['[[', ']]'],
    props: {
        json:     { type: [Object, Array, String, null], default: null },
        filename: { type: String, default: 'data' },
    },
    template: `
<div class="jv-wrapper">

    <!-- Toolbar -->
    <div class="jv-toolbar">
        <button class="btn btn-sm"
            :class="treeMode ? 'btn-primary' : 'btn-outline-secondary'"
            @click="toggleTree()">
            <i class="fas fa-sitemap me-1"></i>
            [[ treeMode ? 'Raw' : 'Tree' ]]
        </button>
        <button class="btn btn-sm btn-outline-secondary" @click="format()">
            <i class="fas fa-align-left me-1"></i> Format
        </button>
        <button class="btn btn-sm btn-outline-secondary" @click="download()">
            <i class="fas fa-download me-1"></i> Download
        </button>
        <button class="btn btn-sm btn-outline-secondary" @click="copy()">
            <i class="fas fa-copy me-1"></i> [[ copied ? 'Copied!' : 'Copy' ]]
        </button>
    </div>

    <!-- Highlighted raw view -->
    <div v-show="!treeMode" class="jv-pre-wrap">
        <div v-if="highlighting" class="code-loading-overlay" style="position:relative; height:48px;">
            <div class="spinner-border spinner-border-sm me-2" role="status"></div> Highlighting…
        </div>
        <pre v-show="!highlighting" class="code-panel-pre jv-pre"><code ref="codeEl" class="language-json"></code></pre>
    </div>

    <!-- Tree view -->
    <div v-show="treeMode" ref="treeEl" class="jt-root jv-tree"></div>

</div>
    `,

    setup(props) {
        const { ref, watch, nextTick } = Vue

        const treeMode    = ref(false)
        const copied      = ref(false)
        const highlighting = ref(false)
        const codeEl      = ref(null)
        const treeEl      = ref(null)
        let   currentText = ''   // plain JSON string for copy/download/format

        // Convert the incoming json prop to a pretty-printed string
        function toText(json) {
            if (!json) return ''
            if (typeof json === 'string') {
                try { return JSON.stringify(JSON.parse(json), null, 2) } catch { return json }
            }
            return JSON.stringify(json, null, 2)
        }

        // Apply highlight.js to the code element
        function applyHighlight() {
            if (!codeEl.value) return
            const HLJS_LIMIT = 200 * 1024
            codeEl.value.textContent = currentText

            if (currentText.length > HLJS_LIMIT) {
                // Too large — skip hljs
                return
            }
            highlighting.value = true
            setTimeout(() => {
                if (!codeEl.value) return
                codeEl.value.removeAttribute('data-highlighted')
                if (window.hljs) window.hljs.highlightElement(codeEl.value)
                highlighting.value = false
            }, 50)
        }

        // Re-render tree if it's currently shown
        function refreshTree() {
            if (treeMode.value && treeEl.value) {
                jtRender(currentText, treeEl.value)
            }
        }

        // Load new json into the viewer
        async function loadJson(json) {
            currentText  = toText(json)
            treeMode.value = false
            if (treeEl.value) treeEl.value.innerHTML = ''
            await nextTick()
            applyHighlight()
        }

        function toggleTree() {
            treeMode.value = !treeMode.value
            if (treeMode.value && treeEl.value) {
                jtRender(currentText, treeEl.value)
            }
        }

        function format() {
            try {
                currentText = JSON.stringify(JSON.parse(currentText), null, 2)
                applyHighlight()
                refreshTree()
            } catch {}
        }

        function download() {
            const a = Object.assign(document.createElement('a'), {
                href:     URL.createObjectURL(new Blob([currentText], { type: 'application/json' })),
                download: props.filename + '.json',
            })
            a.click()
            URL.revokeObjectURL(a.href)
        }

        async function copy() {
            await navigator.clipboard.writeText(currentText)
            copied.value = true
            setTimeout(() => { copied.value = false }, 1500)
        }

        // Re-apply highlight when theme changes
        document.documentElement.addEventListener('themechange', () => {
            if (!treeMode.value) applyHighlight()
        })

        watch(() => props.json, loadJson, { immediate: true })

        return { treeMode, copied, highlighting, codeEl, treeEl, toggleTree, format, download, copy }
    },
}

export default JsonViewer
