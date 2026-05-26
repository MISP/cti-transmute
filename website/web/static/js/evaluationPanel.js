// EvaluationPanel — reusable Vue 3 component for convert evaluations.
// Usage (standalone, via macro):  mountEvaluationPanels()
// Usage (as Vue component):       app.component('evaluation-panel', EvaluationPanel)

const CSRF_TOKEN = () =>
    document.getElementById('csrf_token')?.value || ''

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
        <!-- Vote row -->
        <div class="eval-vote-row">
            <!-- Like -->
            <button class="eval-vote-btn"
                :class="{ active: data.viewer_like, disabled: !data.can_evaluate }"
                :title="!isAuth ? 'Log in to evaluate' : isOwner ? 'Cannot evaluate your own convert' : ''"
                @click="toggleLike">
                <i class="fas fa-thumbs-up"></i>
                <span class="eval-vote-count">[[ data.likes ]]</span>
            </button>

            <!-- Dislike -->
            <button class="eval-vote-btn dislike"
                :class="{ active: data.viewer_dislike, disabled: !data.can_evaluate }"
                @click="toggleDislike">
                <i class="fas fa-thumbs-down"></i>
                <span class="eval-vote-count">[[ data.dislikes ]]</span>
            </button>

            <!-- Score bar -->
            <div v-if="data.likes + data.dislikes > 0" class="eval-score-bar-wrap">
                <div class="eval-score-bar">
                    <div class="eval-score-fill" :style="{ width: score + '%' }"></div>
                </div>
                <span class="eval-score-label">[[ score ]]%</span>
            </div>

            <!-- Auth hint -->
            <span v-if="!isAuth" class="eval-hint">
                <a href="/account/login">Log in</a> to evaluate
            </span>
            <span v-else-if="isOwner" class="eval-hint">
                You cannot evaluate your own convert
            </span>
        </div>

        <!-- Reactions -->
        <div class="eval-reactions">
            <button v-for="r in data.reaction_defs" :key="r.key"
                class="eval-reaction-btn"
                :class="{ active: data.viewer_reactions.includes(r.key), disabled: !data.can_evaluate }"
                :style="activeReactionStyle(r)"
                @click="toggleReaction(r.key)">
                <i :class="'fas ' + r.fa" :style="{ color: data.viewer_reactions.includes(r.key) ? '#fff' : r.color }"></i>
                <span class="eval-reaction-label">[[ r.label ]]</span>
                <span v-if="data.reactions[r.key] > 0" class="eval-reaction-count">[[ data.reactions[r.key] ]]</span>
            </button>
        </div>

        <!-- Evaluation comments link -->
        <div v-if="data.eval_comments > 0" class="eval-comments-link">
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
            reactions: {}, reaction_defs: [],
            viewer_like: false, viewer_dislike: false,
            viewer_reactions: [], can_evaluate: false,
            is_owner: false, eval_comments: 0,
        })

        const score = computed(() => {
            const total = data.value.likes + data.value.dislikes
            if (!total) return 0
            return Math.round((data.value.likes / total) * 100)
        })

        async function fetchSummary() {
            try {
                const res  = await fetch(`/evaluate/summary/${props.convertId}`)
                const body = await res.json()
                if (body.success) {
                    data.value = body
                }
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

        function activeReactionStyle(r) {
            if (data.value.viewer_reactions.includes(r.key)) {
                return { background: r.color, borderColor: r.color }
            }
            return {}
        }

        onMounted(fetchSummary)

        return { loading, data, score, toggleLike, toggleDislike, toggleReaction, activeReactionStyle }
    }
}

export default EvaluationPanel

/**
 * Mount standalone evaluation panels on all `.eval-panel` divs.
 * Call once per page after DOM is ready.
 */
export function mountEvaluationPanels() {
    document.querySelectorAll('.eval-panel:not([data-vue-mounted])').forEach(el => {
        el.setAttribute('data-vue-mounted', '')
        Vue.createApp(EvaluationPanel, {
            convertId: parseInt(el.dataset.convertId),
            isAuth:    el.dataset.auth    === 'true',
            isOwner:   el.dataset.owner   === 'true',
            isPublic:  el.dataset.public  === 'true',
        }).mount(el)
    })
}
