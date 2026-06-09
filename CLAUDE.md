# CTI-Transmute — CLAUDE.md

## What this is
Flask + Vanilla Vue 3 (no build step) + PostgreSQL app that converts MISP ↔ STIX.
The conversion engine lives in `vendor/pivotick` (git submodule) and is exposed at port 6868.
The web app lives in `website/` and runs on the port in `config/generic.json`.

---

## How to run

```bash
uv run manage start        # start the app
uv run manage init         # first-time setup (submodules + DB)
uv run manage update       # git pull + deps + migrations
uv run manage backup       # pg_dump to website/db_class/backups/
```

The entry point is `bin/start_website.py` → registers all blueprints → `application.run()`.

---

## Project layout

```
bin/
  manage.py           # CLI for start / init / update / backup / db
  start_website.py    # registers blueprints and starts Flask

config/
  generic.json        # listen_ip, listen_port

cti_transmute/        # conversion lib wrapper (Transmute class)
vendor/               # git submodules: pivotick, misp-taxonomies, misp-galaxy

website/
  web/__init__.py     # Flask app factory, db/login/session/migrate init
  web/home.py         # home_blueprint
  web/<feature>/
    <feature>.py       # Blueprint + route handlers
    <feature>_core.py  # DB service functions (no HTTP)
    <feature>_form.py  # WTForms (if needed)
  web/utils.py        # shared helpers
  web/templates/      # Jinja2 HTML (base.html + per-feature folders)
  web/static/
    css/<feature>.css  # one CSS file per feature
    js/<feature>/      # Vue components as plain .js ES modules
    js/graph/          # convert detail visualizations (sunburst, table, graph)
    js/misp/           # MISP-related components (push modal)
    js/tags/           # tag system components
    js/evaluate/       # evaluation charts
  db_class/db.py      # all SQLAlchemy models
  migrations/         # Flask-Migrate / Alembic migrations
  api/convert.py      # internal API blueprint (port 6868, conversion engine)
```

### Features implemented

| Feature | Blueprint | Core | JS | CSS |
|---|---|---|---|---|
| Conversions | `convert/convert.py` | `convert_core.py` | `graph/`, `misp/` | `detail.css`, `history.css` |
| Evaluation | `evaluate/evaluate.py` | `evaluate_core.py` | `evaluate/evaluationCharts.js`, `evaluationPanel.js` | `evaluation.css` |
| Tags | `tags/tags.py` | `tags_core.py` | `tags/` | `tags.css` |
| Account | `account/` | — | — | `account.css` |

---

## Backend patterns

### Blueprint structure
Each feature = one folder with 3 files:
- `<feature>.py` — Blueprint definition + routes
- `<feature>_core.py` — DB queries / business logic (imported as `FeatureModel`)
- `<feature>_form.py` — WTForms

```python
# Import pattern inside blueprint file
from ..convert import convert_core as ConvertModel
from ..account import account_core as AccountModel
```

### Blueprint registration (`bin/start_website.py`)
```python
application.register_blueprint(convert_blueprint, url_prefix="/convert")
```

### Route return shape (JSON endpoints)
```python
return {"success": True, "data": ..., "message": "...", "toast_class": "success"}, 200
return {"success": False, "message": "...", "toast_class": "danger"}, 4xx
```

### DB (SQLAlchemy)
- All models in `website/db_class/db.py`
- Every model has a `to_json()` method
- Soft delete pattern: `is_active=False` + `deleted_at`
- `db.session.add(obj)` → `db.session.commit()` → rollback on except
- `uuid` column on every main model (String 36)

### Migrations
```bash
# Create a new migration
uv run manage db migrate
# Apply
uv run manage db upgrade
# Or directly
uv run flask --app website.web db migrate -m "description"
uv run flask --app website.web db upgrade
```

---

## Frontend patterns

### Vue 3 — no build step
Vue is loaded from `/static/js/vue.global.js` (CDN-style, global build).
Components are plain `.js` ES modules with inline template strings.

### Component template
```js
const MyComponent = {
    delimiters: ['[[', ']]'],   // avoid conflict with Jinja2 {{ }}
    props: {
        myProp: { type: String, required: true },
    },
    components: { 'other-comp': OtherComponent },
    data() {
        return { localState: null };
    },
    computed: { ... },
    methods: { ... },
    template: `<div>[[ myProp ]]</div>`,
};
export default MyComponent;
```

