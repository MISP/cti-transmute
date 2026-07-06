// Modal component for pushing a conversion's MISP event to an external MISP instance.
// Register with: app.component('push-convert-to-misp', PushConvertToMISP)
// Usage: <push-convert-to-misp ref="mispModal" :conversion-id="convert.id" :convert-data="convert">
//        Then trigger: $refs.mispModal.open()

const PushConvertToMISP = {
    delimiters: ['[[', ']]'],
    props: {
        conversionId:   { type: Number, required: true },
        convertData: { type: Object, default: null },
    },
    template: `
<div :id="'misp-push-modal-' + conversionId" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content" style="background:var(--surface); border:1px solid var(--border);">

            <!-- Header -->
            <div class="modal-header" style="border-bottom:1px solid var(--border);">
                <h5 class="modal-title d-flex align-items-center gap-2">
                    <img src="/static/image/misp.svg" width="22" height="22" style="vertical-align:middle;">
                    Push to MISP
                </h5>
                <button class="btn-close" data-bs-dismiss="modal" @click="onClose()"></button>
            </div>

            <!-- Body -->
            <div class="modal-body">

                <!-- ── Step 1 : Connection ─────────────────────────── -->
                <div v-if="step === 'connect'">
                    <p style="font-size:0.85rem; color:var(--text-2); margin-bottom:1rem;">
                        Enter your MISP instance credentials to push this event.
                    </p>
                    <div class="mb-3">
                        <label class="form-label">MISP Instance URL</label>
                        <input v-model="mispUrl" type="url" class="form-control"
                            placeholder="https://misp.example.com"
                            @keyup.enter="testConnection()">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">API Key</label>
                        <input v-model="apiKey" type="password" class="form-control"
                            placeholder="Your MISP API key"
                            @keyup.enter="testConnection()">
                    </div>
                    <div v-if="connectError" class="alert alert-danger py-2 px-3"
                        style="font-size:0.84rem;">[[ connectError ]]</div>
                </div>

                <!-- ── Step 2 : Push ───────────────────────────────── -->
                <div v-else>

                    <!-- Connected banner -->
                    <div class="d-flex align-items-center justify-content-between p-2 rounded mb-3"
                        style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); font-size:0.83rem;">
                        <span style="color:#059669;">
                            <i class="fas fa-circle-check me-1"></i> Connected to [[ mispUrl ]]
                        </span>
                        <button class="btn btn-link btn-sm p-0"
                            style="font-size:0.8rem; color:var(--text-3);"
                            @click="step = 'connect'">Change</button>
                    </div>

                    <!-- Event info -->
                    <div class="mb-3">
                        <label class="form-label">Event to push</label>
                        <div v-if="mispEventInfo" class="p-2 rounded"
                            style="background:var(--bg); border:1px solid var(--border); font-size:0.85rem;">
                            <i class="fas fa-bolt me-1" style="color:var(--accent);"></i>
                            <strong>[[ mispEventInfo.info || 'MISP Event' ]]</strong>
                            <span class="ms-2" style="color:var(--text-3); font-size:0.78rem;">
                                ID: [[ mispEventInfo.id ]]
                            </span>
                        </div>
                        <div v-else class="alert alert-warning py-2 px-3" style="font-size:0.84rem;">
                            <i class="fas fa-exclamation-triangle me-1"></i>
                            No MISP event found in this conversion's data.
                        </div>
                    </div>

                    <!-- ── CTI Evaluation Preview ──────────────────── -->
                    <div class="misp-preview-section mb-3">
                        <div class="misp-preview-header" @click="previewOpen = !previewOpen"
                            style="cursor:pointer; user-select:none;">
                            <div class="d-flex align-items-center gap-2">
                                <i class="fas fa-chart-bar" style="color:var(--accent); font-size:.9rem;"></i>
                                <span style="font-weight:600; font-size:.9rem;">CTI Evaluation Data</span>
                                <span v-if="preview" class="misp-preview-badge">
                                    [[ preview.eval_tags.length ]] tag(s) &nbsp;·&nbsp; 1 object
                                </span>
                                <span v-if="previewLoading" style="font-size:.78rem; color:var(--text-3);">
                                    <i class="fas fa-spinner fa-spin me-1"></i> Loading…
                                </span>
                                <span v-if="!preview && !previewLoading" style="font-size:.78rem; color:var(--text-3);">
                                    No evaluation data yet
                                </span>
                            </div>
                            <i class="fas" :class="previewOpen ? 'fa-chevron-up' : 'fa-chevron-down'"
                                style="font-size:.78rem; color:var(--text-3);"></i>
                        </div>

                        <div v-if="previewOpen && preview" class="misp-preview-body">

                            <!-- Overall score pill -->
                            <div v-if="preview.overall_level" class="d-flex align-items-center gap-2 mb-3">
                                <span style="font-size:.8rem; color:var(--text-3);">Overall score</span>
                                <span class="misp-level-pill" :class="'lvl-' + preview.overall_level">
                                    [[ preview.overall_level ]]
                                </span>
                                <span v-if="preview.approval_score !== null"
                                    style="font-size:.8rem; color:var(--text-3);">
                                    ([[ preview.approval_score ]]/100 — [[ preview.vote_count ]] vote(s))
                                </span>
                            </div>

                            <!-- Evaluation tags -->
                            <div class="mb-3">
                                <div class="misp-preview-sublabel">Tags added to the Event</div>
                                <div class="d-flex flex-wrap gap-1 mt-1">
                                    <span v-for="t in preview.eval_tags" :key="t"
                                        class="misp-level-pill"
                                        :class="'lvl-' + levelFromTag(t)"
                                        style="font-family:monospace; font-size:.75rem;">
                                        [[ t ]]
                                    </span>
                                </div>
                            </div>

                            <!-- Detail rows table -->
                            <div class="mb-3">
                                <div class="misp-preview-sublabel">
                                    cti-evaluation Object attributes
                                    <span style="font-weight:400;">(injected into Event → Object[])</span>
                                </div>
                                <div class="misp-attr-table-wrap">
                                    <table class="misp-attr-table">
                                        <thead>
                                            <tr>
                                                <th>Field</th>
                                                <th>Type</th>
                                                <th>Value</th>
                                                <th>What it means</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="a in preview.attributes" :key="a.object_relation + a.value">
                                                <td class="attr-relation">[[ a.object_relation ]]</td>
                                                <td class="attr-type">[[ a.type ]]</td>
                                                <td class="attr-value">[[ a.value ]]</td>
                                                <td class="attr-desc">[[ a.description ]]</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- JSON tabs: cti-evaluation object  |  full event -->
                            <div>
                                <div class="d-flex gap-2 mb-2">
                                    <button class="btn btn-sm"
                                        :class="jsonTab === 'object' ? 'btn-primary' : 'btn-outline-secondary'"
                                        style="font-size:.78rem;"
                                        @click="jsonTab = 'object'; jsonOpen = true">
                                        <i class="fas fa-cube me-1"></i> cti-evaluation object
                                    </button>
                                    <button class="btn btn-sm"
                                        :class="jsonTab === 'event' ? 'btn-primary' : 'btn-outline-secondary'"
                                        style="font-size:.78rem;"
                                        @click="jsonTab = 'event'; jsonOpen = true">
                                        <i class="fas fa-file-code me-1"></i>
                                        Full Event
                                        <span style="opacity:.65; font-size:.72rem;">
                                            ([[ preview.event_stats.object_count ]] obj · [[ preview.event_stats.attribute_count ]] attr · [[ preview.event_stats.tag_count ]] tags)
                                        </span>
                                    </button>
                                    <button v-if="jsonOpen" class="btn btn-sm btn-outline-secondary ms-auto"
                                        style="font-size:.78rem;" @click="jsonOpen = false">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>

                                <div v-if="jsonOpen" class="misp-json-block">
                                    <button class="misp-json-copy" @click="copyJson()">
                                        <i class="fas fa-copy"></i> [[ copied ? 'Copied!' : 'Copy' ]]
                                    </button>
                                    <!-- cti-evaluation object only -->
                                    <pre v-if="jsonTab === 'object'"
                                        style="margin:0; font-size:.78rem; max-height:320px; overflow-y:auto; white-space:pre-wrap;">[[ JSON.stringify(preview.cti_object, null, 2) ]]</pre>
                                    <!-- full event — truncated above 80 KB for display performance -->
                                    <template v-else>
                                        <pre style="margin:0; font-size:.78rem; max-height:320px; overflow-y:auto; white-space:pre-wrap;">[[ fullEventDisplay ]]</pre>
                                        <div v-if="fullEventTruncated"
                                            style="padding:.4rem .6rem; font-size:.75rem; color:#f9a825; border-top:1px solid rgba(255,255,255,.1); margin-top:.25rem;">
                                            <i class="fas fa-exclamation-triangle me-1"></i>
                                            Display truncated at 80 KB — use Copy to get the full JSON.
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <!-- No evaluations notice -->
                        <div v-if="previewOpen && !preview && !previewLoading"
                            class="misp-preview-body" style="color:var(--text-3); font-size:.84rem;">
                            <i class="fas fa-info-circle me-1"></i>
                            No community evaluations for this conversion yet. The event will be pushed
                            without a <code>cti-evaluation</code> object.
                        </div>
                    </div>

                    <!-- Tags -->
                    <div class="mb-3">
                        <label class="form-label">Add Tags <span style="color:var(--text-3); font-weight:400; font-size:0.78rem;">(optional)</span></label>
                        <div class="position-relative">
                            <input v-model="tagSearch" @input="searchTags()" @blur="hideSuggestionsDelayed()"
                                type="text" class="form-control form-control-sm"
                                placeholder="Search MISP tags or enter a custom tag…">
                            <div v-if="tagSuggestions.length && tagSearch" class="misp-tag-dropdown">
                                <div v-for="t in tagSuggestions" :key="t.name"
                                    class="misp-tag-suggestion"
                                    @mousedown.prevent="addTag(t.name, t.colour)">
                                    <span class="misp-tag-dot"
                                        :style="{background: t.colour || '#888888'}"></span>
                                    <span>[[ t.name ]]</span>
                                    <span v-if="t._custom" style="color:var(--text-3); font-size:0.73rem; margin-left:auto;">add custom</span>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex flex-wrap gap-1 mt-2" v-if="selectedTags.length">
                            <span v-for="t in selectedTags" :key="t.name"
                                class="badge d-inline-flex align-items-center gap-1"
                                :style="{background: t.colour, color: isLightColor(t.colour) ? '#000' : '#fff', fontSize:'0.78rem', padding:'3px 8px'}">
                                [[ t.name ]]
                                <button @click="removeTag(t.name)"
                                    style="background:none;border:none;color:inherit;cursor:pointer;padding:0;line-height:1;margin-left:2px;">×</button>
                            </span>
                        </div>
                    </div>

                    <div v-if="pushError" class="alert alert-danger py-2 px-3"
                        style="font-size:0.84rem;">[[ pushError ]]</div>
                    <div v-if="pushSuccess" class="alert alert-success py-2 px-3"
                        style="font-size:0.84rem;">[[ pushSuccess ]]</div>
                </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer" style="border-top:1px solid var(--border);">
                <template v-if="step === 'connect'">
                    <button class="btn btn-sm btn-secondary" data-bs-dismiss="modal" @click="onClose()">Cancel</button>
                    <button class="btn btn-sm btn-primary"
                        @click="testConnection()"
                        :disabled="connecting || !mispUrl.trim() || !apiKey.trim()">
                        <span v-if="connecting">
                            <i class="fas fa-spinner fa-spin me-1"></i> Connecting…
                        </span>
                        <span v-else>Connect</span>
                    </button>
                </template>
                <template v-else>
                    <button class="btn btn-sm btn-secondary" data-bs-dismiss="modal" @click="onClose()">Close</button>
                    <button class="btn btn-sm btn-primary"
                        @click="pushToMISP()"
                        :disabled="pushing || !mispEventInfo">
                        <span v-if="pushing">
                            <i class="fas fa-spinner fa-spin me-1"></i> Pushing…
                        </span>
                        <span v-else>
                            <img src="/static/image/misp.svg" width="14" height="14"
                                class="me-1" style="vertical-align:middle;"> Push Event
                        </span>
                    </button>
                </template>
            </div>
        </div>
    </div>
</div>
    `,
    setup(props) {
        const { ref, watch, onMounted } = Vue

        const step         = ref('connect')
        const mispUrl      = ref('')
        const apiKey       = ref('')
        const connecting   = ref(false)
        const connectError = ref('')

        const mispEventInfo  = ref(null)
        const allMispTags    = ref([])
        const tagSearch      = ref('')
        const tagSuggestions = ref([])
        const selectedTags   = ref([])

        const pushing     = ref(false)
        const pushError   = ref('')
        const pushSuccess = ref('')

        // Preview state
        const { computed } = Vue
        const preview             = ref(null)   // full response from /conversions/misp_push_preview/<id>
        const previewLoading      = ref(false)
        const previewOpen         = ref(true)   // expanded by default when entering step 2
        const jsonOpen            = ref(false)
        const jsonTab             = ref('object')  // 'object' | 'event'
        const copied              = ref(false)
        const DISPLAY_LIMIT       = 80 * 1024  // 80 KB display cap for the full event JSON

        // Computed: full event JSON string, truncated for display if very large
        const fullEventJson = computed(() => preview.value?.event_dict
            ? JSON.stringify(preview.value.event_dict, null, 2)
            : ''
        )
        const fullEventTruncated = computed(() => fullEventJson.value.length > DISPLAY_LIMIT)
        const fullEventDisplay   = computed(() =>
            fullEventTruncated.value
                ? fullEventJson.value.slice(0, DISPLAY_LIMIT) + '\n\n// … truncated, use Copy for full JSON'
                : fullEventJson.value
        )

        onMounted(() => {
            mispUrl.value = ''
            apiKey.value  = ''
        })

        function open() {
            mispUrl.value      = ''
            apiKey.value       = ''
            connectError.value = ''
            pushError.value    = ''
            pushSuccess.value  = ''
            selectedTags.value = []
            tagSearch.value    = ''
            allMispTags.value  = []
            preview.value      = null
            previewOpen.value  = true
            jsonOpen.value     = false
            jsonTab.value      = 'object'
            step.value         = 'connect'
            parseMispEvent()
            const el = document.getElementById('misp-push-modal-' + props.conversionId)
            if (el) new bootstrap.Modal(el).show()
        }

        function onClose() {
            mispUrl.value     = ''
            apiKey.value      = ''
            step.value        = 'connect'
            pushSuccess.value = ''
            pushError.value   = ''
        }

        function parseMispEvent() {
            mispEventInfo.value = null
            if (!props.convertData) return
            const candidates = [props.convertData.input_text, props.convertData.output_text].filter(Boolean)
            const MISP_EVENT_KEYS = new Set(['info', 'uuid', 'Attribute', 'Object', 'Tag', 'Galaxy'])
            for (const text of candidates) {
                try {
                    const parsed = JSON.parse(text)
                    let ev = parsed?.Event ?? parsed?.response?.[0]?.Event
                    if (!ev && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                        if (Object.keys(parsed).some(k => MISP_EVENT_KEYS.has(k))) ev = parsed
                    }
                    if (ev && (ev.id || ev.uuid || ev.info)) {
                        mispEventInfo.value = { id: ev.id ?? ev.uuid, info: ev.info || '' }
                        return
                    }
                } catch {}
            }
        }

        // Fetch the preview data when entering the push step
        async function loadPreview() {
            previewLoading.value = true
            preview.value        = null
            try {
                const res  = await fetch(`/conversions/misp_push_preview/${props.conversionId}`, {
                    headers: { 'X-CSRFToken': document.getElementById('csrf_token')?.value || '' },
                })
                const body = await res.json()
                if (res.ok && body.success && body.has_evaluations) {
                    preview.value = body
                }
            } catch {}
            finally { previewLoading.value = false }
        }

        // Extract the level string from a cti-evaluation tag name
        // e.g. 'cti-evaluation:accuracy="high"'  →  'high'
        function levelFromTag(tagName) {
            const m = tagName.match(/"([\w-]+)"$/)
            return m ? m[1] : ''
        }

        async function copyJson() {
            // Copy whichever tab is active — cti-evaluation object or full event
            const text = jsonTab.value === 'object'
                ? JSON.stringify(preview.value?.cti_object, null, 2)
                : fullEventJson.value
            if (!text) return
            await navigator.clipboard.writeText(text)
            copied.value = true
            setTimeout(() => { copied.value = false }, 1800)
        }

        watch(() => props.convertData, parseMispEvent, { deep: true })

        async function testConnection() {
            if (!mispUrl.value.trim() || !apiKey.value.trim()) return
            connecting.value   = true
            connectError.value = ''
            try {
                const res  = await fetch('/conversions/misp_test_connection', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': document.getElementById('csrf_token')?.value || '',
                    },
                    body: JSON.stringify({ misp_url: mispUrl.value, api_key: apiKey.value }),
                })
                const body = await res.json()
                if (res.ok && body.success) {
                    allMispTags.value = body.tags || []
                    step.value = 'push'
                    loadPreview()  // fetch the CTI evaluation preview as soon as step 2 is reached
                } else {
                    connectError.value = body.error || 'Connection failed'
                }
            } catch (e) {
                connectError.value = 'Network error: ' + e.message
            } finally {
                connecting.value = false
            }
        }

        function searchTags() {
            const q = tagSearch.value.trim().toLowerCase()
            if (!q) { tagSuggestions.value = []; return }
            const already = new Set(selectedTags.value.map(t => t.name))
            const matches = allMispTags.value
                .filter(t => t.name.toLowerCase().includes(q) && !already.has(t.name))
                .slice(0, 8)
            const exact = allMispTags.value.find(t => t.name.toLowerCase() === q)
            if (!exact && tagSearch.value.trim()) {
                matches.push({ name: tagSearch.value.trim(), colour: '#888888', _custom: true })
            }
            tagSuggestions.value = matches
        }

        function hideSuggestionsDelayed() {
            setTimeout(() => { tagSuggestions.value = [] }, 200)
        }

        function addTag(name, colour) {
            if (!selectedTags.value.find(t => t.name === name)) {
                selectedTags.value.push({ name, colour: colour || '#888888' })
            }
            tagSearch.value      = ''
            tagSuggestions.value = []
        }

        function removeTag(name) {
            selectedTags.value = selectedTags.value.filter(t => t.name !== name)
        }

        function isLightColor(hex) {
            if (!hex || hex === '#ffffff' || hex === '#fff') return true
            try {
                const c = hex.replace('#', '')
                const r = parseInt(c.substring(0, 2), 16)
                const g = parseInt(c.substring(2, 4), 16)
                const b = parseInt(c.substring(4, 6), 16)
                return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            } catch { return false }
        }

        async function pushToMISP() {
            if (!mispEventInfo.value) return
            pushing.value     = true
            pushError.value   = ''
            pushSuccess.value = ''
            try {
                const res  = await fetch('/conversions/push_to_misp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': document.getElementById('csrf_token')?.value || '',
                    },
                    body: JSON.stringify({
                        conversion_id: props.conversionId,
                        misp_url:   mispUrl.value,
                        api_key:    apiKey.value,
                        tags:       selectedTags.value.map(t => t.name),
                    }),
                })
                const body = await res.json()
                if (res.ok && body.success) {
                    pushSuccess.value = body.message || 'Event pushed to MISP successfully!'
                } else {
                    pushError.value = body.error || 'Push failed'
                }
            } catch (e) {
                pushError.value = 'Network error: ' + e.message
            } finally {
                pushing.value = false
            }
        }

        return {
            step, mispUrl, apiKey, connecting, connectError,
            mispEventInfo, tagSearch, tagSuggestions, selectedTags, allMispTags,
            pushing, pushError, pushSuccess,
            preview, previewLoading, previewOpen, jsonOpen, jsonTab, copied,
            fullEventDisplay, fullEventTruncated,
            open, onClose, testConnection, searchTags, hideSuggestionsDelayed,
            addTag, removeTag, isLightColor, pushToMISP, levelFromTag, copyJson,
        }
    },
}

export default PushConvertToMISP
