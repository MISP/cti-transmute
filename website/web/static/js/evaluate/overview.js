// overview.js — Vue 3 Options API component for /evaluate/overview

const OverviewApp = {
    delimiters: ['[[', ']]'],

    data() {
        return {
            // Global stats
            stats: null,
            stats_loading: true,

            // Recent conversions
            recent: [],
            recent_loading: true,

            // Activity timeline
            timeline: [],
            timeline_loading: true,

            // Chart instances
            _donutChart: null,
            _barChart: null,
            _radarChart: null,
            _timelineChart: null,
        }
    },

    computed: {
        kpi_evaluations() {
            return this.stats ? this.stats.total_evaluations : null
        },
        kpi_conversions() {
            return this.stats ? this.stats.conversions_evaluated : null
        },
        kpi_like_ratio() {
            return this.stats ? this.stats.like_ratio : null
        },
        kpi_avg_score() {
            return this.stats ? this.stats.avg_score : null
        },
        has_donut_data() {
            return this.stats && (this.stats.total_likes > 0 || this.stats.total_dislikes > 0)
        },
        has_bar_data() {
            return this.stats && this.stats.top_tags && this.stats.top_tags.length > 0
        },
        has_radar_data() {
            return this.stats && this.stats.category_breakdown && Object.keys(this.stats.category_breakdown).length > 0
        },
        timeline_total() {
            return this.timeline.reduce((s, d) => s + d.count, 0)
        },
    },

    methods: {
        formatDate: ctiDate.formatDate,

        openConversion(id) {
            sessionStorage.setItem('open_eval_tab', String(id))
            window.location.href = '/conversions/detail/' + id
        },

        async fetchGlobalStats() {
            this.stats_loading = true
            try {
                const res = await fetch('/evaluate/global_stats')
                const data = await res.json()
                if (data.success) {
                    this.stats = data
                    this.$nextTick(() => this.drawCharts())
                }
            } catch (e) {
                console.error('overview: fetchGlobalStats error', e)
            } finally {
                this.stats_loading = false
            }
        },

        async fetchRecent() {
            this.recent_loading = true
            try {
                const res = await fetch('/evaluate/recent_to_evaluate')
                const data = await res.json()
                if (data.success) this.recent = data.list
            } catch (e) {
                console.error('overview: fetchRecent error', e)
            } finally {
                this.recent_loading = false
            }
        },

        async fetchTimeline() {
            this.timeline_loading = true
            try {
                const res = await fetch('/evaluate/activity_timeline?days=30')
                const data = await res.json()
                if (data.success) {
                    this.timeline = data.timeline
                    if (this.timeline_total > 0) {
                        this.$nextTick(() => this.drawTimelineChart())
                    }
                }
            } catch (e) {
                console.error('overview: fetchTimeline error', e)
            } finally {
                this.timeline_loading = false
            }
        },

        conversionLabel(type) {
            if (!type) return 'Conversion'
            return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        },

        cssVar(v) {
            return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || ''
        },

        async drawCharts() {
            if (!this.stats) return
            try {
                const { Chart, registerables } = await import(
                    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/+esm'
                )
                Chart.register(...registerables)

                const text2  = this.cssVar('--text-2')  || '#6b7280'
                const text3  = this.cssVar('--text-3')  || '#9ca3af'
                const border = this.cssVar('--border')  || '#e5e7eb'
                const accent = this.cssVar('--accent')  || '#2563eb'

                if (this._donutChart) { this._donutChart.destroy(); this._donutChart = null }
                if (this._barChart)   { this._barChart.destroy();   this._barChart   = null }
                if (this._radarChart) { this._radarChart.destroy(); this._radarChart  = null }

                // ── Donut: like vs dislike ──
                const donutEl = document.getElementById('ov-donut')
                if (donutEl && this.has_donut_data) {
                    this._donutChart = new Chart(donutEl, {
                        type: 'doughnut',
                        data: {
                            labels: ['Helpful', 'Not helpful'],
                            datasets: [{
                                data: [this.stats.total_likes, this.stats.total_dislikes],
                                backgroundColor: ['#2563eb', '#dc2626'],
                                borderWidth: 0,
                                hoverOffset: 6,
                            }],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '70%',
                            animation: { duration: 600 },
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: { color: text2, font: { size: 11 }, boxWidth: 10, padding: 10 },
                                },
                                tooltip: {
                                    callbacks: {
                                        label: ctx => ` ${ctx.label}: ${ctx.raw}`,
                                    },
                                },
                            },
                        },
                    })
                }

                // ── Horizontal bar: top tags ──
                const barEl = document.getElementById('ov-bar')
                if (barEl && this.has_bar_data) {
                    const topTags = this.stats.top_tags
                    const shortLabel = (label) => label.length > 28 ? label.substring(0, 26) + '…' : label
                    this._barChart = new Chart(barEl, {
                        type: 'bar',
                        data: {
                            labels: topTags.map(t => shortLabel(t.label || t.name)),
                            datasets: [{
                                data: topTags.map(t => t.count),
                                backgroundColor: topTags.map(t => t.color || accent),
                                borderWidth: 0,
                                borderRadius: 4,
                            }],
                        },
                        options: {
                            indexAxis: 'y',
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: { duration: 600 },
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    callbacks: {
                                        title: (items) => topTags[items[0].dataIndex]?.name || '',
                                        label: ctx => ` ${ctx.raw} vote${ctx.raw !== 1 ? 's' : ''}`,
                                    },
                                },
                            },
                            scales: {
                                x: {
                                    min: 0,
                                    ticks: { color: text3, font: { size: 10 }, stepSize: 1 },
                                    grid: { color: border },
                                    border: { display: false },
                                    title: { display: true, text: 'Number of votes', color: text3, font: { size: 10 } },
                                },
                                y: {
                                    ticks: { color: text2, font: { size: 10 } },
                                    grid: { display: false },
                                    title: { display: true, text: 'Reaction tag', color: text3, font: { size: 10 } },
                                },
                            },
                        },
                    })
                }

                // ── Radar: category breakdown ──
                const radarEl = document.getElementById('ov-radar')
                if (radarEl && this.has_radar_data) {
                    const VALUE_SCORE = { 'very-low': 0, 'low': 25, 'moderate': 50, 'high': 75, 'very-high': 100 }
                    const cats = Object.keys(this.stats.category_breakdown)
                    const scores = cats.map(cat => {
                        const counts = this.stats.category_breakdown[cat]
                        let total = 0, sum = 0
                        for (const [val, cnt] of Object.entries(counts)) {
                            if (val in VALUE_SCORE) {
                                sum += VALUE_SCORE[val] * cnt
                                total += cnt
                            }
                        }
                        return total ? Math.round(sum / total) : 0
                    })
                    this._radarChart = new Chart(radarEl, {
                        type: 'radar',
                        data: {
                            labels: cats.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
                            datasets: [{
                                label: 'Avg Score',
                                data: scores,
                                backgroundColor: 'rgba(37,99,235,0.15)',
                                borderColor: accent,
                                borderWidth: 2,
                                pointBackgroundColor: accent,
                                pointRadius: 4,
                            }],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: { duration: 600 },
                            scales: {
                                r: {
                                    min: 0,
                                    max: 100,
                                    ticks: { color: text3, font: { size: 9 }, stepSize: 25 },
                                    grid: { color: border },
                                    pointLabels: { color: text2, font: { size: 10 } },
                                    angleLines: { color: border },
                                },
                            },
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    callbacks: {
                                        label: ctx => ` Score: ${ctx.raw}/100`,
                                    },
                                },
                            },
                        },
                    })
                }
            } catch (e) {
                console.error('overview: drawCharts error', e)
            }
        },

        async drawTimelineChart() {
            if (!this.timeline.length) return
            try {
                const { Chart, registerables } = await import(
                    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/+esm'
                )
                Chart.register(...registerables)

                const text2  = this.cssVar('--text-2')  || '#6b7280'
                const text3  = this.cssVar('--text-3')  || '#9ca3af'
                const border = this.cssVar('--border')  || '#e5e7eb'
                const accent = this.cssVar('--accent')  || '#2563eb'

                if (this._timelineChart) { this._timelineChart.destroy(); this._timelineChart = null }

                const el = document.getElementById('ov-timeline')
                if (!el) return

                const labels = this.timeline.map(d => {
                    const date = new Date(d.date)
                    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
                })
                const counts = this.timeline.map(d => d.count)

                this._timelineChart = new Chart(el, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [{
                            label: 'Evaluations',
                            data: counts,
                            borderColor: accent,
                            backgroundColor: 'rgba(37,99,235,0.08)',
                            borderWidth: 2,
                            pointRadius: 3,
                            pointBackgroundColor: accent,
                            fill: true,
                            tension: 0.35,
                        }],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 600 },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: ctx => ` ${ctx.raw} evaluation${ctx.raw !== 1 ? 's' : ''}`,
                                },
                            },
                        },
                        scales: {
                            x: {
                                ticks: {
                                    color: text3,
                                    font: { size: 10 },
                                    maxRotation: 0,
                                    maxTicksLimit: 10,
                                },
                                grid: { display: false },
                                border: { display: false },
                                title: { display: true, text: 'Date', color: text3, font: { size: 10 } },
                            },
                            y: {
                                min: 0,
                                ticks: { color: text3, font: { size: 10 }, stepSize: 1, precision: 0 },
                                grid: { color: border },
                                border: { display: false },
                                title: { display: true, text: 'Evaluations', color: text3, font: { size: 10 } },
                            },
                        },
                    },
                })
            } catch (e) {
                console.error('overview: drawTimelineChart error', e)
            }
        },
    },

    async mounted() {
        await Promise.all([
            this.fetchGlobalStats(),
            this.fetchRecent(),
            this.fetchTimeline(),
        ])
    },
}

export default OverviewApp
