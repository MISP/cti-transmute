const SECTIONS_USER = [
    { icon: 'fa-home',                    label: 'Home',          url: '/' },
    { icon: 'fa-book',                    label: 'History',       url: '/conversions/history' },
    { icon: 'fa-arrow-right-arrow-left',  label: 'MISP → STIX',  url: '/conversions/misp_to_stix' },
    { icon: 'fa-arrow-right-arrow-left',  label: 'STIX → MISP',  url: '/conversions/stix_to_misp' },
    { icon: 'fa-plug',                    label: 'API Endpoints', url: '/list' },
]
const SECTIONS_AUTH  = [
    { icon: 'fa-user', label: 'Profile', url: '/account/' },
]
const SECTIONS_ADMIN = [
    { icon: 'fa-users',     label: 'Manage Users',     url: '/account/manage_user',            admin: true },
    { icon: 'fa-comments',  label: 'All Comments',     url: '/account/admin/comments',         admin: true },
    { icon: 'fa-flag',      label: 'Reports',          url: '/account/admin/reports',          admin: true },
    { icon: 'fa-trash-alt', label: 'Deleted Conversions', url: '/account/admin/deleted_converts', admin: true },
    { icon: 'fa-stream',    label: 'Activity Logs',    url: '/account/admin/logs',             admin: true },
    { icon: 'fa-tags',      label: 'Tag Management',   url: '/tags/admin/',                    admin: true },
]

