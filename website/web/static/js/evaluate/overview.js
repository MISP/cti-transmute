import { useVitrine } from '../vitrine.js'
// overview.js - Vue 3 Options API component for /evaluate/overview

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
        }
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

        // Charts are Vitrine <vt-chart> elements (Apache ECharts, self-hosted):
        // data handed over as CSV text, theme and accent kept in sync with the site.
        async mountChart(id, csv, attrs) {
            const host = document.getElementById(id)
            if (!host) return
            const [ok] = await useVitrine('chart')
            if (!ok) { host.textContent = 'The chart could not load.'; return }
            const el = document.createElement('vt-chart')
            for (const [k, v] of Object.entries(attrs)) {
                if (v === true) el.setAttribute(k, '')
                else if (v !== false && v !== undefined) el.setAttribute(k, String(v))
            }
            el.content = csv
            host.replaceChildren(el)
        },

        csvCell(v) {
            const t = String(v ?? '')
            return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
        },

        async drawCharts() {
            if (!this.stats) return
            try {
                if (this.has_donut_data) {
                    await this.mountChart('ov-donut',
                        `Answer,Votes\nHelpful,${this.stats.total_likes}\nNot helpful,${this.stats.total_dislikes}`,
                        { type: 'pie', height: 240, tabs: true })
                }
                if (this.has_bar_data) {
                    const rows = this.stats.top_tags.map(t => `${this.csvCell(t.label || t.name)},${t.count}`)
                    await this.mountChart('ov-bar', `Reaction tag,Votes\n${rows.join('\n')}`,
                        { type: 'bar', horizontal: true, height: Math.max(240, 28 * rows.length + 60), tabs: true, legend: false })
                }
                if (this.has_radar_data) {
                    // Average score per category, 0 (very low) to 100 (very high).
                    const VALUE_SCORE = { 'very-low': 0, 'low': 25, 'moderate': 50, 'high': 75, 'very-high': 100 }
                    const rows = Object.keys(this.stats.category_breakdown).map(cat => {
                        let total = 0, sum = 0
                        for (const [val, cnt] of Object.entries(this.stats.category_breakdown[cat])) {
                            if (val in VALUE_SCORE) { sum += VALUE_SCORE[val] * cnt; total += cnt }
                        }
                        return `${this.csvCell(cat.charAt(0).toUpperCase() + cat.slice(1))},${total ? Math.round(sum / total) : 0}`
                    })
                    await this.mountChart('ov-radar', `Category,Average score\n${rows.join('\n')}`,
                        { type: 'bar', horizontal: true, min: 0, max: 100, height: Math.max(240, 32 * rows.length + 60), tabs: true, legend: false })
                }
            } catch (e) {
                console.error('overview: drawCharts error', e)
            }
        },

        async drawTimelineChart() {
            if (!this.timeline.length) return
            try {
                const rows = this.timeline.map(d => `${String(d.date).slice(0, 10)},${d.count}`)
                await this.mountChart('ov-timeline', `Date,Evaluations\n${rows.join('\n')}`,
                    { type: 'area', smooth: true, height: 260, zoom: rows.length > 30, tabs: true, legend: false, min: 0 })
            } catch (e) {
                console.error('overview: drawTimelineChart error', e)
            }
        }
    },

    async mounted() {
        await Promise.all([
            this.fetchGlobalStats(),
            this.fetchRecent(),
            this.fetchTimeline()
        ])
    }
}

export default OverviewApp