### Mounting a Vue app in a Jinja template
```html
<script type="module">
    import MyComponent from '/static/js/myfeature/MyComponent.js';
    const { createApp } = Vue;
    const app = createApp({ ... });
    app.component('my-component', MyComponent);
    app.mount('#app-root');
</script>
```

### File naming
- JS components: `camelCase.js` (e.g. `tagDisplay.js`, `convertSunburst.js`)
- CSS: `kebab-case.css` or `feature.css` (e.g. `tags.css`, `detail.css`)
- Python blueprints: `snake_case.py` (e.g. `convert_core.py`, `account_form.py`)
- Templates: `snake_case.html` in `templates/<feature>/` subfolders

### Toast notifications
```js
import { create_message, display_toast } from '/static/js/toaster.js';
// from a fetch response:
display_toast(response);
// manually:
create_message("Done!", "success-subtle");
```

### API calls pattern (fetch)
```js
const res = await fetch('/convert/some_route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
    body: JSON.stringify(payload),
});
const data = await res.json();
if (data.success) { ... }
```

CSRF token: `document.getElementById('csrf_token')?.value`

---

## CSS
- One `.css` file per feature in `website/web/static/css/`
- CSS variables for theming: `var(--text-color)`, `var(--accent)`, `var(--surface-2)`, etc.
- 4 themes: `light`, `dark`, `dusk`, `ocean` — applied as `<html class="light-mode">`
- Bootstrap 5.3 + FontAwesome 6.3 available globally
- Each visualization component uses a unique CSS class prefix to avoid collisions
  (e.g. `csb-` for ConvertSunburst, `ctbl-` for ConvertTable, `jv-` for JsonViewer)

---

## Convert detail tabs (`templates/convert/detail.html`)

The detail page has a tabbed layout. Each tab is a Bootstrap `nav-link` + `tab-pane`.

Existing tabs in order: **Input · Output · History · Graph · Sunburst · Table · Comments · Evaluation**

To add a tab:
1. Add a `<li class="nav-item">` with a `data-bs-toggle="tab"` link to `#mytab-pane-[[convert.id]]`
2. Add the matching `<div class="tab-pane fade" :id="'mytab-pane-'+convert.id">` in the tab-content block
3. Place your Vue component inside: `<my-component :convert-data="convert"></my-component>`
4. Import and register the component in the `<script type="module">` block at the bottom:
   ```js
   import MyComponent from '/static/js/graph/myComponent.js';
   // ...
   app.component('my-component', MyComponent);
   ```

---

## Adding a new visualization to the detail page

All visualization components follow the same pattern. The component lives in
`website/web/static/js/graph/` and receives the full convert object as a prop.

### 1. Create the component file

```js
// website/web/static/js/graph/myViz.js
import JsonViewer from '/static/js/graph/jsonViewer.js'  // optional, for drill-down

const MyViz = {
    delimiters: ['[[', ']]'],
    components: { 'json-viewer': JsonViewer },
    props: { convertData: { type: Object, default: null } },
    template: `<div class="mvz-wrapper">...</div>`,

    setup(props) {
        const { ref, watch } = Vue

        const side = ref('input')   // 'input' or 'output'

        function render() {
            if (!props.convertData) return
            const text = side.value === 'input'
                ? props.convertData.input_text
                : props.convertData.output_text
            // parse + display
        }

        function setSide(s) { side.value = s; render() }

        // immediate:true fires on mount even if convertData is already populated
        watch(() => props.convertData, v => {
            if (v?.input_text || v?.output_text) render()
        }, { immediate: true })

        return { side, setSide }
    },
}

export default MyViz
```

### 2. Detect and parse the format

```js
function detectFormat(text) {
    if (!text) return 'unknown'
    const s = text.trimStart()
    if (s.includes('"type":"bundle"') || s.includes('"type": "bundle"')) return 'stix'
    if (s.includes('"Event"') || s.includes('"Attribute"')) return 'misp'
    return 'unknown'
}

// Then in render():
const fmt    = detectFormat(text)
const parsed = fmt === 'misp' ? parseMisp(text) : fmt === 'stix' ? parseStix(text) : null
```

### 3. Lazy-load an external library (optional)

