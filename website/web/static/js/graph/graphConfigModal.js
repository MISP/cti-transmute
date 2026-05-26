import { GRAPH_CONFIG, applyConfig, reRenderGraph } from './convertGraph.js'

const SHAPES = ['circle', 'square', 'hexagon', 'triangle']

function _snapshot() {
    return {
        maxNodes: GRAPH_CONFIG.maxNodes,
        defaultSide: GRAPH_CONFIG.defaultSide,
        groupingThreshold: GRAPH_CONFIG.groupingThreshold,
        layout: { ...GRAPH_CONFIG.layout },
        pivotickUI: { mode: GRAPH_CONFIG.pivotickUI.mode, sidebar: { ...GRAPH_CONFIG.pivotickUI.sidebar } },
        stixStyles: Object.fromEntries(Object.entries(GRAPH_CONFIG.stixStyles).map(([k, v]) => [k, { ...v }])),
        mispStyles: Object.fromEntries(Object.entries(GRAPH_CONFIG.mispStyles).map(([k, v]) => [k, { ...v }])),
        mispNetworkTypes: [...GRAPH_CONFIG.mispNetworkTypes],
        mispPayloadTypes: [...GRAPH_CONFIG.mispPayloadTypes],
    }
}

const _DEFAULT = _snapshot()

// ── Style row builders ────────────────────────────────────────────────────────

function _makeStyleControls(type, style, group) {
    const colorInput = document.createElement('input')
    colorInput.type = 'color'
    colorInput.value = style.color || '#64748b'
    colorInput.dataset.styleGroup = group
    colorInput.dataset.styleType = type
    colorInput.dataset.styleProp = 'color'
    colorInput.style.cssText = 'width:34px;height:26px;padding:1px 2px;border:1px solid var(--border);border-radius:4px;cursor:pointer;background:none;flex-shrink:0;'

    const shapeSelect = document.createElement('select')
    shapeSelect.className = 'form-select form-select-sm'
    shapeSelect.style.cssText = 'width:105px;flex-shrink:0;font-size:0.78rem;'
    shapeSelect.dataset.styleGroup = group
    shapeSelect.dataset.styleType = type
    shapeSelect.dataset.styleProp = 'shape'
    SHAPES.forEach(s => {
        const opt = document.createElement('option')
        opt.value = s; opt.textContent = s
        if (s === style.shape) opt.selected = true
        shapeSelect.appendChild(opt)
    })

    const sizeInput = document.createElement('input')
    sizeInput.type = 'number'
    sizeInput.className = 'form-control form-control-sm'
    sizeInput.style.cssText = 'width:64px;flex-shrink:0;font-size:0.78rem;'
    sizeInput.min = 6; sizeInput.max = 50
    sizeInput.value = style.size ?? 13
    sizeInput.dataset.styleGroup = group
    sizeInput.dataset.styleType = type
    sizeInput.dataset.styleProp = 'size'

    const pxLbl = document.createElement('span')
    pxLbl.style.cssText = 'font-size:0.72rem;color:var(--text-3);flex-shrink:0;'
    pxLbl.textContent = 'px'

    return [colorInput, shapeSelect, sizeInput, pxLbl]
}

function _makeStyleRow(type, style, group) {
    const row = document.createElement('div')
    row.className = 'd-flex align-items-center gap-2 py-1'
    row.style.cssText = 'border-bottom:1px solid var(--border);'
    const lbl = document.createElement('span')
    lbl.style.cssText = 'width:145px;flex-shrink:0;font-family:var(--font-mono);font-size:0.75rem;color:var(--text-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'
    lbl.title = type; lbl.textContent = type
    row.append(lbl, ..._makeStyleControls(type, style, group))
    return row
}

function _makeNewStyleRow(group) {
    const row = document.createElement('div')
    row.className = 'd-flex align-items-center gap-2 py-1'
    row.style.cssText = 'border-bottom:1px solid var(--border);'
    const nameInput = document.createElement('input')
    nameInput.type = 'text'
    nameInput.placeholder = 'type name…'
    nameInput.className = 'form-control form-control-sm'
    nameInput.style.cssText = 'width:145px;flex-shrink:0;font-family:var(--font-mono);font-size:0.75rem;'
    const controls = _makeStyleControls('_new', { color: '#64748b', shape: 'circle', size: 13 }, group)
    nameInput.addEventListener('input', () => {
        const v = nameInput.value.trim() || '_new'
        controls.forEach(el => { if (el.dataset?.styleType !== undefined) el.dataset.styleType = v })
    })
    const del = document.createElement('button')
    del.type = 'button'
    del.className = 'btn btn-sm btn-outline-danger'
    del.style.cssText = 'padding:1px 7px;font-size:0.72rem;flex-shrink:0;margin-left:auto;'
    del.innerHTML = '<i class="fas fa-xmark"></i>'
    del.addEventListener('click', () => row.remove())
    row.append(nameInput, ...controls, del)
    return row
}

