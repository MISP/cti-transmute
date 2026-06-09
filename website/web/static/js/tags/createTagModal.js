import { nameToColor, getTextColor, mapIcon } from './utils/galaxie.js';
import SingleTagDisplay from './singleTagDisplay.js';

/* ── FA icon cache (shared across all instances) ──────────────── */
const FA_FEATURED = [
    'tag','tags','shield','shield-halved','shield-virus','shield-check','bug','fire','bolt','skull',
    'skull-crossbones','virus','lock','lock-open','key','fingerprint','eye','eye-slash','biohazard',
    'radiation','bomb','crosshairs','bullseye','magnifying-glass','magnifying-glass-chart','satellite',
    'globe','server','database','microchip','memory','network-wired','code','terminal','file-code',
    'file-shield','user-secret','id-card','flag','bell','star','bookmark','triangle-exclamation',
    'circle-exclamation','circle-xmark','circle-check','circle-info','robot','gears','wrench',
    'cloud','wifi','tower-broadcast','hard-drive','usb','earth-americas','sitemap','layer-group',
    'user','users','building','landmark','scroll','chart-bar','chart-line','link','map-pin','clock',
];
let _faIconsCache = null;
async function loadFaIcons() {
    if (_faIconsCache) return _faIconsCache;
    try {
        const r = await fetch('/tags/fa-icons');
        if (r.ok) _faIconsCache = (await r.json()).icons || [];
    } catch {}
    return _faIconsCache || FA_FEATURED;
}

/* ── Vulnerability types ──────────────────────────────────────── */
const VULN_PATTERN = /^(CVE[-\s]\d{4}[-\s]\d{4,7}|GCVE-\d+-\d{4}-\d+|GHSA-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}|PYSEC-\d{4}-\d{2,5}|GSD-\d{4}-\d{4,5}|wid-sec-w-\d{4}-\d{4}|cisco-sa-\d{8}-[a-zA-Z0-9]+|RHSA-\d{4}:\d{4}|msrc_CVE-\d{4}-\d{4,}|CERTFR-\d{4}-[A-Z]{3}-\d{3})$/i;

const VULN_TYPES = [
    { name: 'CVE',    prefix: 'CVE-',      example: 'CVE-2024-12345',        icon: 'fas fa-shield-halved', color: '#dc2626' },
    { name: 'GHSA',   prefix: 'GHSA-',     example: 'GHSA-xxxx-xxxx-xxxx',   icon: 'fas fa-bug',           color: '#d97706' },
    { name: 'PYSEC',  prefix: 'PYSEC-',    example: 'PYSEC-2024-12345',      icon: 'fas fa-code',          color: '#0891b2' },
    { name: 'GSD',    prefix: 'GSD-',      example: 'GSD-2024-12345',        icon: 'fas fa-database',      color: '#64748b' },
    { name: 'GCVE',   prefix: 'GCVE-',     example: 'GCVE-0-2024-12345',     icon: 'fas fa-globe',         color: '#2563eb' },
    { name: 'RHSA',   prefix: 'RHSA-',     example: 'RHSA-2024:1234',        icon: 'fas fa-lock',          color: '#b91c1c' },
    { name: 'CERTFR', prefix: 'CERTFR-',   example: 'CERTFR-2024-AVI-001',   icon: 'fas fa-flag',          color: '#15803d' },
    { name: 'Cisco',  prefix: 'cisco-sa-', example: 'cisco-sa-20241001-xxx', icon: 'fas fa-network-wired', color: '#1e293b' },
    { name: 'MSRC',   prefix: 'msrc_CVE-', example: 'msrc_CVE-2024-12345',   icon: 'fas fa-shield-virus',  color: '#7c3aed' },
];

/**
 * CreateTagModal
 * Self-contained Bootstrap modal for creating Custom or Vulnerability tags.
 * Emits 'created'(tag) on success. Call openModal() via $refs to show.
 */