Use the singleton promise pattern so the CDN script loads only once regardless of how many times the component mounts:

```js
let _libPromise = null
function loadLib() {
    if (window.myLib) return Promise.resolve(window.myLib)
    if (_libPromise) return _libPromise
    _libPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://cdn.example.com/mylib.min.js'
        s.onload  = () => resolve(window.myLib)
        s.onerror = () => reject(new Error('Failed to load myLib'))
        document.head.appendChild(s)
    })
    return _libPromise
}
```

ECharts (used by ConvertSunburst) follows exactly this pattern.

### 4. Handle resize and theme changes

```js
window.addEventListener('resize', () => chartInst?.resize())
document.documentElement.addEventListener('themechange', render)

// For ECharts with ResizeObserver (handles tab becoming visible):
const resizeObs = new ResizeObserver(() => {
    if (chartInst && chartEl.value?.offsetWidth > 0) chartInst.resize()
})
resizeObs.observe(chartEl.value)

onUnmounted(() => {
    window.removeEventListener('resize', ...)
    document.documentElement.removeEventListener('themechange', render)
    resizeObs?.disconnect()
    chartInst?.dispose()
})
```

### 5. Wire CSS prefix

Pick a short unique prefix for all CSS classes in this component (avoids collisions with Bootstrap and other components). Style in `website/web/static/css/detail.css`.

---

## Reusable components

### `JsonViewer` (`js/graph/jsonViewer.js`)
Displays any JSON object/array/string with highlight.js, collapsible tree, format, download, copy.

```js
import JsonViewer from '/static/js/graph/jsonViewer.js'

// In template:
// <json-viewer :json="someObject" filename="my-file"></json-viewer>

// Props:
//   json     : Object | Array | String — the data to display
//   filename : String — base name for the downloaded .json file
```

Used by ConvertSunburst (click-slice drill-down) and ConvertTable (click-row drill-down).

### `ConvertSunburst` (`js/graph/convertSunburst.js`)
ECharts sunburst + treemap of CTI data distribution. Input/Output toggle. Click a slice → JsonViewer panel showing matching raw items.

### `ConvertTable` (`js/graph/convertTable.js`)
Flat tabular view with search, sort, pagination (50 rows/page). Click a row → JsonViewer panel.

### `ConvertGraph` (`js/graph/convertGraph.js`)
Force-directed graph powered by Pivotick (`vendor/pivotick`). Input/Output toggle. Config modal via `graphConfigModal.js`.

### `EvaluationPanel` (`js/evaluationPanel.js`)
Star-rating + qualitative feedback form per convert.

### `EvaluationCharts` (`js/evaluate/evaluationCharts.js`)
Aggregated evaluation score charts for a convert.

### `PushConvertToMISP` (`js/misp/pushConvertToMISP.js`)
Modal to push a converted event to a MISP instance. Includes evaluation preview.

### `TagInput` (`js/tags/tagInput.js`)
Tag selector/display per convert. Backed by `tags/tags.py` and `tags_core.py`.

---

## Features

### Tags (`web/tags/`)
Tags have 3 sources: `Manual`, `Taxonomy` (imported from `vendor/misp-taxonomies`), `Vulnerability`.
The taxonomy import loads ~12 380 tags. Admin page at `/tags/admin`.

### Evaluation (`web/evaluate/`)
Per-convert quality score (1–5 stars + comments). Export to PDF and Markdown via `/evaluate/export/<id>/pdf` and `/evaluate/export/<id>/markdown`.

### Favorites (`web/convert/`)
Users can bookmark any convert. Toggle via `POST /convert/favorite/toggle`. Status via `GET /convert/favorite/status/<id>`.

### Social (`web/convert/`)
Comments (discussion + evaluation), replies, edit, delete, private/public toggle.
Follow/unfollow authors. Report converts.
Notifications refreshed via `window.__refreshNotifCount?.()`.

### MISP push (`web/convert/`)
Push a converted event to a configured MISP instance. Payload includes the conversion result plus an evaluation object. Download the push payload via `/convert/download/<id>/misp-push`.

---

## DB connection
PostgreSQL local:
- user: `cti_user` / pass: `cti_pass`
- db: `cti_db` / host: `localhost:5432`
- URI: `postgresql+psycopg2://cti_user:cti_pass@localhost:5432/cti_db`