// ── Serialization ─────────────────────────────────────────────────────────────

function _formToPatch() {
    const sidebar = document.getElementById('gcm-pvtSidebar').value
    const patch = {
        maxNodes: parseInt(document.getElementById('gcm-maxNodes').value) || 9000,
        defaultSide: document.getElementById('gcm-defaultSide').value,
        groupingThreshold: parseInt(document.getElementById('gcm-groupingThreshold').value) || 3,
        layout: { type: document.getElementById('gcm-layout').value },
        pivotickUI: {
            mode: document.getElementById('gcm-pvtMode').value,
            sidebar: { collapsed: sidebar === 'auto' ? 'auto' : sidebar === 'true' },
        },
        stixStyles: {},
        mispStyles: {},
        mispNetworkTypes: document.getElementById('gcm-networkTypes').value.split(',').map(s => s.trim()).filter(Boolean),
        mispPayloadTypes: document.getElementById('gcm-payloadTypes').value.split(',').map(s => s.trim()).filter(Boolean),
    }
    document.querySelectorAll('#graph-config-modal [data-style-type]').forEach(el => {
        const type = el.dataset.styleType
        if (!type || type === '_new') return
        const group = el.dataset.styleGroup
        const prop = el.dataset.styleProp
        const target = group === 'stix' ? patch.stixStyles : patch.mispStyles
        if (!target[type]) target[type] = {}
        target[type][prop] = prop === 'size' ? (parseInt(el.value) || 13) : el.value
    })
    return patch
}

function _csrf() {
    return document.getElementById('csrf_token')?.value || ''
}

// ── Modal HTML ────────────────────────────────────────────────────────────────

