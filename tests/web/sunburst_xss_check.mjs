/* Client-side checks that attacker-controlled converted content cannot execute
 * from the Sunburst/Treemap tooltips. ECharts parses a function formatter's
 * return value as HTML, and the slice names come straight from the converted
 * bundle (STIX type, relationship_type, pattern prefix; MISP category/type),
 * so every interpolated value must be HTML-escaped.
 * Run by the pytest wrapper (test_sunburst_xss_js.py): node sunburst_xss_check.mjs
 * Prints one line per check; exits non-zero on any failure. */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const graphJs = join(repoRoot, 'website/web/static/js/graph');
const { sunburstTooltipFormatter, treemapTooltipFormatter } =
    await import(join(graphJs, 'conversionSunburst.js'));

const assert = (cond, msg) => {
    if (!cond) { console.error('FAIL: ' + msg); process.exitCode = 1; }
    else console.log('ok: ' + msg);
};

const payload = 'grouping<img src=x onerror=alert(document.domain)>';

// ── Sunburst tooltip ─────────────────────────────────────────────────────────
let html = sunburstTooltipFormatter({ name: payload, data: { value: 3 } });
assert(!html.includes('<img'), 'sunburst tooltip keeps no raw markup from a hostile slice name');
assert(html.includes('&lt;img'), 'sunburst tooltip HTML-escapes the hostile slice name');
assert(html === `<strong>grouping&lt;img src=x onerror=alert(document.domain)&gt;</strong><br>3 item(s)`,
       'sunburst tooltip output is exactly our markup around the escaped name');

html = sunburstTooltipFormatter({ name: 'ipv4-addr', data: { value: 7 } });
assert(html === '<strong>ipv4-addr</strong><br>7 item(s)',
       'a benign leaf slice still renders name and count');

html = sunburstTooltipFormatter({ name: 'network', data: {} });
assert(html === '<strong>network</strong>',
       'a branch slice without a count renders the name alone');

html = sunburstTooltipFormatter({ name: 'indicator' });
assert(html === '<strong>indicator</strong>',
       'a slice with no data object does not throw');

// ── Treemap tooltip ──────────────────────────────────────────────────────────
html = treemapTooltipFormatter({ name: payload, value: 2 });
assert(!html.includes('<img'), 'treemap tooltip keeps no raw markup from a hostile slice name');
assert(html === `<strong>grouping&lt;img src=x onerror=alert(document.domain)&gt;</strong><br>2 item(s)`,
       'treemap tooltip output is exactly our markup around the escaped name');

html = treemapTooltipFormatter({ name: 'Network activity', value: 12 });
assert(html === '<strong>Network activity</strong><br>12 item(s)',
       'a benign treemap tile still renders name and count');

// ── The component actually wires the safe formatters ────────────────────────
const src = readFileSync(join(graphJs, 'conversionSunburst.js'), 'utf8');
assert(/tooltip:\s*\{[^}]*formatter:\s*sunburstTooltipFormatter/s.test(src),
       'the sunburst option uses the named tooltip formatter');
assert(/tooltip:\s*\{\s*formatter:\s*treemapTooltipFormatter/.test(src),
       'the treemap option uses the named tooltip formatter');
assert(!/formatter:\s*p\s*=>\s*`</.test(src),
       'no inline formatter builds HTML from interpolated values anymore');
