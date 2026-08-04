/* Where the vendored Vue does and does not interpolate its delimiters.
 * The template lint (mount_roots.py) skips some positions inside a mounted
 * region and reports others; those skips are only safe while the compiler
 * behaves as measured here, so an upgrade that changes it must fail loudly
 * rather than quietly open a hole.
 * Run by the pytest wrapper (test_vue_template_positions_js.py), which passes
 * the delimiter pair down from the server-side VUE_DELIMITERS so this file
 * holds no second copy of it:
 *   node vue_template_positions_check.mjs '[[' ']]'
 * Prints one line per check; exits non-zero on any failure. */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const bundle = readFileSync(join(repoRoot, 'website/web/static/js/vue.global.js'), 'utf8');

// The global build assigns to `Vue` on the host object and the code it
// generates reads that same global back, so hand it one and keep it.
const load = new Function('module', 'window', 'document', bundle + '\nmodule.exports = Vue;');
const box = {};
load(box, undefined, undefined);
globalThis.Vue = box.exports;

const assert = (cond, msg) => {
    if (!cond) { console.error('FAIL: ' + msg); process.exitCode = 1; }
    else console.log('ok: ' + msg);
};

const delimiters = process.argv.slice(2, 4);
if (delimiters.length !== 2) {
    console.error('FAIL: expected the delimiter pair as two arguments');
    process.exit(1);
}
const [open, close] = delimiters;
const compile = (template) =>
    globalThis.Vue.compile(template, { delimiters }).toString();

// A payload whose evaluation is unmistakable in the generated render function.
const sink = open + ' payload ' + close;

// The global build compiles to `with (_ctx) { ... }`, so an interpolated
// expression appears as a bare identifier and the delimiters are gone; an inert
// one leaves the delimiters sitting in the output as a string literal.
const interpolates = (template) => {
    const code = compile(template);
    return /\bpayload\b/.test(code) && !code.includes(open);
};

// ── Positions the lint reports ──────────────────────────────────────────────

assert(interpolates(`<div>${sink}</div>`),
       'a text node is interpolated - the position the class lives in');
assert(interpolates(`<div><textarea>${sink}</textarea></div>`),
       'a textarea is interpolated, so the lint must not treat it as inert');
assert(interpolates(`<div><pre>${sink}</pre></div>`),
       'a <pre> body is interpolated - blanking samples is for mount calls only');

// ── Positions the lint skips ────────────────────────────────────────────────

assert(!interpolates(`<div><script type="application/json">${sink}</script></div>`),
       'script content is not interpolated, so a JSON data island is inert');
assert(!interpolates(`<div><style>${sink}</style></div>`),
       'style content is not interpolated');
assert(!interpolates(`<div v-pre><span>${sink}</span></div>`),
       'a v-pre subtree is skipped - the marker layer 2 converts regions with');

// ── Where the lint is deliberately stricter than the compiler ───────────────

assert(!interpolates(`<div title="${sink}">x</div>`),
       'a plain attribute is not interpolated, yet the lint still checks one');
assert(/title: payload/.test(compile('<div :title="payload">x</div>')),
       'a directive value is compiled as a JavaScript expression');
