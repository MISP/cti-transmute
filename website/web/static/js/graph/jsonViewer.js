// ─────────────────────────────────────────────────────────────────────────────
//  JsonViewer — reusable JSON display, backed by Vitrine's <vt-json>.
//
//  Tree and raw tabs, search, JSONPath, copy and download come from Vitrine
//  (static/vitrine, loaded through static/js/vitrine.js, theme kept in sync
//  with the site). Used by the sunburst and the table drill-downs.
//
//  Props:
//    json     : Object | Array | String - data to display
//    filename : String - base name for the downloaded file (no extension)
// ─────────────────────────────────────────────────────────────────────────────

import { useVitrine } from '../vitrine.js'

const JsonViewer = {
    props: {
        json: { type: [Object, Array, String], default: null },
        filename: { type: String, default: 'data' },
    },
    template: `<div class="vt-json-host" ref="host"></div>`,
    setup(props) {
        const { ref, watch, onMounted } = Vue
        const host = ref(null)

        async function render() {
            if (!host.value) return
            const text = typeof props.json === 'string' ? props.json : JSON.stringify(props.json ?? null, null, 2)
            const [ok] = await useVitrine('json')
            if (!ok) {
                const pre = document.createElement('pre')
                pre.className = 'code-panel-pre'
                pre.textContent = text
                host.value.replaceChildren(pre)
                return
            }
            const el = document.createElement('vt-json')
            el.setAttribute('variant', 'full')
            el.setAttribute('label', props.filename || 'data')
            el.setAttribute('download', `${(props.filename || 'data').replace(/[^\w.-]+/g, '_')}.json`)
            el.setAttribute('depth', '2')
            el.setAttribute('max-height', '60vh')
            el.content = text
            host.value.replaceChildren(el)
        }

        onMounted(render)
        watch(() => [props.json, props.filename], render)
        return { host }
    },
}

export default JsonViewer