const CreateTagModal = {
    components: { 'single-tag': SingleTagDisplay },
    emits: ['created'],
    props: {
        isAdmin: { type: Boolean, default: false },
    },
    delimiters: ['[[', ']]'],
    data() {
        return {
            tab: 'custom',
            // custom form
            name: '', description: '', color: '#6366f1', icon: '',
            errors: {},
            // vuln form
            vulnFormat:   VULN_TYPES[0],
            vulnRaw:      VULN_TYPES[0].prefix,
            vulnQueue:    [],
            // icon picker
            faIcons:      FA_FEATURED,
            iconOpen:     false,
            iconSearch:   '',
            // state
            saving:       false,
            vulnTypes:    VULN_TYPES,
            _modal:       null,
            _onDocClick:  null,
        };
    },
    computed: {
        filteredIcons() {
            const q   = this.iconSearch.toLowerCase().trim();
            const all = this.faIcons;
            if (!q) return [...new Set([...FA_FEATURED, ...all])].slice(0, 180);
            return all.filter(ic => ic.includes(q)).slice(0, 200);
        },
        vulnValid() {
            return VULN_PATTERN.test(this.vulnRaw.trim());
        },
        previewTag() {
            if (this.tab === 'vuln') {
                const first = this.vulnQueue[0] || this.vulnRaw.trim() || this.vulnFormat.example;
                return { name: first, color: this.vulnFormat.color, icon: this.vulnFormat.icon.replace('fas fa-','') };
            }
            return { name: this.name || 'tag name', color: this.color, icon: this.icon };
        },
        vulnHint() {
            const raw = this.vulnRaw.trim();
            if (raw.length > 2 && !this.vulnValid) return { cls: 'text-danger', icon: 'fa-times-circle', msg: `Invalid format for ${this.vulnFormat.name}` };
            if (this.vulnValid)                     return { cls: 'text-success', icon: 'fa-check-circle', msg: 'Valid format' };
            return { cls: 'text-muted', icon: '', msg: `Example: ${this.vulnFormat.example}` };
        },
    },
    methods: {
        csrf() { return document.getElementById('csrf_token')?.value || ''; },

        openModal() {
            this.reset();
            this._modal?.show();
        },

        reset() {
            this.tab = 'custom';
            this.name = ''; this.description = ''; this.color = '#6366f1'; this.icon = '';
            this.errors = {};
            this.vulnFormat = VULN_TYPES[0];
            this.vulnRaw = VULN_TYPES[0].prefix;
            this.vulnQueue = [];
            this.iconOpen = false; this.iconSearch = '';
            this.saving = false;
        },

        setVulnFormat(vt) {
            this.vulnFormat = vt;
            this.vulnRaw = vt.prefix;
            this.$nextTick(() => this.$refs.vulnInput?.focus());
        },

        addVulnId() {
            const val = this.vulnRaw.trim().toUpperCase();
            if (!this.vulnValid) return;
            if (!this.vulnQueue.includes(val)) this.vulnQueue.push(val);
            this.vulnRaw = this.vulnFormat.prefix;
            this.$nextTick(() => this.$refs.vulnInput?.focus());
        },

        removeVulnId(i) { this.vulnQueue.splice(i, 1); },

        async submitCreate() {
            this.errors = {};
            if (this.tab === 'custom') {
                if (!this.name.trim()) { this.errors = { name: 'Name is required' }; return; }
                if (this.color && !/^#[0-9a-fA-F]{6}$/.test(this.color)) { this.errors = { color: 'Invalid hex color' }; return; }
                this.saving = true;
                const res = await fetch('/tags/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': this.csrf() },
                    body: JSON.stringify({ name: this.name.trim(), source: 'Manual', description: this.description, color: this.color, icon: this.icon }),
                });
                const data = await res.json();
                this.$emit('toast', data.message, data.toast_class);
                if (data.success) { this._modal?.hide(); this.$emit('created', data.tag); }
                else if (res.status === 409) this.errors = { name: 'A tag with this name already exists' };
                this.saving = false;
            } else {
                const ids = this.vulnQueue.length ? this.vulnQueue : (this.vulnValid ? [this.vulnRaw.trim().toUpperCase()] : null);
                if (!ids?.length) { this.errors = { vuln: 'Add at least one valid vulnerability ID' }; return; }
                this.saving = true;
                let ok = 0, failed = [];
                for (const id of ids) {
                    const res = await fetch('/tags/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': this.csrf() },
                        body: JSON.stringify({ name: id, source: 'Vulnerability', description: this.description, color: this.vulnFormat.color, icon: this.vulnFormat.icon.replace('fas fa-','') }),
                    });
                    const data = await res.json();
                    if (data.success) { ok++; this.$emit('created', data.tag); }
                    else failed.push(id);
                }
                if (ok)           this.$emit('toast', `${ok} tag(s) created`, 'success');
                if (failed.length) this.$emit('toast', `Failed: ${failed.join(', ')}`, 'warning');
                if (ok) this._modal?.hide();
                this.saving = false;
            }
        },
    },
    mounted() {
        const modalEl = this.$el?.id === 'createTagModal' ? this.$el : this.$el?.querySelector?.('#createTagModal') || document.getElementById('createTagModal');
        if (modalEl) this._modal = new bootstrap.Modal(modalEl);
        loadFaIcons().then(icons => { if (icons.length) this.faIcons = icons; });
        this._onDocClick = e => {
            if (!e.target.closest('.icon-picker')) this.iconOpen = false;
        };
        document.addEventListener('click', this._onDocClick);
    },
    beforeUnmount() {
        document.removeEventListener('click', this._onDocClick);
    },

    template: `
<div class="modal fade" id="createTagModal" tabindex="-1">
  <div class="modal-dialog modal-lg">
    <div class="modal-content tag-modal">

      <div class="modal-header">
        <h5 class="modal-title"><i class="fas fa-plus me-2"></i>New Tag</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <div class="modal-body">

        <!-- ── Type selector (input-tab style) ── -->
        <div class="input-tab-header mb-4" style="border-radius:var(--radius-sm);overflow:hidden;border:1px solid var(--border);">
          <button type="button" class="input-tab-btn" :class="{active: tab==='custom'}" @click="tab='custom';errors={}">
            <i class="fas fa-pen me-1"></i>Custom Tag
          </button>
          <button type="button" class="input-tab-btn" :class="{active: tab==='vuln'}" @click="tab='vuln';errors={}">
            <i class="fas fa-shield-halved me-1"></i>Vulnerability
          </button>
        </div>

        <!-- ── Preview ── -->
        <div class="mb-3">
          <label class="tag-modal-label">Preview</label>
          <div class="tag-preview-box">
            <single-tag :tag="previewTag" :show-namespace="false"></single-tag>
          </div>
        </div>

        <!-- ════════ CUSTOM TAB ════════ -->
        <div v-show="tab==='custom'">
          <div class="alert py-2 px-3 mb-3" :class="isAdmin ? 'alert-secondary' : 'alert-warning'" style="font-size:0.82rem;">
            <i class="fas fa-lock me-1"></i>
            <span v-if="isAdmin">Custom tags start as <strong>private</strong> — you can publish them from the tag list.</span>
            <span v-else>Custom tags are <strong>private</strong> and need admin approval before becoming visible.</span>
          </div>

          <div class="row g-3">
            <div class="col-12">
              <label class="tag-modal-label">Name <span class="text-danger">*</span></label>
              <input type="text" class="form-control tag-modal-input" v-model="name"
                placeholder="namespace:predicate or free label…"
                :class="{'is-invalid': errors.name}" @blur="name=name.trim()">
              <div class="invalid-feedback">[[ errors.name ]]</div>
            </div>

            <div class="col-12">
              <label class="tag-modal-label">Description</label>
              <textarea class="form-control tag-modal-input" rows="2" v-model="description" placeholder="Optional…"></textarea>
            </div>

            <!-- Color -->
            <div class="col-md-6">
              <label class="tag-modal-label">Color</label>
              <div class="d-flex gap-2 align-items-center">
                <input type="color" class="form-control form-control-color flex-shrink-0" v-model="color"
                  style="width:40px;height:36px;padding:2px;border-radius:var(--radius-sm);">
                <input type="text" class="form-control tag-modal-input" v-model="color" placeholder="#6366f1"
                  :class="{'is-invalid': errors.color}">
                <div class="invalid-feedback">[[ errors.color ]]</div>
              </div>
            </div>

            <!-- Icon picker (redesigned) -->
            <div class="col-md-6">
              <label class="tag-modal-label">Icon <small style="color:var(--text-3);">(FontAwesome solid)</small></label>
              <div class="icon-picker">
                <div class="icon-picker-trigger" @click="iconOpen=!iconOpen">
                  <span class="icon-trigger-icon"><i :class="'fas fa-'+(icon||'tag')"></i></span>
                  <span class="icon-trigger-label">[[ icon || 'tag' ]]</span>
                  <i class="fas fa-chevron-down icon-trigger-caret" :class="{open: iconOpen}"></i>
                </div>
                <div v-show="iconOpen" class="icon-picker-panel">
                  <input class="icon-picker-search-input" v-model="iconSearch"
                    :placeholder="'Search ' + (faIcons.length || '…') + ' icons'"
                    @click.stop ref="iconSearchInput">
                  <div class="icon-picker-meta">[[ filteredIcons.length ]] shown / [[ faIcons.length || '?' ]] total</div>
                  <div class="icon-picker-grid-new">
                    <button v-for="ic in filteredIcons" :key="ic" type="button"
                      class="icon-picker-btn" :class="{active: icon===ic}"
                      :title="ic" @click.stop="icon=ic;iconOpen=false;iconSearch=''">
                      <i :class="'fas fa-'+ic"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ════════ VULNERABILITY TAB ════════ -->
        <div v-show="tab==='vuln'">
          <div class="alert py-2 px-3 mb-3" :class="isAdmin ? 'alert-success' : 'alert-warning'" style="font-size:0.82rem;">
            <i class="fas fa-shield-halved me-1"></i>
            <span v-if="isAdmin"><strong>Admin:</strong> Vulnerability tags are automatically <strong>approved &amp; published</strong>.</span>
            <span v-else>Vulnerability tags need <strong>admin approval</strong> before becoming visible.</span>
          </div>

          <!-- Format cards -->
          <label class="tag-modal-label mb-2">Format</label>
          <div class="vuln-format-grid mb-3">
            <button v-for="vt in vulnTypes" :key="vt.name" type="button"
              class="vuln-format-card" :class="{active: vulnFormat.name===vt.name}"
              @click="setVulnFormat(vt)">
              <i :class="vt.icon"></i>[[ vt.name ]]
            </button>
          </div>

          <!-- Input -->
          <label class="tag-modal-label">Identifier <span class="text-danger">*</span></label>
          <div class="input-group mb-1">
            <input type="text" class="form-control tag-modal-input" ref="vulnInput"
              v-model="vulnRaw"
              :placeholder="vulnFormat.example"
              :class="{'is-valid': vulnValid, 'is-invalid': vulnRaw.length > 2 && !vulnValid}"
              @keydown.enter.prevent="addVulnId">
            <button class="btn" :class="vulnValid ? 'btn-success' : 'btn-outline-secondary'"
              type="button" @click="addVulnId" :disabled="!vulnValid">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="mb-3" style="font-size:0.72rem;" :class="vulnHint.cls">
            <i v-if="vulnHint.icon" :class="'fas '+vulnHint.icon+' me-1'"></i>[[ vulnHint.msg ]]
          </div>

          <!-- Queue -->
          <div v-if="vulnQueue.length" class="mb-3">
            <label class="tag-modal-label">Queue — [[ vulnQueue.length ]] to create</label>
            <div class="d-flex flex-wrap gap-2 p-2 rounded" style="background:var(--surface-2);border:1px solid var(--border);">
              <span v-for="(id,i) in vulnQueue" :key="i"
                class="badge d-inline-flex align-items-center gap-1 rounded-pill"
                :style="{background: vulnFormat.color, color:'#fff', fontFamily:'var(--font-mono)'}">
                [[ id ]]
                <button type="button" @click="removeVulnId(i)"
                  style="background:none;border:none;padding:0;color:inherit;opacity:0.7;cursor:pointer;line-height:1;">
                  <i class="fas fa-times"></i>
                </button>
              </span>
            </div>
          </div>

          <div v-if="errors.vuln" class="alert alert-danger py-2 px-3 mb-2" style="font-size:0.82rem;">
            <i class="fas fa-times-circle me-1"></i>[[ errors.vuln ]]
          </div>

          <!-- Optional description -->
          <label class="tag-modal-label">Description <small style="color:var(--text-3);">(applied to all)</small></label>
          <textarea class="form-control tag-modal-input" rows="2" v-model="description" placeholder="Optional…"></textarea>
        </div>

      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary btn-sm" @click="submitCreate" :disabled="saving">
          <span v-if="saving"><i class="fas fa-spinner fa-spin me-1"></i>Creating…</span>
          <span v-else>
            <i class="fas fa-plus me-1"></i>
            <span v-if="tab==='vuln' && vulnQueue.length > 1">Create [[ vulnQueue.length ]] Tags</span>
            <span v-else>Create Tag</span>
          </span>
        </button>
      </div>

    </div>
  </div>
</div>
    `,
};

export default CreateTagModal;
