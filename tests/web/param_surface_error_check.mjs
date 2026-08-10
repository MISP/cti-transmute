/* Client-side checks that a failed param-surface load reports its error as
 * text. The three converter pages each render the failure of
 * GET /api/convert/list into the mount point;
 * Run by the pytest wrapper (test_param_surface_error_js.py):
 * node param_surface_error_check.mjs
 * Prints one line per check; exits non-zero on any failure. */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Fake DOM: throws on any innerHTML assignment, so reaching the end proves no
// markup path is taken. Prior art: misp_rows_xss_check.mjs.
function makeEl(tag) {
    return {
        tagName: tag,
        className: '',
        children: [],
        style: {},
        _text: '',
        set textContent(v) { this._text = String(v); },
        get textContent() { return this._text; },
        set innerHTML(v) { throw new Error('innerHTML must never be assigned: ' + v); },
        appendChild(child) { this.children.push(child); return child; },
        replaceChildren(...nodes) { this.children = nodes; }
    };
}
globalThis.document = { createElement: makeEl };

const { renderParamError } =
    await import(join(repoRoot, 'website/web/static/js/conversions/paramSurface.js'));

const assert = (cond, msg) => {
    if (!cond) { console.error('FAIL: ' + msg); process.exitCode = 1; }
    else console.log('ok: ' + msg);
};

// ── A hostile message renders as text, not markup ────────────────────────────
const payload = '<img src=x onerror=alert(document.domain)>';
const mount = makeEl('div');
renderParamError(mount, payload);

assert(mount.children.length === 1,
       'the notice replaces the mount content with a single node');
const notice = mount.children[0];
assert(notice.tagName === 'div' && notice.className === 'text-danger small',
       'the notice keeps the original element and styling');
assert(notice.textContent === 'Could not load parameters: ' + payload,
       'the hostile message lands verbatim as text, prefix included');

// ── A second failure replaces the first rather than stacking ─────────────────
renderParamError(mount, 'Converter not found in registry');
assert(mount.children.length === 1
       && mount.children[0].textContent.endsWith('Converter not found in registry'),
       'a repeated failure replaces the previous notice');

// ── The three converter pages route their failure through it ─────────────────
// Each page mounts the surface itself, so the sink returns the moment one of
// them hand-rolls the notice again.
for (const page of ['stix_to_misp.html', 'misp_to_stix.html', 'refresh.html']) {
    const tpl = readFileSync(
        join(repoRoot, 'website/web/templates/conversions', page), 'utf8');
    // The module path goes through Jinja's asset_url(), whose own quotes nest
    // inside the import's, so match up to the filename rather than the quoting.
    assert(/import [^;]*renderParamError[^;]*from [^;]*paramSurface\.js/.test(tpl),
           `${page} imports renderParamError from the shared module`);
    assert(tpl.includes('renderParamError(mount, e.message)'),
           `${page} reports a param-surface failure through it`);
    assert(!/mount\.innerHTML\s*=/.test(tpl),
           `${page} never assigns the mount's innerHTML`);
}
