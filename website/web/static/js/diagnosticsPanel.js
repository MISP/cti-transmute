// DiagnosticsPanel — Vue 3 component for what a conversion reported about its
// own output. Register with: app.component('diagnostics-panel', DiagnosticsPanel)
//
// The blob is the converter's own report, kept verbatim, so this only sorts it
// for display. Three states the surfaces have to tell apart: nothing fetched
// yet (say nothing), a row that predates Diagnostics (null, "not recorded"),
// and a conversion that ran clean (reported nothing).

const DiagnosticsPanel = {
    delimiters: ['[[', ']]'],
    props: {
        // The stored blob: undefined until fetched, null when not recorded.
        diagnostics: { type: Object, default: undefined },
        title: { type: String, default: 'Diagnostics' },
        // Collapsed behind a toggle where most conversions are clean and the
        // panel would otherwise be a permanent empty row.
        collapsible: { type: Boolean, default: false },
        missingText: {
            type: String,
            default: 'Diagnostics not recorded — this conversion predates Diagnostics tracking.',
        },
    },
    template: `
<div class="custom-card p-3 mb-4">
    <button v-if="collapsible" type="button" class="diag-toggle" @click="open = !open">
        <i class="fas" :class="open ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
        <span class="form-label mb-0">[[ title ]]</span>
        <span v-if="state.reported" class="diag-badge">
            [[ state.warnings_count ]] warnings · [[ state.errors_count ]] errors
        </span>
    </button>
    <p v-else class="form-label mb-2">
        <i class="fas fa-triangle-exclamation me-1" style="color:var(--text-3);"></i>
        [[ title ]]
        <span v-if="state.reported" class="diag-badge ms-1">
            [[ state.warnings_count ]] warnings · [[ state.errors_count ]] errors
        </span>
    </p>

    <div v-show="open" :class="collapsible ? 'mt-3' : ''">
        <template v-if="state.loaded">
            <p class="diag-missing mb-0" v-if="!state.recorded">[[ missingText ]]</p>
            <p class="diag-missing mb-0" v-else-if="!state.reported">
                Nothing reported — this output is a faithful rendering of its input.
            </p>
            <template v-else>
                <div v-for="group in state.groups" :key="group.kind" class="mb-3">
                    <p class="diag-group-title mb-2" :class="group.css">[[ group.kind ]]</p>
                    <div v-for="entry in group.entries" :key="entry.identifier" class="mb-2">
                        <code class="diag-identifier">[[ entry.identifier ]]</code>
                        <ul class="diag-messages mb-0">
                            <li v-for="(message, i) in entry.messages" :key="i">[[ message ]]</li>
                        </ul>
                    </div>
                </div>
            </template>
        </template>
    </div>
</div>`,
    data() {
        return { open: !this.collapsible }
    },
    computed: {
        state() {
            const blob = this.diagnostics
            if (blob === undefined) {
                return { loaded: false, recorded: false, reported: false, groups: [] }
            }
            if (blob === null) {
                return { loaded: true, recorded: false, reported: false, groups: [] }
            }
            const counts = blob.counts || {}
            const groups = [
                { kind: 'Warnings', css: 'diag-warnings', bucket: blob.warnings || {} },
                { kind: 'Errors',   css: 'diag-errors',   bucket: blob.errors   || {} },
            ].map(g => ({
                kind: g.kind,
                css: g.css,
                entries: Object.entries(g.bucket).map(
                    ([identifier, messages]) => ({ identifier, messages })
                ),
            })).filter(g => g.entries.length > 0)
            return {
                loaded: true,
                recorded: true,
                reported: groups.length > 0,
                warnings_count: counts.warnings || 0,
                errors_count: counts.errors || 0,
                groups,
            }
        },
    },
}

export default DiagnosticsPanel
