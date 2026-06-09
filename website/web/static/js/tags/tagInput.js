import SingleTagDisplay from './singleTagDisplay.js';

const TagInput = {
    components: { 'single-tag': SingleTagDisplay },
    props: {
        convertId:     { type: Number,  default: null },
        hiddenInputId: { type: String,  default: '' },
        canEdit:       { type: Boolean, default: true },
    },
    delimiters: ['[[', ']]'],
    data() {
        return {
            // ── Evaluation consensus tags (shown at top, threshold=3 votes) ──
            evaluationTags:   [],
            loadingEval:      false,
            evalCollapsed:    false,

            // ── Content Tags (embedded in MISP/STIX JSON, read-only) ──
            contentTags:      [],
            loadingContent:   false,
            contentCollapsed: true,

            // ── Applied Tags (user-added, from DB) ──
            selectedTags:    [],
            searchResults:   [],
            search:          '',
            selectedSource:  'all',
            dropdownOpen:    false,
            loadingCurrent:  true,
            searching:     false,
            saving:        false,
            tagsCollapsed: false,

            _debounceTimer: null,
        };
    },
    computed: {
        visibleEval() {
            if (!this.evalCollapsed) return this.evaluationTags;
            return this.evaluationTags.slice(0, 6);
        },
        visibleContent() {
            if (!this.contentCollapsed) return this.contentTags;
            return this.contentTags.slice(0, 6);
        },
        visibleSelected() {
            if (!this.tagsCollapsed) return this.selectedTags;
            return this.selectedTags.slice(0, 4);
        },
        filteredDropdown() {
            const selectedIds = new Set(this.selectedTags.map(t => t.id));
            return this.searchResults.filter(t => !selectedIds.has(t.id));
        },
        sourceFilters() {
            return [
                { key: 'all',           label: 'All' },
                { key: 'taxonomy',      label: 'Taxonomy' },
                { key: 'custom',        label: 'Custom' },
                { key: 'vulnerability', label: 'Vuln' },
            ];
        },
    },
    watch: {
        search(val) {
            clearTimeout(this._debounceTimer);
            this._debounceTimer = setTimeout(() => this._fetchSuggestions(val, this.selectedSource), 220);
        },
        selectedSource(src) {
            this._fetchSuggestions(this.search, src);
        },
        selectedTags(tags) {
            if (this.hiddenInputId) {
                const el = document.getElementById(this.hiddenInputId);
                if (el) el.value = tags.map(t => t.id).join(',');
            }
        },
    },
    async mounted() {
        if (this.convertId) {
            // Load all three sections in parallel
            await Promise.all([
                this._loadEvaluationTags(),
                this._loadContentTags(),
                this._loadAppliedTags(),
            ]);
        }
        this.loadingCurrent = false;
        if (this.canEdit) this._fetchSuggestions('', 'all');

        this._outsideClick = (e) => {
            if (!this.$el.contains(e.target)) this.dropdownOpen = false;
        };
        document.addEventListener('click', this._outsideClick);

        this._evalUpdated = (e) => {
            if (this.convertId && e.detail?.convertId === this.convertId)
                this._loadEvaluationTags();
        };
        document.addEventListener('evaluate:updated', this._evalUpdated);
    },
    beforeUnmount() {
        document.removeEventListener('click', this._outsideClick);
        document.removeEventListener('evaluate:updated', this._evalUpdated);
        clearTimeout(this._debounceTimer);
    },
    methods: {
        async _loadEvaluationTags() {
            if (!this.convertId) return;
            this.loadingEval = true;
            try {
                const r = await fetch(`/evaluate/consensus_tags/${this.convertId}?threshold=1`);
                if (r.ok) {
                    const d = await r.json();
                    if (d.success) this.evaluationTags = d.tags || [];
                }
            } catch (e) {
                console.error('TagInput: failed to load evaluation tags', e);
            }
            this.loadingEval = false;
        },

        async _loadContentTags() {
            if (!this.convertId) return;
            this.loadingContent = true;
            try {
                const r = await fetch(`/convert/json_tags/${this.convertId}`);
                if (r.ok) {
                    const d = await r.json();
                    if (d.success) this.contentTags = d.tags || [];
                }
            } catch (e) {
                console.error('TagInput: failed to load content tags', e);
            }
            this.loadingContent = false;
        },

        async _loadAppliedTags() {
            try {
                const r = await fetch(`/tags/for_convert/${this.convertId}?source_type=user`);
                if (r.ok) {
                    const d = await r.json();
                    if (d.success) {
                        this.selectedTags = d.list.map(a => ({
                            id:          a.tag_id,
                            name:        a.tag_name  || `#${a.tag_id}`,
                            color:       a.tag_color,
                            icon:        a.tag_icon,
                            visibility:  a.tag_visibility,
                            description: a.tag_description,
                        }));
                    }
                }
            } catch (e) {
                console.error('TagInput: failed to load applied tags', e);
            }
        },

        async _fetchSuggestions(q, source) {
            if (!this.canEdit) return;
            this.searching = true;
            try {
                const params = new URLSearchParams();
                if (q && q.trim()) params.set('search', q.trim());
                if (source && source !== 'all') params.set('source', source);
                const url = '/tags/available' + (params.toString() ? '?' + params.toString() : '');
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) this.searchResults = data.list;
                }
            } catch (e) {
                console.error('TagInput: search error', e);
            } finally {
                this.searching = false;
            }
        },

        openDropdown() {
            this.dropdownOpen = true;
            if (this.searchResults.length === 0) this._fetchSuggestions(this.search, this.selectedSource);
        },
        setSource(src) {
            this.selectedSource = src;
            this.dropdownOpen = true;
        },
        addTag(tag) {
            if (!this.selectedTags.find(t => t.id === tag.id)) {
                this.selectedTags = [...this.selectedTags, tag];
            }
            this.search = '';
            this.dropdownOpen = false;
            if (this.convertId) this._saveRemote();
        },
        removeTag(tagId) {
            this.selectedTags = this.selectedTags.filter(t => t.id !== tagId);
            if (this.convertId) this._saveRemote();
        },

        async _saveRemote() {
            if (!this.convertId) return;
            this.saving = true;
            try {
                await fetch(`/tags/save_for_convert/${this.convertId}`, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ tag_ids: this.selectedTags.map(t => t.id) }),
                });
            } catch (e) {
                console.error('TagInput: save error', e);
            } finally {
                this.saving = false;
            }
        },

    },
    template: `
        <div class="tag-input-wrapper">

            <!-- ══ 1. EVALUATION CONSENSUS TAGS (≥3 votes, read-only) ═════════ -->
            <template v-if="convertId && (loadingEval || evaluationTags.length > 0)">
                <div class="ti-section-header" style="margin-bottom:0.4rem;">
                    <span class="form-label mb-0" style="font-size:0.83rem; font-weight:600; color:var(--text-2);">
                        <i class="fas fa-chart-bar me-1" style="color:#f59e0b;"></i> Evaluation Tags
                    </span>
                    <span class="ti-section-badge ti-section-badge--eval">Consensus</span>
                    <i class="fas fa-circle-question ti-help-icon"
                       title="Tags derived from community evaluations. Each tag shown here represents the winning value for an evaluation category (at least 1 vote required)."></i>
                    <span v-if="evaluationTags.length" style="font-size:0.72rem; color:var(--text-3); margin-left:0.3rem;">
                        [[ evaluationTags.length ]] tag[[ evaluationTags.length !== 1 ? 's' : '' ]]
                    </span>
                </div>

                <div v-if="loadingEval" style="font-size:0.78rem; color:var(--text-3); font-style:italic; margin-bottom:0.5rem;">
                    <i class="fas fa-spinner fa-spin me-1"></i>Loading…
                </div>
                <template v-else-if="evaluationTags.length">
                    <div class="d-flex flex-wrap gap-2 mb-1">
                        <div v-for="tag in visibleEval" :key="tag.name" class="d-inline-flex align-items-center gap-1">
                            <single-tag :tag="tag" :show-full="true"></single-tag>
                            <span style="font-size:0.65rem; color:var(--text-3); font-style:italic;">
                                ×[[ tag.votes ]]
                            </span>
                        </div>
                    </div>
                    <button v-if="evaluationTags.length > 6" type="button"
                            @click.prevent="evalCollapsed = !evalCollapsed"
                            class="btn btn-sm"
                            style="font-size:0.7rem; padding:1px 8px; background:none;
                                   border:1px solid var(--border); color:var(--text-3);
                                   border-radius:var(--radius-sm); margin-bottom:0.25rem;">
                        <i :class="evalCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up'" class="me-1"></i>
                        <span v-if="evalCollapsed">Show all [[ evaluationTags.length ]]</span>
                        <span v-else>Collapse</span>
                    </button>
                </template>

                <div class="ti-section-divider"></div>
            </template>

            <!-- ══ 2. CONTENT TAGS (embedded in JSON, read-only) ════════════ -->
            <template v-if="convertId">
                <div class="ti-section-header" style="margin-bottom:0.4rem;">
                    <span class="form-label mb-0" style="font-size:0.83rem; font-weight:600; color:var(--text-2);">
                        <i class="fas fa-file-code me-1" style="color:var(--text-3);"></i> Content Tags
                    </span>
                    <span class="ti-section-badge ti-section-badge--json">JSON</span>
                    <i class="fas fa-circle-question ti-help-icon"
                       title="Tags found inside the original MISP/STIX JSON. Read-only — the JSON is never modified."></i>
                    <span v-if="contentTags.length" style="font-size:0.72rem; color:var(--text-3); margin-left:0.3rem;">
                        [[ contentTags.length ]] tag[[ contentTags.length !== 1 ? 's' : '' ]] detected
                    </span>
                </div>

                <div v-if="loadingContent" style="font-size:0.78rem; color:var(--text-3); font-style:italic; margin-bottom:0.5rem;">
                    <i class="fas fa-spinner fa-spin me-1"></i>Scanning JSON…
                </div>
                <template v-else>
                    <div v-if="contentTags.length === 0"
                         style="font-size:0.8rem; color:var(--text-3); font-style:italic; margin-bottom:0.75rem;">
                        No tags embedded in this JSON.
                    </div>
                    <div v-else style="margin-bottom:0.75rem;">
                        <div class="d-flex flex-wrap gap-2 mb-1">
                            <single-tag v-for="tag in visibleContent" :key="tag.name"
                                        :tag="tag" :show-namespace="true">
                            </single-tag>
                        </div>
                        <button v-if="contentTags.length > 6" type="button"
                                @click.prevent="contentCollapsed = !contentCollapsed"
                                class="btn btn-sm"
                                style="font-size:0.7rem; padding:1px 8px; background:none;
                                       border:1px solid var(--border); color:var(--text-3);
                                       border-radius:var(--radius-sm);">
                            <i :class="contentCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up'" class="me-1"></i>
                            <span v-if="contentCollapsed">Show all [[ contentTags.length ]] tags</span>
                            <span v-else>Collapse</span>
                        </button>
                    </div>
                </template>

                <div class="ti-section-divider"></div>
            </template>

            <!-- ══ 3. APPLIED TAGS (user-added, editable in edit page) ═══════ -->
            <template v-if="canEdit || selectedTags.length > 0">
            <div class="ti-section-header" style="margin-bottom:0.4rem;">
                <span class="form-label mb-0" style="font-size:0.83rem; font-weight:600; color:var(--text-2);">
                    <i class="fas fa-tags me-1"></i> Applied Tags
                </span>
                <span class="ti-section-badge ti-section-badge--user">User</span>
                <i class="fas fa-circle-question ti-help-icon"
                   title="Tags manually added by users. Stored separately from the JSON — these do not modify the original content."></i>
                <span v-if="saving" style="font-size:0.75rem; color:var(--text-3); margin-left:0.5rem;">
                    <i class="fas fa-spinner fa-spin me-1"></i>Saving…
                </span>
            </div>

            <div v-if="loadingCurrent" style="font-size:0.82rem; color:var(--text-3); font-style:italic;">
                <i class="fas fa-spinner fa-spin me-1"></i>Loading…
            </div>
            <template v-else>
                <div v-if="selectedTags.length > 0">
                    <div class="d-flex flex-wrap gap-2 mb-1">
                        <div v-for="tag in visibleSelected" :key="tag.id"
                             class="d-inline-flex align-items-center" style="gap:2px;">
                            <single-tag :tag="tag" :show-namespace="true"></single-tag>
                            <button v-if="canEdit" type="button"
                                @click.prevent="removeTag(tag.id)"
                                class="tag-remove-btn"
                                :aria-label="'Remove ' + tag.name">
                                <i class="fas fa-xmark"></i>
                            </button>
                        </div>
                    </div>
                    <button v-if="selectedTags.length > 4" type="button"
                            @click.prevent="tagsCollapsed = !tagsCollapsed"
                            class="btn btn-sm"
                            style="font-size:0.72rem; padding:1px 8px; margin-bottom:0.4rem;
                                   background:none; border:1px solid var(--border); color:var(--text-3);
                                   border-radius:var(--radius-sm);">
                        <i :class="tagsCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up'" class="me-1"></i>
                        <span v-if="tagsCollapsed">Show all [[ selectedTags.length ]] tags</span>
                        <span v-else>Collapse</span>
                    </button>
                </div>
                <div v-else-if="canEdit" class="mb-2"
                     style="font-size:0.82rem; color:var(--text-3); font-style:italic;">
                    No applied tags yet. Search and add tags below.
                </div>

                <!-- Source filter pills (edit mode only) -->
                <div v-if="canEdit" class="d-flex gap-1 mb-2">
                    <button v-for="f in sourceFilters" :key="f.key" type="button"
                        @click.prevent="setSource(f.key)"
                        class="tag-source-btn" :class="{ active: selectedSource === f.key }">
                        [[ f.label ]]
                    </button>
                </div>

                <!-- Search input (edit mode only) -->
                <div v-if="canEdit" class="position-relative tag-input-search-wrap">
                    <div class="input-group input-group-sm" style="max-width:320px;">
                        <span class="input-group-text"
                              style="background:var(--surface); border-color:var(--border); color:var(--text-3);">
                            <i v-if="searching" class="fas fa-spinner fa-spin" style="font-size:0.65rem;"></i>
                            <i v-else class="fas fa-magnifying-glass" style="font-size:0.65rem;"></i>
                        </span>
                        <input type="text" class="form-control form-control-sm"
                            v-model="search" @focus="openDropdown"
                            @keydown.escape="dropdownOpen = false; search = ''"
                            placeholder="Search tags to apply…" autocomplete="off"
                            style="background:var(--surface); color:var(--text); border-color:var(--border); font-size:0.82rem;">
                    </div>

                    <!-- Dropdown -->
                    <div v-if="dropdownOpen" class="tag-input-dropdown"
                         style="position:absolute; top:calc(100% + 3px); left:0; min-width:300px; z-index:900;
                                background:var(--surface); border:1px solid var(--border);
                                border-radius:var(--radius-sm); max-height:260px; overflow-y:auto;
                                box-shadow:var(--shadow-lg);">
                        <template v-if="filteredDropdown.length > 0">
                            <div v-for="tag in filteredDropdown" :key="tag.id"
                                @click="addTag(tag)"
                                class="tag-input-dropdown-item px-3 py-2 d-flex align-items-center gap-2"
                                style="cursor:pointer; border-bottom:1px solid var(--border); font-size:0.82rem;">
                                <single-tag :tag="tag" :show-namespace="true" :highlight="search"></single-tag>
                            </div>
                        </template>
                        <div v-else-if="searching"
                             style="padding:0.65rem 0.85rem; color:var(--text-3); font-size:0.8rem;">
                            <i class="fas fa-spinner fa-spin me-1"></i> Searching…
                        </div>
                        <div v-else-if="search"
                             style="padding:0.65rem 0.85rem; color:var(--text-3); font-size:0.8rem; font-style:italic;">
                            No tags matching "[[ search ]]"
                        </div>
                        <div v-else
                             style="padding:0.65rem 0.85rem; color:var(--text-3); font-size:0.8rem; font-style:italic;">
                            Type to search tags…
                        </div>
                    </div>
                </div>
            </template>
            </template>
        </div>
    `,
};

export default TagInput;
