import { getTextColor, mapIcon, nameToColor } from './utils/galaxie.js';

/**
 * SingleTagDisplay
 * Renders one tag as a split pill (tag-left / tag-right) with a pure-CSS
 * hover tooltip showing name, description, visibility and date.
 */
const SingleTagDisplay = {
    props: {
        tag:           { type: Object,  required: true },
        showNamespace: { type: Boolean, default: true  },
        showFull:      { type: Boolean, default: false },
        selected:      { type: Boolean, default: false },
        highlight:     { type: String,  default: ''    },
    },
    emits: ['click', 'dblclick'],
    delimiters: ['[[', ']]'],

    setup(props) {
        function resolvedColor(tag) {
            const c = tag.color;
            return (c && /^#[0-9a-fA-F]{6}$/.test(c)) ? c : nameToColor(tag.name || 'tag');
        }

        function namespaceOf(name) {
            if (!name || !name.includes(':')) return '';
            if (name.startsWith('misp-galaxy:') && name.includes('='))
                return name.split(':')[1].split('=')[0];
            return name.split(':')[0];
        }

        function valueOf(name) {
            if (!name) return '';
            const m = name.match(/="(.+)"$/);
            if (m) return m[1];
            if (name.includes(':')) return name.split(':').slice(1).join(':');
            return name;
        }

        function label(tag) {
            const name = tag.name || '';
            if (props.showFull) {
                // Show everything after the first colon: 'accuracy="high"'
                return name.includes(':') ? name.split(':').slice(1).join(':') : name;
            }
            const ns  = namespaceOf(name);
            const val = valueOf(name);
            if (props.showNamespace && ns) return `${ns}:${val}`;
            return val;
        }

        function hlLabel(tag) {
            const text = label(tag)
            const q = props.highlight
            const safe = (text || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            if (!q) return safe
            const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            return safe.replace(new RegExp(`(${esc})`, 'gi'), '<mark class="tag-highlight">$1</mark>')
        }

        function positionTooltip(event) {
            const wrapper = event.currentTarget;
            const tooltip = wrapper.querySelector('.tag-tooltip');
            if (!tooltip) return;
            const r = wrapper.getBoundingClientRect();
            const tipW = 300;
            const margin = 10;
            let left = r.left + r.width / 2;
            left = Math.max(tipW / 2 + margin, Math.min(left, window.innerWidth - tipW / 2 - margin));
            tooltip.style.left = left + 'px';
            tooltip.style.top = (r.top - 10) + 'px';
        }

        return { getTextColor, mapIcon, resolvedColor, label, hlLabel, positionTooltip,
                 formatDate: ctiDate.formatDate };
    },

    template: `
        <div
            class="tag-wrapper d-inline-block"
            :class="{ selected }"
            @mouseenter="positionTooltip"
            @click.stop="$emit('click')"
            @dblclick.stop="$emit('dblclick')"
        >
            <span class="tag-split shadow-sm on-hover-zoom">
                <span class="tag-left" v-html="mapIcon(tag.icon)"></span>
                <span
                    class="tag-right"
                    :style="{ backgroundColor: resolvedColor(tag) }"
                    :title="tag.name"
                >
                    <span
                        :style="{ color: getTextColor(resolvedColor(tag)) }"
                        class="fw-bold"
                        v-html="hlLabel(tag)"
                    ></span>
                </span>
            </span>

            <div class="tag-tooltip">
                <div
                    class="tooltip-header"
                    :style="{ borderLeft: '4px solid ' + resolvedColor(tag) }"
                >
                    <span v-html="mapIcon(tag.icon)" class="me-1 text-white"></span>
                    <strong class="text-white">[[ tag.name ]]</strong>
                </div>
                <div class="tooltip-body">
                    <div class="description-container">
                        <div class="description-scroll text-white-50">
                            [[ tag.description || 'No description available.' ]]
                        </div>
                    </div>
                    <div
                        class="d-flex justify-content-between mt-2 pt-2"
                        style="font-size:0.7rem;border-top:1px solid rgba(255,255,255,0.08);"
                    >
                        <span class="text-white-50">
                            <i :class="tag.visibility === 'public' ? 'fas fa-eye me-1' : 'fas fa-eye-slash me-1'"></i>
                            [[ tag.visibility || 'private' ]]
                        </span>
                        <span v-if="tag.created_at" class="text-white-50">
                            <i class="far fa-calendar-alt me-1"></i>[[ formatDate(tag.created_at) ]]
                        </span>
                    </div>
                </div>
                <div class="tooltip-arrow"></div>
            </div>
        </div>
    `,
};

export default SingleTagDisplay;
