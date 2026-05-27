// EvaluationPanel — Vue 3 component for convert evaluations.
// Register with: app.component('evaluation-panel', EvaluationPanel)

const CSRF_TOKEN = () =>
    document.getElementById('csrf_token')?.value || ''

const VALUE_COLORS = {
    'very-low':  '#dc3545',
    'low':       '#fd7e14',
    'moderate':  '#ffc107',
    'high':      '#198754',
    'very-high': '#0d9488',
}

const VALUE_LABELS = {
    'very-low':  'Very Low',
    'low':       'Low',
    'moderate':  'Moderate',
    'high':      'High',
    'very-high': 'Very High',
}

const CATEGORY_ORDER = [
    'overall-score', 'accuracy', 'relevance', 'timeliness', 'clarity',
    'specificity', 'usefulness', 'format-validity', 'conversion-fidelity',
    'source-reliability', 'evidence-strength', 'confidence',
]

const EvaluationPanel = {
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
                    :title="!isAuth ? 'Log in to vote' : ''"
                    @click="toggleLike">
                    <i class="fas fa-thumbs-up"></i>
                    <span class="eval-vote-card-num">[[ data.likes ]]</span>
                    <span class="eval-vote-card-label">Helpful</span>
                </button>
                <!-- Not helpful -->
                <button class="eval-vote-card dislike"
                    :class="{ active: data.viewer_dislike, disabled: !data.can_evaluate }"
                    :title="!isAuth ? 'Log in to vote' : ''"
                    @click="toggleDislike">
                    <i class="fas fa-thumbs-down"></i>
                    <span class="eval-vote-card-num">[[ data.dislikes ]]</span>
                    <span class="eval-vote-card-label">Not helpful</span>
                </button>
                <!-- Score display -->
                <div v-if="score !== null" class="eval-score-summary">
                    <div class="eval-score-big" :style="{ color: scoreColor(score) }">[[ score ]]%</div>
                    <div class="eval-score-big-label">overall score</div>
                    <div class="eval-score-bar mt-1">
                        <div class="eval-score-fill" :style="{ width: score + '%', background: scoreColor(score) }"></div>
                    </div>
                </div>
            </div>

            <!-- Auth hint -->
            <div v-if="!isAuth" class="eval-hint mt-2">
                <a href="/account/login">Log in</a> to vote
            </div>
        </div>

        <!-- ── Section: Category Evaluations ─────────────────── -->
        <div class="eval-panel-divider"></div>
        <div class="eval-panel-section">
            <div class="eval-panel-section-title">
                <i class="fas fa-chart-bar me-1" style="color:var(--accent);"></i>
                Category Evaluations
                <span class="eval-panel-section-sub">— rate each dimension of this conversion</span>
            </div>

            <div v-if="!isAuth" class="eval-hint mb-2">
                <a href="/account/login">Log in</a> to rate categories
            </div>

            <div class="eval-categories-list">
                <div v-for="(cat, catName) in sortedCtiCategories" :key="catName" class="eval-category-block">

                    <!-- Category header -->
                    <div class="eval-cat-header">
                        <span class="eval-cat-name">[[ formatCatName(catName) ]]</span>
                        <span v-if="cat.viewer_value" class="eval-cat-my-pick">
                            <i class="fas fa-check-circle me-1"></i>
                            [[ formatValue(cat.viewer_value) ]]
                        </span>
                        <span v-if="cat.total > 0" class="eval-cat-votes-badge">
                            [[ cat.total ]] vote[[ cat.total !== 1 ? 's' : '' ]]
                        </span>
                    </div>

                    <!-- Value picker buttons -->
                    <div class="eval-cat-picker">
                        <button v-for="val in cat.values" :key="val"
                            type="button"
                            class="eval-val-btn"
                            :style="valueBtnStyle(val, cat.viewer_value === val)"
                            :disabled="!data.can_evaluate"
                            :title="!isAuth ? 'Log in to evaluate' : ''"
                            @click="selectCatValue(catName, val)">
                            [[ formatValue(val) ]]
                        </button>
                    </div>

                    <!-- Distribution bar chart -->
                    <div v-if="cat.total > 0" class="eval-cat-chart">
                        <div v-for="val in cat.values" :key="val" class="eval-bar-row">
                            <span class="eval-bar-label">[[ formatValue(val) ]]</span>
                            <div class="eval-bar-track">
                                <div class="eval-bar-fill"
                                     :style="{ width: (cat.percentages[val] || 0) + '%', background: valueColor(val) }">
                                </div>
                            </div>
                            <span class="eval-bar-stat">
                                [[ cat.counts[val] || 0 ]]
                                <span class="eval-bar-pct">([[ cat.percentages[val] || 0 ]]%)</span>
                            </span>
                        </div>
                    </div>
                    <div v-else class="eval-no-votes">No votes yet</div>

                </div>
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
        const { ref, computed, onMounted } = Vue

        const loading = ref(true)
        const data    = ref({
            likes: 0, dislikes: 0,
            viewer_like: false, viewer_dislike: false,
            can_evaluate: false,
            is_owner: false, eval_comments: 0,
            cti_categories: {},
        })

        const score = computed(() => data.value.approval_score ?? null)

        function scoreColor(s) {
            if (s === null) return '#6c757d'
            if (s < 25)  return '#dc3545'
            if (s < 50)  return '#fd7e14'
            if (s < 75)  return '#ffc107'
            return '#198754'
        }

        const sortedCtiCategories = computed(() => {
            const cats = data.value.cti_categories || {}
            const sorted = {}
            CATEGORY_ORDER.forEach(k => { if (k in cats) sorted[k] = cats[k] })
            Object.keys(cats).sort().forEach(k => { if (!(k in sorted)) sorted[k] = cats[k] })
            return sorted
        })

        function formatCatName(name) {
            return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        }

        function formatValue(val) {
            return VALUE_LABELS[val] || val
        }

        function valueColor(val) {
            return VALUE_COLORS[val] || '#6c757d'
        }

        function valueBtnStyle(val, isActive) {
            const color = VALUE_COLORS[val] || '#6c757d'
            if (isActive) {
                return { background: color, borderColor: color, color: '#fff' }
            }
            return { borderColor: color, color: color, background: 'transparent' }
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
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRF_TOKEN() },
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
                convert_id: props.convertId, reaction_key: key,
            })
            if (body.success && body.summary) data.value = { ...data.value, ...body.summary }
        }

        async function selectCatValue(catName, val) {
            if (!data.value.can_evaluate) return
            await toggleReaction(`cti-evaluation:${catName}="${val}"`)
        }

        onMounted(fetchSummary)

        return {
            loading, data, score, scoreColor,
            sortedCtiCategories,
            formatCatName, formatValue, valueColor, valueBtnStyle,
            selectCatValue, toggleLike, toggleDislike,
        }
    },
}

export default EvaluationPanel
