/* Source checks that the graph-config modal never builds markup from an
 * interpolated message (review §2.9: the saved-list error paths wrote
 * `${e.message}` / `${msg}` through innerHTML - a latent XSS sink).
 * Run by the pytest wrapper (test_graph_config_modal_js.py):
 * node graph_config_modal_check.mjs
 * Prints one line per check; exits non-zero on any failure. */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const src = readFileSync(
    join(repoRoot, 'website/web/static/js/graph/graphConfigModal.js'), 'utf8');

const assert = (cond, msg) => {
    if (!cond) { console.error('FAIL: ' + msg); process.exitCode = 1; }
    else console.log('ok: ' + msg);
};

// ── No innerHTML assignment interpolates data anywhere in the file ───────────
// Static markup strings are fine; a template literal with ${...} is not.
const offenders = [];
const re = /\.innerHTML\s*=\s*`/g;
let m;
while ((m = re.exec(src)) !== null) {
    const literal = src.slice(re.lastIndex, src.indexOf('`', re.lastIndex));
    if (literal.includes('${')) offenders.push(literal.slice(0, 60));
}
assert(offenders.length === 0,
       'no innerHTML is assigned an interpolated template literal'
       + (offenders.length ? ` (found: ${offenders.join(' | ')})` : ''));

// ── The saved-list error paths build DOM nodes, message as textContent ───────
const fnStart = src.indexOf('async function _loadSavedConfigs');
assert(fnStart !== -1, '_loadSavedConfigs is still present');
const fn = src.slice(fnStart, src.indexOf('\n}', fnStart));

assert(/catch \(e\) \{[^}]*\.textContent = e\.message/.test(fn),
       'the catch block renders e.message via textContent');
assert(!/catch \(e\) \{[^}]*innerHTML/.test(fn),
       'the catch block never touches innerHTML');
assert(fn.includes('replaceChildren('),
       'the error div replaces the list content via replaceChildren');
assert(src.includes("style.cssText = 'color:#ef4444;font-size:0.82rem;padding:0.5rem 0;'"),
       'the error div keeps the original inline styling (set via style.cssText)');
assert(/createElement\('code'\)[\s\S]{0,80}flask db upgrade/.test(fn),
       'the 500 hint still renders "flask db upgrade" as a <code> element');