function _buildModal() {
    const el = document.createElement('div')
    el.className = 'modal fade'
    el.id = 'graph-config-modal'
    el.tabIndex = -1
    el.innerHTML = `
<div class="modal-dialog modal-lg modal-dialog-scrollable">
  <div class="modal-content" style="background:var(--surface);border:1px solid var(--border);">
    <div class="modal-header" style="border-bottom:1px solid var(--border);">
      <h5 class="modal-title">
        <i class="fas fa-sliders me-2" style="color:var(--accent);"></i>Graph Configuration
      </h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
    </div>
    <div class="modal-body p-0">
      <ul class="nav nav-tabs px-3 pt-2" role="tablist" style="border-bottom:1px solid var(--border);margin-bottom:0;">
        <li class="nav-item">
          <button class="nav-link active" id="gcm-tab-form-btn" data-bs-toggle="tab"
            data-bs-target="#gcm-form" type="button" role="tab">
            <i class="fas fa-sliders me-1"></i>Form
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" id="gcm-tab-json-btn" data-bs-toggle="tab"
            data-bs-target="#gcm-json" type="button" role="tab">
            <i class="fas fa-code me-1"></i>JSON
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" id="gcm-tab-saved-btn" data-bs-toggle="tab"
            data-bs-target="#gcm-saved" type="button" role="tab">
            <i class="fas fa-bookmark me-1"></i>Saved
          </button>
        </li>
      </ul>
      <div class="tab-content">

        <!-- Form tab -->
        <div class="tab-pane fade show active p-3" id="gcm-form" role="tabpanel">
          <p class="gcm-section-label">General</p>
          <div class="row g-2 mb-3">
            <div class="col-sm-4">
              <label class="form-label gcm-field-label">Max nodes</label>
              <input type="number" class="form-control form-control-sm" id="gcm-maxNodes" min="10" max="50000">
            </div>
            <div class="col-sm-4">
              <label class="form-label gcm-field-label">Default side</label>
              <select class="form-select form-select-sm" id="gcm-defaultSide">
                <option value="input">Input</option>
                <option value="output">Output</option>
              </select>
            </div>
            <div class="col-sm-4">
              <label class="form-label gcm-field-label">Grouping threshold</label>
              <input type="number" class="form-control form-control-sm" id="gcm-groupingThreshold" min="2" max="50">
            </div>
            <div class="col-sm-4">
              <label class="form-label gcm-field-label">Layout</label>
              <select class="form-select form-select-sm" id="gcm-layout">
                <option value="force">Force</option>
                <option value="tree">Tree</option>
                <option value="radial">Radial</option>
                <option value="grid">Grid</option>
              </select>
            </div>
            <div class="col-sm-4">
              <label class="form-label gcm-field-label">UI mode</label>
              <select class="form-select form-select-sm" id="gcm-pvtMode">
                <option value="full">Full</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <div class="col-sm-4">
              <label class="form-label gcm-field-label">Sidebar</label>
              <select class="form-select form-select-sm" id="gcm-pvtSidebar">
                <option value="auto">Auto</option>
                <option value="true">Collapsed</option>
                <option value="false">Expanded</option>
              </select>
            </div>
          </div>
          <details class="mb-3">
            <summary class="gcm-section-label" style="cursor:pointer;user-select:none;padding:4px 0;">STIX node styles</summary>
            <div id="gcm-stix-styles" style="margin-top:0.4rem;"></div>
            <button type="button" class="btn btn-sm btn-outline-secondary mt-2" id="gcm-add-stix">
              <i class="fas fa-plus me-1"></i>Add type
            </button>
          </details>
          <details class="mb-3">
            <summary class="gcm-section-label" style="cursor:pointer;user-select:none;padding:4px 0;">MISP node styles</summary>
            <div id="gcm-misp-styles" style="margin-top:0.4rem;"></div>
            <button type="button" class="btn btn-sm btn-outline-secondary mt-2" id="gcm-add-misp">
              <i class="fas fa-plus me-1"></i>Add type
            </button>
          </details>
          <details>
            <summary class="gcm-section-label" style="cursor:pointer;user-select:none;padding:4px 0;">MISP attribute type families</summary>
            <div class="row g-2 mt-1">
              <div class="col-sm-6">
                <label class="form-label gcm-field-label">Network types <small style="color:var(--text-3);font-weight:400;">(comma-separated)</small></label>
                <textarea class="form-control form-control-sm" id="gcm-networkTypes" rows="3" style="font-family:var(--font-mono);font-size:0.72rem;resize:vertical;"></textarea>
              </div>
              <div class="col-sm-6">
                <label class="form-label gcm-field-label">Payload types <small style="color:var(--text-3);font-weight:400;">(comma-separated)</small></label>
                <textarea class="form-control form-control-sm" id="gcm-payloadTypes" rows="3" style="font-family:var(--font-mono);font-size:0.72rem;resize:vertical;"></textarea>
              </div>
            </div>
          </details>
        </div>

        <!-- JSON tab -->
        <div class="tab-pane fade p-3" id="gcm-json" role="tabpanel">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <small style="color:var(--text-3);">Live view — syncs from Form each time you open this tab.<br>You can also edit directly; Apply uses whichever tab is active.</small>
            <button type="button" class="btn btn-sm btn-outline-secondary" id="gcm-format-json">
              <i class="fas fa-align-left me-1"></i>Format
            </button>
          </div>
          <textarea class="form-control" id="gcm-json-editor" rows="24" style="font-family:var(--font-mono);font-size:0.75rem;resize:vertical;"></textarea>
          <div id="gcm-json-error" style="color:#ef4444;font-size:0.78rem;margin-top:0.35rem;display:none;"></div>
        </div>

        <!-- Saved tab -->
        <div class="tab-pane fade p-3" id="gcm-saved" role="tabpanel">
          <div class="d-flex align-items-center gap-2 mb-3 pb-3" style="border-bottom:1px solid var(--border);">
            <input type="text" class="form-control form-control-sm" id="gcm-save-name"
              placeholder="Name for this config…" maxlength="100" style="max-width:280px;">
            <button type="button" class="btn btn-sm btn-outline-primary flex-shrink-0" id="gcm-save-btn">
              <i class="fas fa-floppy-disk me-1"></i>Save current
            </button>
            <div id="gcm-save-error" style="color:#ef4444;font-size:0.78rem;display:none;"></div>
          </div>
          <div id="gcm-saved-list">
            <div class="text-center py-3" style="color:var(--text-3);font-size:0.85rem;">
              <div class="spinner-border spinner-border-sm me-1"></div>Loading…
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Unsaved changes prompt — shown between body and footer when closing dirty -->
    <div id="gcm-unsaved-prompt" style="display:none;padding:10px 16px;background:rgba(234,179,8,0.08);border-top:2px solid rgba(234,179,8,0.4);">
      <div class="d-flex align-items-center gap-2 flex-wrap" style="font-size:0.84rem;">
        <i class="fas fa-triangle-exclamation me-1" style="color:#eab308;"></i>
        <span style="color:var(--text);">Unsaved changes — save this config before closing?</span>
        <div class="d-flex gap-2 ms-auto">
          <button type="button" class="btn btn-sm btn-outline-secondary" id="gcm-prompt-back">Back</button>
          <button type="button" class="btn btn-sm btn-outline-danger" id="gcm-prompt-discard">Discard &amp; close</button>
          <button type="button" class="btn btn-sm btn-outline-primary" id="gcm-prompt-to-save">Save first</button>
        </div>
      </div>
    </div>

    <div class="modal-footer" style="border-top:1px solid var(--border);">
      <button type="button" class="btn btn-sm btn-outline-secondary me-auto" id="gcm-reset">
        <i class="fas fa-undo me-1"></i>Reset defaults
      </button>
      <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Cancel</button>
      <button type="button" class="btn btn-sm btn-primary" id="gcm-apply">
        <i class="fas fa-check me-1"></i>Apply & Re-render
      </button>
    </div>
  </div>
</div>
<style>
  .gcm-section-label { font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--text-3);margin-bottom:0.6rem; }
  .gcm-field-label   { font-size:0.8rem;margin-bottom:0.3rem; }
  .gcm-config-row    { display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0;border-bottom:1px solid var(--border);font-size:0.82rem; }
  .gcm-config-row:last-child { border-bottom:none; }
  .gcm-config-name   { flex:1;font-weight:500;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
  .gcm-config-meta   { flex-shrink:0;font-size:0.72rem;color:var(--text-3); }
  .gcm-badge-system  { font-size:0.65rem;padding:1px 6px;border-radius:10px;background:var(--surface-2);color:var(--text-3);flex-shrink:0; }
</style>`
    document.body.appendChild(el)
    return el
}

