// EvaluationCharts — approval donut + tag-reaction bar chart for a convert.
// Register with: app.component('evaluation-charts', EvaluationCharts)

const EvaluationCharts = {
    delimiters: ['[[', ']]'],
    props: {
        conversionId: { type: Number, required: true },
    },
    template: `
<div>
    <div v-if="loading" class="eval-charts-loading">
        <i class="fas fa-spinner fa-spin me-1"></i>
    </div>
    <template v-else-if="hasData">
        <div class="eval-charts-header">
            <i class="fas fa-chart-pie me-1"></i> Analytics
        </div>
        <div class="eval-chart-grid">

            <!-- Approval donut -->
            <div v-if="hasVotes" class="eval-chart-card">
                <div class="eval-chart-title">Approval</div>
                <div class="eval-donut-wrap">
                    <canvas ref="donutRef"></canvas>
                    <div class="eval-donut-center">
                        <div class="eval-donut-pct">[[ score ]]%</div>
                        <div class="eval-donut-sub">approval</div>
                    </div>
                </div>
                <div class="eval-chart-legend-row">
                    <span class="eval-legend-dot" style="background:#2563eb;"></span>
                    <span>[[ data.likes ]] helpful</span>
                    <span class="eval-legend-dot" style="background:#dc2626;"></span>
                    <span>[[ data.dislikes ]] not helpful</span>
                </div>
            </div>

            <!-- Tag reactions bar -->
            <div v-if="hasTagReactions" class="eval-chart-card">
                <div class="eval-chart-title">Tag reactions</div>
                <div class="eval-bar-wrap" :style="{ height: barHeight + 'px' }">
                    <canvas ref="barRef"></canvas>
                </div>
            </div>

        </div>
    </template>
</div>
    `,
    setup(props) {
        const { ref, computed, onMounted, onUnmounted, nextTick } = Vue

        const loading = ref(true)
        const data    = ref(null)
        const donutRef = ref(null)
        const barRef   = ref(null)

        const score = computed(() => {
            if (!data.value) return 0
            const total = data.value.likes + data.value.dislikes
            return total ? Math.round((data.value.likes / total) * 100) : 0
        })

        const hasVotes = computed(() =>
            !!(data.value && (data.value.likes > 0 || data.value.dislikes > 0))
        )

        const tagEntries = computed(() => {
            if (!data.value) return []
            return Object.entries(data.value.reactions || {})
                .filter(([, v]) => v > 0)
                .sort((a, b) => b[1] - a[1])
        })

        const hasTagReactions = computed(() => tagEntries.value.length > 0)
        const hasData = computed(() => hasVotes.value || hasTagReactions.value)
        const barHeight = computed(() => Math.max(tagEntries.value.length * 40 + 16, 60))

        let _dataReady  = false
        let _tabVisible = false
        let _inited     = false
        let _donut      = null
        let _bar        = null

        function cssVar(v) {
            return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || ''
        }

        async function drawCharts() {
            try {
                const { Chart, registerables } = await import(
                    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/+esm'
                )
                Chart.register(...registerables)

                const text2  = cssVar('--text-2')  || '#6b7280'
                const text3  = cssVar('--text-3')  || '#9ca3af'
                const border = cssVar('--border')  || '#e5e7eb'

                if (donutRef.value && hasVotes.value) {
                    _donut = new Chart(donutRef.value, {
                        type: 'doughnut',
                        data: {
                            labels: ['Helpful', 'Not helpful'],
                            datasets: [{
                                data: [data.value.likes, data.value.dislikes],
                                backgroundColor: ['#2563eb', '#dc2626'],
                                borderWidth: 0,
                                hoverOffset: 6,
                            }],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '72%',
                            animation: { duration: 500 },
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    callbacks: {
                                        label: ctx => ` ${ctx.label}: ${ctx.raw}`,
                                    },
                                },
                            },
                        },
                    })
                }

                if (barRef.value && hasTagReactions.value) {
                    const defMap = {}
                    for (const r of data.value.reaction_defs || []) {
                        defMap[r.key] = r.color || '#888888'
                    }
                    const shortLabel = (key) => {
                        const v = key.includes(':') ? key.split(':').slice(1).join(':') : key
                        return v.replace(/^"(.+)"$/, '$1').substring(0, 26)
                    }
                    _bar = new Chart(barRef.value, {
                        type: 'bar',
                        data: {
                            labels: tagEntries.value.map(([k]) => shortLabel(k)),
                            datasets: [{
                                data: tagEntries.value.map(([, v]) => v),
                                backgroundColor: tagEntries.value.map(([k]) => defMap[k] || '#888888'),
                                borderWidth: 0,
                                borderRadius: 4,
                            }],
                        },
                        options: {
                            indexAxis: 'y',
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: { duration: 500 },
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    callbacks: {
                                        title: (items) => tagEntries.value[items[0].dataIndex]?.[0] || '',
                                        label: ctx => ` ${ctx.raw} user${ctx.raw !== 1 ? 's' : ''}`,
                                    },
                                },
                            },
                            scales: {
                                x: {
                                    min: 0,
                                    ticks: { color: text3, font: { size: 11 }, stepSize: 1 },
                                    grid: { color: border },
                                    border: { display: false },
                                },
                                y: {
                                    ticks: { color: text2, font: { size: 11 } },
                                    grid: { display: false },
                                },
                            },
                        },
                    })
                }
            } catch (e) {
                console.error('EvaluationCharts: draw error', e)
            }
        }

        async function tryInit() {
            if (!_dataReady || !_tabVisible || _inited) return
            _inited = true
            await nextTick()
            await new Promise(r => requestAnimationFrame(r))
            await drawCharts()
        }

        async function fetchData() {
            try {
                const res  = await fetch(`/evaluate/summary/${props.conversionId}`)
                const body = await res.json()
                if (body.success) data.value = body
            } catch (e) {
                console.error('EvaluationCharts: fetch error', e)
            } finally {
                loading.value = false
                _dataReady    = true
                tryInit()
            }
        }

        function onBsTabShown(e) {
            const href = e.target?.getAttribute('href') || ''
            if (href === `#eval-pane-${props.conversionId}`) {
                _tabVisible = true
                tryInit()
            }
        }

        onMounted(() => {
            fetchData()
            const pane = document.getElementById(`eval-pane-${props.conversionId}`)
            if (pane?.classList.contains('active')) {
                _tabVisible = true
            }
            document.addEventListener('shown.bs.tab', onBsTabShown)
        })

        onUnmounted(() => {
            document.removeEventListener('shown.bs.tab', onBsTabShown)
            _donut?.destroy()
            _bar?.destroy()
        })

        return {
            loading, data, score, hasVotes, hasTagReactions, hasData,
            tagEntries, barHeight, donutRef, barRef,
        }
    },
}

export default EvaluationCharts
