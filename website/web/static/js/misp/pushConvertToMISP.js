// Modal component for pushing a convert's MISP event to an external MISP instance.
// Register with: app.component('push-convert-to-misp', PushConvertToMISP)
// Usage: <push-convert-to-misp ref="mispModal" :convert-id="convert.id" :convert-data="convert">
//        Then trigger: $refs.mispModal.open()

const PushConvertToMISP = {
    delimiters: ['[[', ']]'],
    props: {
        convertId:   { type: Number, required: true },
        convertData: { type: Object, default: null },
    },
    template: `
<div :id="'misp-push-modal-' + convertId" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
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
                            No MISP event found in this convert's data.
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

        onMounted(() => {
            // Credentials are never persisted — user must reconnect each time
            mispUrl.value = ''
            apiKey.value  = ''
        })

        function open() {
            // Always reset everything — no credentials are persisted
            mispUrl.value      = ''
            apiKey.value       = ''
            connectError.value = ''
            pushError.value    = ''
            pushSuccess.value  = ''
            selectedTags.value = []
            tagSearch.value    = ''
            allMispTags.value  = []
            step.value         = 'connect'
            parseMispEvent()
            const el = document.getElementById('misp-push-modal-' + props.convertId)
            if (el) new bootstrap.Modal(el).show()
        }

        function onClose() {
            // Wipe credentials on close
            mispUrl.value   = ''
            apiKey.value    = ''
            step.value      = 'connect'
            pushSuccess.value = ''
            pushError.value   = ''
        }

        function parseMispEvent() {
            mispEventInfo.value = null
            if (!props.convertData) return
            const candidates = [props.convertData.input_text, props.convertData.output_text].filter(Boolean)
            for (const text of candidates) {
                try {
                    const parsed = JSON.parse(text)
                    const ev = parsed?.Event ?? parsed?.response?.[0]?.Event
                    if (ev?.id) {
                        mispEventInfo.value = { id: ev.id, info: ev.info || '' }
                        return
                    }
                } catch {}
            }
        }

        watch(() => props.convertData, parseMispEvent, { deep: true })

        async function testConnection() {
            if (!mispUrl.value.trim() || !apiKey.value.trim()) return
            connecting.value   = true
            connectError.value = ''
            try {
                const res  = await fetch('/convert/misp_test_connection', {
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
            // Add free-entry option when no exact match
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
                const res  = await fetch('/convert/push_to_misp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': document.getElementById('csrf_token')?.value || '',
                    },
                    body: JSON.stringify({
                        convert_id: props.convertId,
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
            open, onClose, testConnection, searchTags, hideSuggestionsDelayed,
            addTag, removeTag, isLightColor, pushToMISP,
        }
    },
}

export default PushConvertToMISP
