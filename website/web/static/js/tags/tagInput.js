import SingleTagDisplay from './singleTagDisplay.js';

const TagInput = {
    components: { 'single-tag': SingleTagDisplay },
    props: {
        convertId:       { type: Number,  default: null },
        hiddenInputId:   { type: String,  default: '' },
        canEdit:         { type: Boolean, default: true },
        // For create forms: IDs of the JSON source inputs
        jsonTextareaId:  { type: String,  default: '' },
        jsonFileInputId: { type: String,  default: '' },
    },
    delimiters: ['[[', ']]'],
    data() {
        return {
            selectedTags:   [],
            searchResults:  [],
            search:         '',
            selectedSource: 'all',
            dropdownOpen:   false,
            loadingCurrent: true,
            searching:      false,
            saving:         false,
            scanning:       false,
            scanMessage:    '',
            scanIsError:    false,
            tagsCollapsed:  false,
            _debounceTimer: null,
            _scanTimer:     null,
        };
    },
    computed: {
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
        // Show scan button for create forms (textarea/file inputs provided)
        showScanFromInput() {
            return this.canEdit && (this.jsonTextareaId || this.jsonFileInputId);
        },
        // Show scan button for edit page (convertId set, no external JSON inputs)
        showScanFromConvert() {
            return this.canEdit && this.convertId && !this.jsonTextareaId && !this.jsonFileInputId;
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
            try {
                const r = await fetch(`/tags/for_convert/${this.convertId}`);
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
                console.error('TagInput: failed to load current tags', e);
            }
        }
        this.loadingCurrent = false;
        if (this.canEdit) this._fetchSuggestions('', 'all');

        this._outsideClick = (e) => {
            if (!this.$el.contains(e.target)) this.dropdownOpen = false;
        };
        document.addEventListener('click', this._outsideClick);
    },
    beforeUnmount() {
        document.removeEventListener('click', this._outsideClick);
        clearTimeout(this._debounceTimer);
        clearTimeout(this._scanTimer);
    },
    methods: {
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
        _setScanMessage(msg, isError = false) {
            this.scanMessage = msg;
            this.scanIsError = isError;
            clearTimeout(this._scanTimer);
            this._scanTimer = setTimeout(() => { this.scanMessage = ''; }, 5000);
        },
        _mergeTags(found) {
            const newTags = found.filter(t => !this.selectedTags.find(s => s.id === t.id));
            if (newTags.length > 0) {
                this.selectedTags = [...this.selectedTags, ...newTags];
                if (this.convertId) this._saveRemote();
            }
            return newTags.length;
        },
        async _readFile(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = () => reject(new Error('File read error'));
                reader.readAsText(file);
            });
        },
        // --- "Find tags in JSON" for create forms ---
        async scanFromInput() {
            let content = '';
            // 1. Try textarea
            if (this.jsonTextareaId) {
                const ta = document.getElementById(this.jsonTextareaId);
                if (ta && ta.value.trim()) content = ta.value.trim();
            }
            // 2. Try file input
            if (!content && this.jsonFileInputId) {
                const fi = document.getElementById(this.jsonFileInputId);
                if (fi && fi.files && fi.files[0]) {
                    try {
                        content = await this._readFile(fi.files[0]);
                    } catch {
                        this._setScanMessage('Could not read the file.', true);
                        return;
                    }
                }
            }
            if (!content) {
                this._setScanMessage('No JSON found — paste content or upload a file first.', true);
                return;
            }
            this.scanning = true;
            try {
                const res = await fetch('/tags/extract_from_json', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ content }),
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    this._setScanMessage(data.message || 'Server error.', true);
                    return;
                }
                const added = this._mergeTags(data.list);
                if (added > 0)
                    this._setScanMessage(`${added} tag${added > 1 ? 's' : ''} found and added.`);
                else if (data.found_names > 0)
                    this._setScanMessage('Tags found in JSON but none match your available tags.');
                else
                    this._setScanMessage('No tags found in this JSON.');
            } catch (e) {
                console.error('TagInput: scan error', e);
                this._setScanMessage('Error contacting server.', true);
            } finally {
                this.scanning = false;
            }
        },
        // --- "Re-scan stored JSON" for edit page ---
        async scanFromConvert() {
            this.scanning = true;
            try {
                const res = await fetch(`/tags/extract_from_convert/${this.convertId}`);
                const data = await res.json();
                if (!res.ok || !data.success) {
                    this._setScanMessage(data.message || 'Server error.', true);
                    return;
                }
                const added = this._mergeTags(data.list);
                if (added > 0)
                    this._setScanMessage(`${added} tag${added > 1 ? 's' : ''} found and added.`);
                else if (data.found_names > 0)
                    this._setScanMessage('Tags found in JSON but none match your available tags.');
                else
                    this._setScanMessage('No tags found in the stored JSON.');
            } catch (e) {
                console.error('TagInput: scan convert error', e);
                this._setScanMessage('Error contacting server.', true);
            } finally {
                this.scanning = false;
            }
        },
    },
    template: `
        <div class="tag-input-wrapper">
            <div class="d-flex align-items-center gap-2 mb-2">
                <span class="form-label mb-0" style="font-size:0.83rem; font-weight:600; color:var(--text-2);">
                    <i class="fas fa-tags me-1"></i> Tags
                </span>
                <span v-if="saving" style="font-size:0.75rem; color:var(--text-3);">
                    <i class="fas fa-spinner fa-spin me-1"></i>Saving…
                </span>
            </div>

            <!-- Selected chips -->
            <div v-if="loadingCurrent" style="font-size:0.82rem; color:var(--text-3); font-style:italic;">
                <i class="fas fa-spinner fa-spin me-1"></i>Loading…
            </div>
            <template v-else>
                <div v-if="selectedTags.length > 0">
                    <div class="d-flex flex-wrap gap-2 mb-1">
                        <div v-for="tag in visibleSelected" :key="tag.id"
                             class="d-inline-flex align-items-center"
                             style="gap:2px;">
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
                <div v-else class="mb-2" style="font-size:0.82rem; color:var(--text-3); font-style:italic;">
                    No tags assigned.
                </div>

                <!-- Scan buttons row -->
                <div v-if="showScanFromInput || showScanFromConvert" class="mb-2 d-flex align-items-center gap-2">
                    <button v-if="showScanFromInput"
                        type="button"
                        @click.prevent="scanFromInput"
                        :disabled="scanning"
                        class="btn btn-sm"
                        style="font-size:0.78rem; padding:3px 10px; background:var(--surface); border:1px solid var(--border); color:var(--text-2); border-radius:var(--radius-sm); white-space:nowrap;">
                        <i v-if="scanning" class="fas fa-spinner fa-spin me-1"></i>
                        <i v-else class="fas fa-magnifying-glass-plus me-1"></i>
                        Find tags in JSON
                    </button>
                    <button v-if="showScanFromConvert"
                        type="button"
                        @click.prevent="scanFromConvert"
                        :disabled="scanning"
                        class="btn btn-sm"
                        style="font-size:0.78rem; padding:3px 10px; background:var(--surface); border:1px solid var(--border); color:var(--text-2); border-radius:var(--radius-sm); white-space:nowrap;">
                        <i v-if="scanning" class="fas fa-spinner fa-spin me-1"></i>
                        <i v-else class="fas fa-magnifying-glass-plus me-1"></i>
                        Re-scan stored JSON
                    </button>
                    <span v-if="scanMessage"
                          style="font-size:0.78rem;"
                          :style="{ color: scanIsError ? 'var(--danger)' : 'var(--success)' }">
                        <i :class="scanIsError ? 'fas fa-circle-xmark' : 'fas fa-circle-check'" class="me-1"></i>
                        [[ scanMessage ]]
                    </span>
                </div>

                <!-- Source filter pills -->
                <div v-if="canEdit" class="d-flex gap-1 mb-2">
                    <button
                        v-for="f in sourceFilters" :key="f.key"
                        type="button"
                        @click.prevent="setSource(f.key)"
                        class="tag-source-btn"
                        :class="{ active: selectedSource === f.key }">
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
                        <input
                            type="text"
                            class="form-control form-control-sm"
                            v-model="search"
                            @focus="openDropdown"
                            @keydown.escape="dropdownOpen = false; search = ''"
                            placeholder="Search tags…"
                            autocomplete="off"
                            style="background:var(--surface); color:var(--text); border-color:var(--border); font-size:0.82rem;"
                        >
                    </div>

                    <!-- Dropdown -->
                    <div v-if="dropdownOpen"
                         class="tag-input-dropdown"
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
        </div>
    `,
};

export default TagInput;