// ── Saved tab ─────────────────────────────────────────────────────────────────

async function _loadSavedConfigs() {
    const container = document.getElementById('gcm-saved-list')
    container.innerHTML = '<div class="text-center py-3" style="color:var(--text-3);font-size:0.85rem;"><div class="spinner-border spinner-border-sm me-1"></div>Loading…</div>'
    try {
        const res = await fetch('/convert/graph_config/list')
        if (!res.ok) {
            const msg = res.status === 500
                ? 'Server error — run <code>flask db upgrade</code> to create the table.'
                : `HTTP ${res.status}`
            container.innerHTML = `<div style="color:#ef4444;font-size:0.82rem;padding:0.5rem 0;">${msg}</div>`
            return
        }
        const data = await res.json()
        if (!data.success) throw new Error(data.message)
        _renderSavedList(data.list)
    } catch (e) {
        container.innerHTML = `<div style="color:#ef4444;font-size:0.82rem;padding:0.5rem 0;">${e.message}</div>`
    }
}

function _renderSavedList(list) {
    const container = document.getElementById('gcm-saved-list')
    if (!list.length) {
        container.innerHTML = '<p style="color:var(--text-3);font-size:0.82rem;text-align:center;padding:1.5rem 0;">No saved configs yet.</p>'
        return
    }
    container.innerHTML = ''
    list.forEach(cfg => {
        const row = document.createElement('div')
        row.className = 'gcm-config-row'

        const name = document.createElement('span')
        name.className = 'gcm-config-name'
        name.title = cfg.name
        name.textContent = cfg.name

        row.appendChild(name)

        if (cfg.is_default) {
            const badge = document.createElement('span')
            badge.className = 'gcm-badge-system'
            badge.textContent = 'system'
            row.appendChild(badge)
        }

        const meta = document.createElement('span')
        meta.className = 'gcm-config-meta'
        meta.textContent = (cfg.is_default ? '' : cfg.author + ' · ') + (cfg.created_at || '')
        row.appendChild(meta)

        const loadBtn = document.createElement('button')
        loadBtn.type = 'button'
        loadBtn.className = 'btn btn-sm btn-outline-secondary flex-shrink-0'
        loadBtn.style.cssText = 'font-size:0.75rem;padding:2px 8px;'
        loadBtn.innerHTML = '<i class="fas fa-arrow-down-to-line me-1"></i>Load'
        loadBtn.addEventListener('click', () => _loadConfig(cfg))
        row.appendChild(loadBtn)

        if (cfg.can_delete) {
            const delBtn = document.createElement('button')
            delBtn.type = 'button'
            delBtn.className = 'btn btn-sm btn-outline-danger flex-shrink-0'
            delBtn.style.cssText = 'font-size:0.75rem;padding:2px 8px;'
            delBtn.innerHTML = cfg.can_hard_delete
                ? '<i class="fas fa-trash"></i>'
                : '<i class="fas fa-eye-slash"></i>'
            delBtn.title = cfg.can_hard_delete ? 'Hard delete' : 'Deactivate'
            delBtn.addEventListener('click', () => _deleteConfig(cfg.id, delBtn))
            row.appendChild(delBtn)
        }

        container.appendChild(row)
    })
}

