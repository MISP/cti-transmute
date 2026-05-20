/**
 * AppPagination — dots numérotés avec ellipsis automatique.
 * Props : page (courant), total (total pages).
 * Émet  : change(newPage)
 *
 * Usage :
 *   <app-pagination :page="page" :total="total_page" @change="p => { page = p; load() }">
 *   </app-pagination>
 *
 * Ou quand la fonction de chargement accepte déjà le numéro de page :
 *   <app-pagination :page="current_page" :total="total_pages" @change="fetchData">
 *   </app-pagination>
 */
const AppPagination = {
    delimiters: ['[[', ']]'],
    props: {
        page:  { type: Number, default: 1 },
        total: { type: Number, default: 1 },
    },
    emits: ['change'],
    computed: {
        visiblePages() {
            const c = this.page, t = this.total;
            if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);
            let ws = Math.max(2, c - 2), we = Math.min(t - 1, c + 2);
            while (we - ws < 4 && (ws > 2 || we < t - 1)) {
                if (ws > 2) ws--;
                if (we < t - 1 && we - ws < 4) we++;
            }
            const pages = [1];
            if (ws > 2) pages.push('...');
            for (let i = ws; i <= we; i++) pages.push(i);
            if (we < t - 1) pages.push('...');
            pages.push(t);
            return pages;
        },
    },
    methods: {
        go(p) {
            if (p < 1 || p > this.total || p === this.page) return;
            this.$emit('change', p);
        },
    },
    template: `
<nav v-if="total > 1" class="pg-nav" aria-label="Pagination">
  <button type="button" class="pg-btn pg-prev" :disabled="page <= 1" @click="go(page - 1)">
    <i class="fas fa-chevron-left"></i>
    <span class="pg-label">prev</span>
  </button>
  <div class="pg-numbers">
    <template v-for="p in visiblePages" :key="p">
      <button v-if="p !== '...'" type="button"
        class="pg-btn pg-num" :class="{ active: p === page }"
        @click="go(p)">
        [[ p ]]
      </button>
      <span v-else class="pg-ellipsis">…</span>
    </template>
  </div>
  <button type="button" class="pg-btn pg-next" :disabled="page >= total" @click="go(page + 1)">
    <span class="pg-label">next</span>
    <i class="fas fa-chevron-right"></i>
  </button>
</nav>
    `,
};

export default AppPagination;
