// ─────────────────────────────────────────────────────────────────────────────
//  CtiSwitch — the site's segmented switch (reuse it for any "pick a view").
//
//    <cti-switch v-model="tab" :options="[
//        { value: 'try', label: 'Try it out', icon: 'fas fa-flask', hint: 'Send real requests' },
//        { value: 'ref', label: 'Reference', icon: 'fas fa-book-open' },
//    ]" label="API page view"></cti-switch>
//
//  A radio group under the hood: arrow keys move between options, the
//  selected one carries aria-checked. Styles: .cti-switch in css/core.css.
// ─────────────────────────────────────────────────────────────────────────────

export const CtiSwitch = {
    props: {
        modelValue: { type: String, required: true },
        options: { type: Array, required: true },
        label: { type: String, default: 'View' },
        size: { type: String, default: 'md' },   // 'md' | 'sm'
    },
    emits: ['update:modelValue'],
    template: `
<div class="cti-switch" :class="'cti-switch-' + size" role="radiogroup" :aria-label="label" @keydown="onKey">
    <button v-for="opt in options" :key="opt.value" type="button" role="radio"
        class="cti-switch-option" :class="{ active: opt.value === modelValue }"
        :aria-checked="opt.value === modelValue" :tabindex="opt.value === modelValue ? 0 : -1"
        @click="$emit('update:modelValue', opt.value)">
        <i v-if="opt.icon" :class="opt.icon" aria-hidden="true"></i>
        <span class="cti-switch-text">
            <span class="cti-switch-label">{{ opt.label }}</span>
            <span v-if="opt.hint && size !== 'sm'" class="cti-switch-hint">{{ opt.hint }}</span>
        </span>
    </button>
</div>`,
    methods: {
        onKey(e) {
            if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return
            const i = this.options.findIndex(o => o.value === this.modelValue)
            const next = this.options[(i + (e.key === 'ArrowRight' ? 1 : this.options.length - 1)) % this.options.length]
            this.$emit('update:modelValue', next.value)
            this.$nextTick(() => this.$el.querySelector('.cti-switch-option.active')?.focus())
            e.preventDefault()
        },
    },
}

export default CtiSwitch