function _loadConfig(cfg) {
    try {
        const patch = JSON.parse(cfg.config_json)
        applyConfig(patch)
        _dirty = false
        _populateForm()
        bootstrap.Tab.getOrCreateInstance(document.getElementById('gcm-tab-form-btn')).show()
    } catch (e) {
        console.error('Could not load config:', e)
    }
}

async function _deleteConfig(id, btn) {
    const orig = btn.innerHTML
    btn.disabled = true
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
    try {
        const res = await fetch('/convert/graph_config/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': _csrf() },
            body: JSON.stringify({ id }),
        })
        const data = await res.json()
        if (data.success) {
            await _loadSavedConfigs()
        } else {
            btn.disabled = false
            btn.innerHTML = orig
        }
    } catch {
        btn.disabled = false
        btn.innerHTML = orig
    }
}

async function _saveCurrentConfig() {
    const name = document.getElementById('gcm-save-name').value.trim()
    const errEl = document.getElementById('gcm-save-error')
    if (!name) {
        errEl.textContent = 'Name required'
        errEl.style.display = 'inline'
        return
    }
    errEl.style.display = 'none'
    const saveBtn = document.getElementById('gcm-save-btn')
    const orig = saveBtn.innerHTML
    saveBtn.disabled = true
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Saving…'
    try {
        const res = await fetch('/convert/graph_config/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': _csrf() },
            body: JSON.stringify({ name, config_json: JSON.stringify(_formToPatch()) }),
        })
        const data = await res.json()
        if (data.success) {
            document.getElementById('gcm-save-name').value = ''
            _dirty = false
            await _loadSavedConfigs()
            saveBtn.innerHTML = '<i class="fas fa-check me-1"></i>Saved!'
            setTimeout(() => { saveBtn.innerHTML = orig; saveBtn.disabled = false }, 1500)
        } else {
            errEl.textContent = data.message
            errEl.style.display = 'inline'
            saveBtn.innerHTML = orig
            saveBtn.disabled = false
        }
    } catch {
        saveBtn.innerHTML = orig
        saveBtn.disabled = false
    }
}

// ── Form populate ─────────────────────────────────────────────────────────────

function _populateForm() {
    document.getElementById('gcm-maxNodes').value = GRAPH_CONFIG.maxNodes
    document.getElementById('gcm-defaultSide').value = GRAPH_CONFIG.defaultSide
    document.getElementById('gcm-groupingThreshold').value = GRAPH_CONFIG.groupingThreshold
    document.getElementById('gcm-layout').value = GRAPH_CONFIG.layout.type
    document.getElementById('gcm-pvtMode').value = GRAPH_CONFIG.pivotickUI.mode
    document.getElementById('gcm-pvtSidebar').value = String(GRAPH_CONFIG.pivotickUI.sidebar.collapsed)
    const stixEl = document.getElementById('gcm-stix-styles')
    const mispEl = document.getElementById('gcm-misp-styles')
    stixEl.innerHTML = ''; mispEl.innerHTML = ''
    Object.entries(GRAPH_CONFIG.stixStyles).forEach(([t, s]) => stixEl.appendChild(_makeStyleRow(t, s, 'stix')))
    Object.entries(GRAPH_CONFIG.mispStyles).forEach(([t, s]) => mispEl.appendChild(_makeStyleRow(t, s, 'misp')))
    document.getElementById('gcm-networkTypes').value = [...GRAPH_CONFIG.mispNetworkTypes].join(', ')
    document.getElementById('gcm-payloadTypes').value = [...GRAPH_CONFIG.mispPayloadTypes].join(', ')
}

