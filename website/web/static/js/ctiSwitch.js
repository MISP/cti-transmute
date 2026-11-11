// ─────────────────────────────────────────────────────────────────────────────
//  CtiSwitch — the site's segmented switch (reuse it for any "pick a view").
//
//    <cti-switch v-model="tab" :options="[
//        { value: 'try', label: 'Try it out', icon: 'fas fa-flask', hint: 'Send real requests' },
//        { value: 'ref', label: 'Reference', icon: 'fas fa-book-open' },
//    ]" label="API page view"></cti-switch>
//
//  A radio group under the hood: arrow keys move between options, the
//  selected one carries aria-checked. An option with `href` (and optionally
//  `external: true`) is a link drawn like the others: it leaves the page.
//  Styles: .cti-switch in css/core.css.
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
    <template v-for="opt in options" :key="opt.value">
        <!-- An option with href looks like the others but is a link to another page. -->
        <a v-if="opt.href" class="cti-switch-option" :href="opt.href"
            :target="opt.external ? '_blank' : null" :rel="opt.external ? 'noopener' : null">
            <i v-if="opt.icon" :class="opt.icon" aria-hidden="true"></i>
            <span class="cti-switch-text">
                <span class="cti-switch-label">{{ opt.label }}<i v-if="opt.external" class="fas fa-arrow-up-right-from-square cti-switch-ext" aria-hidden="true"></i></span>
                <span v-if="opt.hint && size !== 'sm'" class="cti-switch-hint">{{ opt.hint }}</span>
            </span>
        </a>
        <button v-else type="button" role="radio"
            class="cti-switch-option" :class="{ active: opt.value === modelValue }"
            :aria-checked="opt.value === modelValue" :tabindex="opt.value === modelValue ? 0 : -1"
            @click="$emit('update:modelValue', opt.value)">
            <i v-if="opt.icon" :class="opt.icon" aria-hidden="true"></i>
            <span class="cti-switch-text">
                <span class="cti-switch-label">{{ opt.label }}</span>
                <span v-if="opt.hint && size !== 'sm'" class="cti-switch-hint">{{ opt.hint }}</span>
            </span>
        </button>
    </template>
</div>`,
    methods: {
        onKey(e) {
            if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return
            const views = this.options.filter(o => !o.href)
            const i = views.findIndex(o => o.value === this.modelValue)
            const next = views[(i + (e.key === 'ArrowRight' ? 1 : views.length - 1)) % views.length]
            this.$emit('update:modelValue', next.value)
            this.$nextTick(() => this.$el.querySelector('.cti-switch-option.active')?.focus())
            e.preventDefault()
        },
    },
}

export default CtiSwitch