function validHex(c) { return /^#[0-9a-fA-F]{6}$/.test(c || '') }

const NavbarSearch = {
    props: {
        isAdmin: { type: Boolean, default: false },
        isAuth:  { type: Boolean, default: false },
    },

    data() {
        return {
            query:  '',
            groups: [],
            show:   false,
            timer:  null,
            idx:    -1,
        }
    },

    computed: {
        allSections() {
            return [
                ...SECTIONS_USER,
                ...(this.isAuth  ? SECTIONS_AUTH  : []),
                ...(this.isAdmin ? SECTIONS_ADMIN : []),
            ]
        },
    },

    methods: {
        onFocus() {
            if (!this.query.trim()) this.quickAccess()
            else this.doSearch(this.query)
        },

        onInput() {
            clearTimeout(this.timer)
            const q = this.query
            if (!q.trim()) { this.quickAccess(); return }
            this.timer = setTimeout(() => this.doSearch(q), 250)
        },

        quickAccess() {
            const user  = this.allSections.filter(s => !s.admin)
            const admin = this.allSections.filter(s =>  s.admin)
            const g = []
            if (user.length)  g.push({ id: 'qa-user',  type: 'section', icon: 'fa-layer-group',   label: 'Quick Access', items: user })
            if (admin.length) g.push({ id: 'qa-admin', type: 'section', icon: 'fa-shield-halved', label: 'Admin',        items: admin })
            this.groups  = g
            this.show    = true
            this.idx     = -1
        },

        async doSearch(q) {
            const mu = this.allSections.filter(s => !s.admin && s.label.toLowerCase().includes(q.toLowerCase()))
            const ma = this.allSections.filter(s =>  s.admin && s.label.toLowerCase().includes(q.toLowerCase()))
            const g  = []
            if (mu.length) g.push({ id: 's-user',  type: 'section', icon: 'fa-layer-group',   label: 'Sections', items: mu })
            if (ma.length) g.push({ id: 's-admin', type: 'section', icon: 'fa-shield-halved', label: 'Admin',    items: ma })

            try {
                const res   = await fetch('/conversions/get_convert_page_history?searchQuery=' + encodeURIComponent(q) + '&page=1')
                const data  = res.ok ? await res.json() : { list: [] }
                const items = (data.list || []).slice(0, 5)
                if (items.length) {
                    g.push({
                        id: 'converts', type: 'convert',
                        icon: 'fa-exchange-alt', label: 'Conversions',
                        items,
                        seeAll: '/conversions/history?search=' + encodeURIComponent(q),
                    })
                }
            } catch {}

            if (this.isAdmin) {
                try {
                    const res   = await fetch('/tags/admin/list?search=' + encodeURIComponent(q) + '&per_page=6&page=1')
                    const data  = res.ok ? await res.json() : { list: [] }
                    const items = (data.list || []).slice(0, 6)
                    if (items.length) {
                        g.push({
                            id: 'tags', type: 'tag',
                            icon: 'fa-tags', label: 'Tags',
                            items,
                            seeAll: '/tags/admin/?search=' + encodeURIComponent(q),
                        })
                    }
                } catch {}
            }

            if (!g.length) g.push({ id: 'empty', type: 'empty' })

            this.groups = g
            this.show   = true
            this.idx    = -1
        },

        typeLabel(t) { return t === 'MISP_TO_STIX' ? 'MISP→STIX' : t === 'STIX_TO_MISP' ? 'STIX→MISP' : t || '—' },
        typeClass(t)  { return t === 'MISP_TO_STIX' ? 'nav-sd-misp' : t === 'STIX_TO_MISP' ? 'nav-sd-stix' : '' },
        tagColor(tag) { return validHex(tag.color) ? tag.color : '#6366f1' },

        onSubmit()  { this.show = false },

        onKeydown(e) {
            if (!this.show) return
            const items = this._focusable()
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                this.idx = Math.min(this.idx + 1, items.length - 1)
                items[this.idx]?.focus()
            } else if (e.key === 'Escape') {
                this.show = false
            }
        },

        onDropdownKey(e) {
            const items = this._focusable()
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                this.idx = Math.min(this.idx + 1, items.length - 1)
                items[this.idx]?.focus()
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                if (this.idx <= 0) { this.idx = -1; this.$el.querySelector('input')?.focus(); return }
                this.idx = Math.max(0, this.idx - 1)
                items[this.idx]?.focus()
            } else if (e.key === 'Escape') {
                this.show = false
                this.$el.querySelector('input')?.focus()
            }
        },

        _focusable() { return Array.from(this.$el.querySelectorAll('.nav-sd-focusable')) },

        _outsideClick(e) { if (!this.$el.contains(e.target)) this.show = false },
    },

    mounted() {
        const sq = new URLSearchParams(window.location.search).get('search')
        if (sq) this.query = sq
        document.addEventListener('click', this._outsideClick)
    },
    beforeUnmount() {
        document.removeEventListener('click', this._outsideClick)
    },

    template: `
<form class="top-nav-search" action="/conversions/history" method="get" @submit="onSubmit">
  <div class="top-nav-search-wrap">
    <i class="fas fa-search top-nav-search-icon"></i>
    <input
      name="search"
      class="top-nav-search-input"
      type="text"
      placeholder="Search…"
      autocomplete="off"
      v-model="query"
      @input="onInput"
      @focus="onFocus"
      @keydown="onKeydown"
    >
    <div class="nav-search-dropdown" v-show="show" @keydown="onDropdownKey">
      <template v-for="g in groups" :key="g.id">

        <!-- Empty -->
        <div v-if="g.type==='empty'" class="nav-sd-empty">
          <i class="fas fa-inbox me-1"></i>No results
        </div>

        <!-- Navigation sections -->
        <template v-else-if="g.type==='section'">
          <div class="nav-sd-group-header">
            <i class="fas me-1" :class="g.icon"></i>{{ g.label }}
          </div>
          <a v-for="s in g.items" :key="s.url" class="nav-sd-section-item nav-sd-focusable" :href="s.url">
            <span class="nav-sd-section-icon" :class="s.admin ? 'nav-sd-admin-icon' : ''">
              <i class="fas" :class="s.icon"></i>
            </span>
            <span class="nav-sd-name">{{ s.label }}</span>
            <span v-if="s.admin" class="nav-sd-admin-tag">Admin</span>
          </a>
        </template>

        <!-- Conversions -->
        <template v-else-if="g.type==='convert'">
          <div class="nav-sd-group-header">
            <i class="fas fa-exchange-alt me-1"></i>{{ g.label }}
          </div>
          <a v-for="c in g.items" :key="c.id" class="nav-sd-item nav-sd-focusable" :href="'/conversions/detail/'+c.id">
            <span class="nav-sd-badge" :class="typeClass(c.conversion_type)">{{ typeLabel(c.conversion_type) }}</span>
            <span class="nav-sd-name">{{ c.name }}</span>
          </a>
          <a class="nav-sd-footer nav-sd-focusable" :href="g.seeAll">
            <i class="fas fa-search me-1"></i>See all results for "{{ query }}"
          </a>
        </template>

        <!-- Tags (admin only) -->
        <template v-else-if="g.type==='tag'">
          <div class="nav-sd-group-header">
            <i class="fas fa-tags me-1"></i>{{ g.label }}
            <span class="nav-sd-admin-tag ms-1">Admin</span>
          </div>
          <a v-for="t in g.items" :key="t.id" class="nav-sd-item nav-sd-focusable" :href="g.seeAll">
            <span class="nav-sd-tag-dot" :style="{ background: tagColor(t) }">
              <i class="fas" :class="'fa-'+(t.icon||'tag')"></i>
            </span>
            <span class="nav-sd-name">{{ t.name }}</span>
          </a>
          <a class="nav-sd-footer nav-sd-focusable" :href="g.seeAll">
            <i class="fas fa-tags me-1"></i>See all tags for "{{ query }}"
          </a>
        </template>

      </template>
    </div>
  </div>
</form>
    `,
}

export default NavbarSearch