function _syncJsonFromForm() {
    document.getElementById('gcm-json-editor').value = JSON.stringify(_formToPatch(), null, 2)
    document.getElementById('gcm-json-error').style.display = 'none'
}

// ── Dirty tracking ────────────────────────────────────────────────────────────

let _dirty = false
let _skipDirtyCheck = false

function _hideUnsavedPrompt() {
    document.getElementById('gcm-unsaved-prompt').style.display = 'none'
}

function _showUnsavedPrompt() {
    document.getElementById('gcm-unsaved-prompt').style.display = 'block'
    document.getElementById('gcm-prompt-back').onclick = _hideUnsavedPrompt
    document.getElementById('gcm-prompt-discard').onclick = () => {
        _skipDirtyCheck = true
        _dirty = false
        _hideUnsavedPrompt()
        _bsModal.hide()
    }
    document.getElementById('gcm-prompt-to-save').onclick = () => {
        _hideUnsavedPrompt()
        bootstrap.Tab.getOrCreateInstance(document.getElementById('gcm-tab-saved-btn')).show()
        setTimeout(() => document.getElementById('gcm-save-name').focus(), 120)
    }
}

// ── Module state ──────────────────────────────────────────────────────────────

let _modalEl = null
let _bsModal = null

export function openGraphConfigModal() {
    if (!_modalEl) {
        _modalEl = _buildModal()

        // Mark dirty on any user interaction inside the modal
        _modalEl.addEventListener('input', () => { _dirty = true }, true)
        _modalEl.addEventListener('change', () => { _dirty = true }, true)

        // Intercept close when dirty
        _modalEl.addEventListener('hide.bs.modal', e => {
            if (_dirty && !_skipDirtyCheck) {
                e.preventDefault()
                _showUnsavedPrompt()
            }
            _skipDirtyCheck = false
        })

        // Hide unsaved prompt whenever a tab changes (user navigated away from it)
        _modalEl.addEventListener('shown.bs.tab', _hideUnsavedPrompt)

        document.getElementById('gcm-tab-json-btn').addEventListener('shown.bs.tab', _syncJsonFromForm)
        document.getElementById('gcm-tab-saved-btn').addEventListener('shown.bs.tab', _loadSavedConfigs)

        document.getElementById('gcm-add-stix').addEventListener('click', () => {
            document.getElementById('gcm-stix-styles').appendChild(_makeNewStyleRow('stix'))
        })
        document.getElementById('gcm-add-misp').addEventListener('click', () => {
            document.getElementById('gcm-misp-styles').appendChild(_makeNewStyleRow('misp'))
        })

        document.getElementById('gcm-save-btn').addEventListener('click', _saveCurrentConfig)

        document.getElementById('gcm-apply').addEventListener('click', () => {
            const isJsonTab = document.getElementById('gcm-tab-json-btn').classList.contains('active')
            if (isJsonTab) {
                const errEl = document.getElementById('gcm-json-error')
                try {
                    const patch = JSON.parse(document.getElementById('gcm-json-editor').value)
                    errEl.style.display = 'none'
                    applyConfig(patch)
                } catch (e) {
                    errEl.textContent = 'Invalid JSON: ' + e.message
                    errEl.style.display = 'block'
                    return
                }
            } else {
                applyConfig(_formToPatch())
            }
            _dirty = false
            reRenderGraph()
            _skipDirtyCheck = true
            _bsModal.hide()
        })

        document.getElementById('gcm-reset').addEventListener('click', () => {
            applyConfig(_DEFAULT)
            _dirty = false
            _populateForm()
        })

        document.getElementById('gcm-format-json').addEventListener('click', () => {
            const ta = document.getElementById('gcm-json-editor')
            const errEl = document.getElementById('gcm-json-error')
            try {
                ta.value = JSON.stringify(JSON.parse(ta.value), null, 2)
                errEl.style.display = 'none'
            } catch (e) {
                errEl.textContent = 'Invalid JSON: ' + e.message
                errEl.style.display = 'block'
            }
        })

        _bsModal = new bootstrap.Modal(_modalEl)
    }

    _dirty = false
    _hideUnsavedPrompt()
    _populateForm()
    bootstrap.Tab.getOrCreateInstance(document.getElementById('gcm-tab-form-btn')).show()
    _bsModal.show()
}
