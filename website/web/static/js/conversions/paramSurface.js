/*
 * ParamSurface — one schema-driven renderer for a Converter's parameters.
 *
 * Given a Converter's published Parameter schema (from GET /api/convert/list),
 * it renders one control per parameter with a type -> widget mapping, so a new
 * Converter's params appear with no per-Converter front-end code. It replaces
 * the per-Converter WTForm fields and the triplicated `distribution` <select>.
 *
 *   oneOf: [{const, title}] -> labelled <select>   (e.g. the distribution levels)
 *   enum                    -> <select>            (e.g. the STIX version)
 *   boolean                 -> switch
 *   integer / number        -> <input type=number>
 *   string                  -> <input type=text>
 *   anyOf [T, null]         -> unwrapped to T      (Pydantic Optional[...])
 *
 * Mounted standalone; the host page reads/writes it through the mount proxy:
 *   const vm = Vue.createApp(ParamSurface, { schema }).mount(el);
 *   vm.collect();               // -> { <param>: <value>, ... } to submit
 *   vm.setErrors({ field: msg }); // highlight server-side {error, fields} 400s
 */

function humanize(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

// The scalar JSON-Schema type for a property, unwrapping Pydantic's
// `anyOf: [{type: T}, {type: "null"}]` for Optional[...] fields.
function scalarType(raw) {
    if (raw.type) return raw.type;
    if (Array.isArray(raw.anyOf)) {
        const branch = raw.anyOf.find((b) => b && b.type && b.type !== 'null');
        if (branch) return branch.type;
    }
    return 'string';
}

// Turn one JSON-Schema property into a field descriptor for the template.
function fieldFor(key, raw) {
    const label = raw.title || humanize(key);
    const description = raw.description || '';
    const def = raw.default;
    let widget = 'text';
    let options = null;

    if (Array.isArray(raw.oneOf)) {
        widget = 'select';
        options = raw.oneOf.map((o) => ({
            value: o.const,
            label: o.title != null ? o.title : String(o.const),
        }));
    } else if (Array.isArray(raw.enum)) {
        widget = 'select';
        options = raw.enum.map((v) => ({ value: v, label: String(v) }));
    } else {
        const type = scalarType(raw);
        if (type === 'boolean') widget = 'switch';
        else if (type === 'integer' || type === 'number') widget = 'number';
        else widget = 'text';
    }
    return {
        key, widget, label, description, options, default: def,
        // Presentation hints, read straight off the schema property:
        fullWidth: !!raw.fullWidth,            // render on its own full-width row
        enabledWhen: raw.enabledWhen || null,  // {field, equals}: grey out unless met
        placeholder: raw.placeholder || '',    // short placeholder (falls back to description)
    };
}

const ParamSurface = {
    delimiters: ['[[', ']]'],
    props: {
        schema: { type: Object, required: true },
        initial: { type: Object, default: () => ({}) },
        idPrefix: { type: String, default: 'ps-' },
    },
    data() {
        return { fields: [], values: {}, errors: {} };
    },
    created() {
        const props = (this.schema && this.schema.properties) || {};
        this.fields = Object.keys(props).map((key) => fieldFor(key, props[key]));
        const values = {};
        for (const f of this.fields) values[f.key] = this._initialValue(f);
        this.values = values;
    },
    methods: {
        _initialValue(f) {
            if (this.initial && f.key in this.initial) return this.initial[f.key];
            if (f.widget === 'switch') return !!f.default;
            if (f.widget === 'select') {
                if (f.default !== null && f.default !== undefined) return f.default;
                return f.options && f.options.length ? f.options[0].value : '';
            }
            return f.default === null || f.default === undefined ? '' : f.default;
        },

        // Whether a field is currently active. A field with an `enabledWhen`
        // hint is greyed out (and omitted from submission) unless another
        // field holds the required value — a UI affordance, not validation.
        isEnabled(f) {
            const w = f.enabledWhen;
            return !w || this.values[w.field] === w.equals;
        },

        // Tooltip explaining why a field is greyed out, derived from its
        // enabledWhen (no extra schema) — shows the target field's label and,
        // for a select, the human option label rather than the raw value.
        disabledHint(f) {
            const w = f.enabledWhen;
            if (!w) return null;
            const target = this.fields.find((x) => x.key === w.field);
            const label = target ? target.label : w.field;
            const opt = target && target.options
                && target.options.find((o) => o.value === w.equals);
            const value = opt ? opt.label : w.equals;
            return `Set "${label}" to "${value}" to edit.`;
        },

        // Inline style for a control: the theme colours, plus a dimmed,
        // not-allowed look when the field is disabled by its enabledWhen (the
        // hard-coded background would otherwise hide the browser's disabled
        // shading, so we grey it ourselves).
        fieldStyle(f) {
            const base = 'background-color:var(--color-navbar); color:var(--color-text);';
            return this.isEnabled(f) ? base : base + ' opacity:0.5; cursor:not-allowed;';
        },

        // The params object to submit. Empty optionals are omitted so the server
        // applies each field's default; booleans always travel (true/false);
        // fields whose enable-condition isn't met are omitted entirely.
        collect() {
            const out = {};
            for (const f of this.fields) {
                if (!this.isEnabled(f)) continue;
                const v = this.values[f.key];
                if (f.widget === 'switch') { out[f.key] = !!v; continue; }
                if (v === '' || v === null || v === undefined) continue;
                out[f.key] = f.widget === 'number' ? Number(v) : v;
            }
            return out;
        },

        setErrors(fields) {
            this.errors = fields || {};
        },
        clearErrors() {
            this.errors = {};
        },
        // NB: no leading underscore — Vue 3's template render context blocks
        // access to `_`/`$`-prefixed members, so a `@change="_clearFieldError(…)"`
        // binding would throw "not defined" at runtime.
        clearFieldError(key) {
            if (this.errors[key] == null) return;
            const next = { ...this.errors };
            delete next[key];
            this.errors = next;
        },
    },
    template: `
        <div class="param-surface">
            <div v-if="fields.length" class="row g-3">
                <div v-for="f in fields" :key="f.key" :class="f.fullWidth ? 'col-12' : 'col-md-6'">

                    <!-- switch (boolean) -->
                    <template v-if="f.widget === 'switch'">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox"
                                   :id="idPrefix + f.key"
                                   :disabled="!isEnabled(f)"
                                   v-model="values[f.key]">
                            <label class="form-check-label" :for="idPrefix + f.key">
                                [[ f.label ]]
                            </label>
                            <small v-if="f.description" class="text-muted d-block">
                                [[ f.description ]]
                            </small>
                        </div>
                    </template>

                    <!-- select (oneOf / enum) -->
                    <template v-else-if="f.widget === 'select'">
                        <label class="form-label" :for="idPrefix + f.key">[[ f.label ]]</label>
                        <select class="form-select"
                                :class="{ 'is-invalid': errors[f.key] }"
                                :id="idPrefix + f.key"
                                :disabled="!isEnabled(f)"
                                v-model="values[f.key]"
                                @change="clearFieldError(f.key)"
                                :style="fieldStyle(f)">
                            <option v-for="opt in f.options" :key="String(opt.value)"
                                    :value="opt.value">[[ opt.label ]]</option>
                        </select>
                        <small v-if="f.description" class="text-muted d-block">[[ f.description ]]</small>
                        <div v-if="errors[f.key]" class="invalid-feedback d-block">[[ errors[f.key] ]]</div>
                    </template>

                    <!-- number / text -->
                    <template v-else>
                        <label class="form-label" :for="idPrefix + f.key">[[ f.label ]]</label>
                        <input class="form-control"
                               :class="{ 'is-invalid': errors[f.key] }"
                               :type="f.widget === 'number' ? 'number' : 'text'"
                               :id="idPrefix + f.key"
                               :disabled="!isEnabled(f)"
                               :title="isEnabled(f) ? null : disabledHint(f)"
                               v-model="values[f.key]"
                               @input="clearFieldError(f.key)"
                               :placeholder="f.placeholder || f.description"
                               :style="fieldStyle(f)">
                        <small v-if="f.description" class="text-muted d-block">[[ f.description ]]</small>
                        <div v-if="errors[f.key]" class="invalid-feedback d-block">[[ errors[f.key] ]]</div>
                    </template>

                </div>
            </div>
        </div>
    `,
};

export default ParamSurface;
// Exposed for headless unit checks of the schema -> widget derivation.
export { fieldFor, scalarType, humanize };
