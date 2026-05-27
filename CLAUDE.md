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
    <feature>_form.py  # WTForms
  web/utils.py        # shared helpers
  web/templates/      # Jinja2 HTML (base.html + per-feature folders)
  web/static/
    css/<feature>.css  # one CSS file per feature
    js/<feature>/      # Vue components as plain .js ES modules
  db_class/db.py      # all SQLAlchemy models
  migrations/         # Flask-Migrate / Alembic migrations
  api/convert.py      # internal API blueprint (port 6868, conversion engine)
```

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
- JS components: `camelCase.js` (e.g. `tagDisplay.js`, `singleTagDisplay.js`)
- CSS: `kebab-case.css` or `feature.css` (e.g. `tags.css`, `sidebar.css`)
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

---

## DB connection
PostgreSQL local:
- user: `cti_user` / pass: `cti_pass`
- db: `cti_db` / host: `localhost:5432`
- URI: `postgresql+psycopg2://cti_user:cti_pass@localhost:5432/cti_db`
