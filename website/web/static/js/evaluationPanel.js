import SingleTagDisplay from '/static/js/tags/singleTagDisplay.js'

// EvaluationPanel — Vue 3 component for convert evaluations.
// Register with: app.component('evaluation-panel', EvaluationPanel)

const CSRF_TOKEN = () =>
    document.getElementById('csrf_token')?.value || ''

const EvaluationPanel = {
    components: { 'single-tag': SingleTagDisplay },
    delimiters: ['[[', ']]'],
    props: {
        convertId: { type: Number, required: true },
        isAuth:    { type: Boolean, default: false },
        isOwner:   { type: Boolean, default: false },
        isPublic:  { type: Boolean, default: true },
    },
    template: `
<div class="eval-panel-root">

    <!-- Loading -->
    <div v-if="loading" class="eval-loading">
        <div class="spinner-border spinner-border-sm" style="color:var(--accent);"></div>
    </div>

    <template v-else>

        <!-- ── Section: Vote ─────────────────────────────────── -->
        <div class="eval-panel-section">
            <div class="eval-panel-section-title">
                <i class="fas fa-check-circle me-1" style="color:var(--accent);"></i>
                Is this conversion accurate?
            </div>

            <div class="eval-vote-cards-row">
                <!-- Helpful -->
                <button class="eval-vote-card"
                    :class="{ active: data.viewer_like, disabled: !data.can_evaluate }"
                    :title="!isAuth ? 'Log in to vote' : isOwner ? 'Cannot evaluate your own convert' : ''"
                    @click="toggleLike">
                    <i class="fas fa-thumbs-up"></i>
                    <span class="eval-vote-card-num">[[ data.likes ]]</span>
                    <span class="eval-vote-card-label">Helpful</span>
                </button>
                <!-- Not helpful -->
                <button class="eval-vote-card dislike"
                    :class="{ active: data.viewer_dislike, disabled: !data.can_evaluate }"
                    :title="!isAuth ? 'Log in to vote' : isOwner ? 'Cannot evaluate your own convert' : ''"
                    @click="toggleDislike">
                    <i class="fas fa-thumbs-down"></i>
                    <span class="eval-vote-card-num">[[ data.dislikes ]]</span>
                    <span class="eval-vote-card-label">Not helpful</span>
                </button>
                <!-- Score display -->
                <div v-if="data.likes + data.dislikes > 0" class="eval-score-summary">
                    <div class="eval-score-big">[[ score ]]%</div>
                    <div class="eval-score-big-label">approval</div>
                    <div class="eval-score-bar mt-1">
                        <div class="eval-score-fill" :style="{ width: score + '%' }"></div>
                    </div>
                </div>
            </div>

            <!-- Auth / owner hint -->
            <div v-if="!isAuth" class="eval-hint mt-2">
                <a href="/account/login">Log in</a> to vote
            </div>
            <div v-else-if="isOwner" class="eval-hint mt-2">
                <i class="fas fa-lock me-1" style="font-size:0.7rem;"></i>
                You cannot evaluate your own conversion
            </div>
        </div>

        <!-- ── Section: Tag Reactions ─────────────────────────── -->
        <div class="eval-panel-divider"></div>
        <div class="eval-panel-section">
            <div class="eval-panel-section-title">
                <i class="fas fa-tags me-1" style="color:var(--accent);"></i>
                Tag Reactions
                <span class="eval-panel-section-sub">— tag what you think of this conversion</span>
            </div>

            <!-- Aggregate chips from all users -->
            <div class="d-flex flex-wrap gap-1 mb-2" v-if="Object.keys(aggregateReactions).length">
                <div v-for="(info, key) in aggregateReactions" :key="key"
                     class="d-inline-flex align-items-center" style="gap:2px;">
                    <single-tag :tag="info.tagObj" :show-namespace="true"></single-tag>
                    <span v-if="info.count > 1"
                          class="badge rounded-pill"
                          style="font-size:0.68rem; padding:2px 5px; background:var(--border); color:var(--text-2); font-variant-numeric:tabular-nums;">
                        ×[[ info.count ]]
                    </span>
                    <button v-if="info.mine && data.can_evaluate"
                        type="button"
                        class="tag-remove-btn"
                        title="Remove my reaction"
                        @click="toggleReaction(key)">
                        <i class="fas fa-xmark"></i>
                    </button>
                </div>
            </div>
            <div v-else-if="!data.can_evaluate && isAuth" class="eval-hint">
                No tag reactions yet.
            </div>

            <!-- Picker (only for users who can evaluate) -->
            <template v-if="data.can_evaluate">
                <div v-if="userReactionCount >= 3" class="eval-taxo-limit">
                    <i class="fas fa-lock" style="font-size:0.65rem;"></i> 3 tags max
                </div>
                <template v-else>
                    <!-- Source filter pills -->
                    <div class="d-flex gap-1 mb-1">
                        <button v-for="f in sourceFilters" :key="f.key" type="button"
                            class="tag-source-btn"
                            :class="{ active: selectedSource === f.key }"
                            @click="setSource(f.key)">
                            [[ f.label ]]
                        </button>
                    </div>
                    <!-- Search input + dropdown -->
                    <div class="position-relative tag-input-search-wrap" ref="taxoPickerRef">
                        <div class="input-group input-group-sm" style="max-width:320px;">
                            <span class="input-group-text"
                                  style="background:var(--surface); border-color:var(--border); color:var(--text-3);">
                                <i v-if="taxoSearching" class="fas fa-spinner fa-spin" style="font-size:0.65rem;"></i>
                                <i v-else class="fas fa-magnifying-glass" style="font-size:0.65rem;"></i>
                            </span>
                            <input type="text" class="form-control form-control-sm"
                                v-model="taxoSearch"
                                @focus="taxoDropdownOpen = true; fetchTaxoSuggestions()"
                                @keydown.escape="taxoDropdownOpen = false; taxoSearch = ''"
                                placeholder="Search evaluation tags…"
                                autocomplete="off"
                                style="background:var(--surface); color:var(--text); border-color:var(--border); font-size:0.82rem;">
                        </div>
                        <!-- Dropdown -->
                        <div v-if="taxoDropdownOpen"
                             class="tag-input-dropdown"
                             style="position:absolute; top:calc(100% + 3px); left:0; min-width:300px; z-index:900;
                                    background:var(--surface); border:1px solid var(--border);
                                    border-radius:var(--radius-sm); max-height:260px; overflow-y:auto;
                                    box-shadow:var(--shadow-lg);">
                            <template v-if="filteredTaxoResults.length > 0">
                                <div v-for="tag in filteredTaxoResults" :key="tag.id"
                                    @click="addTaxoTag(tag)"
                                    class="tag-input-dropdown-item px-3 py-2 d-flex align-items-center gap-2"
                                    style="cursor:pointer; border-bottom:1px solid var(--border); font-size:0.82rem;">
                                    <single-tag :tag="tag" :show-namespace="true" :highlight="taxoSearch"></single-tag>
                                </div>
                            </template>
                            <div v-else-if="taxoSearching"
                                 style="padding:0.65rem 0.85rem; color:var(--text-3); font-size:0.8rem;">
                                <i class="fas fa-spinner fa-spin me-1"></i> Searching…
                            </div>
                            <div v-else-if="taxoSearch"
                                 style="padding:0.65rem 0.85rem; color:var(--text-3); font-size:0.8rem; font-style:italic;">
                                No tags matching "[[ taxoSearch ]]"
                            </div>
                            <div v-else
                                 style="padding:0.65rem 0.85rem; color:var(--text-3); font-size:0.8rem; font-style:italic;">
                                Type to search evaluation tags…
                            </div>
                        </div>
                    </div>
                </template>
            </template>
            <div v-else-if="!isAuth" class="eval-hint mt-1">
                <a href="/account/login">Log in</a> to add tag reactions
            </div>
        </div>

        <!-- ── Evaluation comments link ──────────────────────── -->
        <div v-if="data.eval_comments > 0" class="eval-comments-link" style="margin-top:4px; padding:0 2px;">
            <i class="fas fa-comment-dots me-1" style="color:var(--accent); font-size:0.75rem;"></i>
            <span>[[ data.eval_comments ]] evaluation comment[[ data.eval_comments > 1 ? 's' : '' ]]</span>
        </div>

    </template>
</div>
    `,
    setup(props) {
        const { ref, computed, watch, onMounted, onUnmounted } = Vue

        const loading = ref(true)
        const data    = ref({
            likes: 0, dislikes: 0,
            reactions: {}, reaction_defs: [],
            viewer_like: false, viewer_dislike: false,
            viewer_reactions: [], can_evaluate: false,
            is_owner: false, eval_comments: 0,
        })

        // Taxo picker state
        const taxoSearch       = ref('')
        const taxoResults      = ref([])
        const taxoSearching    = ref(false)
        const taxoDropdownOpen = ref(false)
        const selectedSource   = ref('all')
        const taxoPickerRef    = ref(null)
        let   taxoDebounceTimer = null

        const sourceFilters = [
            { key: 'all',           label: 'All'      },
            { key: 'taxonomy',      label: 'Taxonomy' },
            { key: 'custom',        label: 'Custom'   },
            { key: 'vulnerability', label: 'Vuln'     },
        ]

        const score = computed(() => {
            const total = data.value.likes + data.value.dislikes
            return total ? Math.round((data.value.likes / total) * 100) : 0
        })

        // { tagKey: { count, mine, tagObj } } — only tags with count > 0 or mine
        const aggregateReactions = computed(() => {
            const result = {}
            for (const r of data.value.reaction_defs || []) {
                const count = (data.value.reactions || {})[r.key] || 0
                const mine  = (data.value.viewer_reactions || []).includes(r.key)
                if (count > 0 || mine) {
                    result[r.key] = { count, mine, tagObj: r }
                }
            }
            return result
        })

        const userReactionCount = computed(() => (data.value.viewer_reactions || []).length)

        const filteredTaxoResults = computed(() => {
            const already = new Set(data.value.viewer_reactions || [])
            return (taxoResults.value || []).filter(t => !already.has(t.name))
        })

        async function fetchTaxoSuggestions() {
            taxoSearching.value = true
            try {
                const params = new URLSearchParams({ is_evaluation: 'true' })
                if (taxoSearch.value.trim()) params.set('search', taxoSearch.value.trim())
                if (selectedSource.value !== 'all') params.set('source', selectedSource.value)
                const res = await fetch('/tags/available?' + params)
                if (res.ok) {
                    const body = await res.json()
                    if (body.success) taxoResults.value = body.list
                }
            } catch (e) {
                console.error('EvaluationPanel: taxo search error', e)
            } finally {
                taxoSearching.value = false
            }
        }

        watch(taxoSearch, () => {
            clearTimeout(taxoDebounceTimer)
            taxoDebounceTimer = setTimeout(fetchTaxoSuggestions, 220)
        })

        watch(selectedSource, fetchTaxoSuggestions)

        function setSource(src) {
            selectedSource.value   = src
            taxoDropdownOpen.value = true
        }

        async function addTaxoTag(tag) {
            taxoDropdownOpen.value = false
            taxoSearch.value       = ''
            await toggleReaction(tag.name)
        }

        function onOutsideClick(e) {
            if (taxoPickerRef.value && !taxoPickerRef.value.contains(e.target)) {
                taxoDropdownOpen.value = false
            }
        }

        async function fetchSummary() {
            try {
                const res  = await fetch(`/evaluate/summary/${props.convertId}`)
                const body = await res.json()
                if (body.success) data.value = body
            } catch (e) {
                console.error('EvaluationPanel fetch error', e)
            } finally {
                loading.value = false
            }
        }

        async function apiPost(url, payload) {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': CSRF_TOKEN(),
                },
                body: JSON.stringify(payload),
            })
            return res.json()
        }

        async function toggleLike() {
            if (!data.value.can_evaluate) return
            const body = await apiPost('/evaluate/toggle_like', { convert_id: props.convertId })
            if (body.success && body.summary) data.value = { ...data.value, ...body.summary }
        }

        async function toggleDislike() {
            if (!data.value.can_evaluate) return
            const body = await apiPost('/evaluate/toggle_dislike', { convert_id: props.convertId })
            if (body.success && body.summary) data.value = { ...data.value, ...body.summary }
        }

        async function toggleReaction(key) {
            if (!data.value.can_evaluate) return
            const body = await apiPost('/evaluate/toggle_reaction', {
                convert_id: props.convertId, reaction_key: key
            })
            if (body.success && body.summary) data.value = { ...data.value, ...body.summary }
        }

        onMounted(() => {
            fetchSummary()
            document.addEventListener('click', onOutsideClick)
        })
        onUnmounted(() => {
            document.removeEventListener('click', onOutsideClick)
            clearTimeout(taxoDebounceTimer)
        })

        return {
            loading, data, score,
            taxoSearch, taxoResults, taxoSearching, taxoDropdownOpen,
            selectedSource, sourceFilters, taxoPickerRef,
            aggregateReactions, userReactionCount, filteredTaxoResults,
            setSource, addTaxoTag, fetchTaxoSuggestions,
            toggleLike, toggleDislike, toggleReaction,
        }
    },
}

export default EvaluationPanel
