/* Client-side checks that a stored graph config - user input replayed into
 * other users' browsers - cannot smuggle HTML-parsed style fields into
 * Pivotick. Pivotick renders a style's svgIcon through template.innerHTML,
 * so applyConfig must schema-filter every patch before merging it into
 * GRAPH_CONFIG: known keys only, typed values, style entries restricted to
 * shape/color/size.
 * Run by the pytest wrapper (test_graph_config_sanitize_js.py):
 * node graph_config_sanitize_check.mjs
 * Prints one line per check; exits non-zero on any failure. */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const graphJs = join(repoRoot, 'website/web/static/js/graph');
const { sanitizeConfigPatch } = await import(join(graphJs, 'graphSafety.js'));
const { GRAPH_CONFIG, applyConfig } = await import(join(graphJs, 'conversionGraph.js'));

const assert = (cond, msg) => {
    if (!cond) { console.error('FAIL: ' + msg); process.exitCode = 1; }
    else console.log('ok: ' + msg);
};

const SVG_PAYLOAD = '<image href=x onerror=alert(document.domain)>';

// ── The demonstrated attack: svgIcon riding on a plausible config ────────────
let clean = sanitizeConfigPatch({
    mispStyles: {
        Event: { shape: 'square', color: '#111827', size: 26, svgIcon: SVG_PAYLOAD, iconClass: 'fas fa-bomb' }
    }
});
assert(clean.mispStyles.Event !== undefined,
       'a style entry with valid fields survives the filter');
assert(clean.mispStyles.Event.svgIcon === undefined,
       'svgIcon never survives - Pivotick would HTML-parse it');
assert(clean.mispStyles.Event.iconClass === undefined,
       'iconClass never survives - it is written to className unescaped');
assert(JSON.stringify(clean.mispStyles.Event) === JSON.stringify({ shape: 'square', color: '#111827', size: 26 }),
       'the surviving entry is exactly shape/color/size');

// ── Hostile values inside the accepted properties ────────────────────────────
clean = sanitizeConfigPatch({
    stixStyles: {
        indicator: { shape: 'star', color: 'url(https://evil.example/beacon)', size: 9999 },
        '<img src=x onerror=alert(1)>': { shape: 'circle', color: '#fff', size: 13 }
    },
    evil: { anything: true },
    layout: { type: 'evil' },
    pivotickUI: { mode: 'evil', sidebar: { collapsed: 'evil' } },
    maxNodes: 999999999,
    defaultSide: 'sideways',
    mispNetworkTypes: ['ip-src', '<script>alert(1)</script>', 'filename|md5']
});
assert(clean.stixStyles === undefined,
       'an entry with no valid property left is dropped entirely (unknown shape, url() colour, unbounded size)');
assert(clean.evil === undefined, 'an unknown top-level key is dropped');
assert(clean.layout === undefined, 'an unknown layout type is dropped');
assert(clean.pivotickUI === undefined, 'unknown UI mode and sidebar values are dropped');
assert(clean.maxNodes === undefined, 'an out-of-bounds maxNodes is dropped');
assert(clean.defaultSide === undefined, 'an unknown defaultSide is dropped');
assert(JSON.stringify(clean.mispNetworkTypes) === JSON.stringify(['ip-src', 'filename|md5']),
       'type lists keep plain identifiers (pipes included) and drop markup');

// ── A legitimate full config round-trips unchanged ───────────────────────────
const legit = {
    maxNodes: 3000,
    defaultSide: 'input',
    groupingThreshold: 3,
    layout: { type: 'force' },
    pivotickUI: { mode: 'full', sidebar: { collapsed: 'auto' } },
    stixStyles: {
        'threat-actor': { shape: 'square', color: '#f97316', size: 22 },
        '_default': { shape: 'circle', color: '#64748b', size: 13 }
    },
    mispStyles: { Event: { shape: 'square', color: 'rgb(37, 99, 235)', size: 26 } },
    mispNetworkTypes: ['ip-src', 'ip-dst', 'domain'],
    mispPayloadTypes: ['md5', 'sha256', 'malware-sample']
};
assert(JSON.stringify(sanitizeConfigPatch(legit)) === JSON.stringify(legit),
       'a legitimate config (hex and rgb() colours, boolean-free sidebar) passes through unchanged');
assert(sanitizeConfigPatch({ pivotickUI: { sidebar: { collapsed: true } } }).pivotickUI.sidebar.collapsed === true,
       'a boolean sidebar.collapsed is kept');

// ── applyConfig actually routes patches through the filter ───────────────────
const before = GRAPH_CONFIG.maxNodes;
applyConfig({
    maxNodes: 999999999,
    mispStyles: { Event: { color: '#123456', svgIcon: SVG_PAYLOAD } }
});
assert(GRAPH_CONFIG.maxNodes === before,
       'applyConfig ignores an out-of-bounds maxNodes from a hostile patch');
assert(GRAPH_CONFIG.mispStyles.Event.svgIcon === undefined,
       'applyConfig never lets svgIcon into the style map Pivotick renders');
assert(GRAPH_CONFIG.mispStyles.Event.color === '#123456',
       'the valid colour riding the same hostile patch still applies');
assert(GRAPH_CONFIG.mispStyles.Event.shape === 'square',
       'the merge still preserves untouched default fields');

// ── Wiring: the sanitizer sits inside applyConfig, before the merge ──────────
const src = readFileSync(join(graphJs, 'conversionGraph.js'), 'utf8');
const applyBody = src.slice(src.indexOf('export function applyConfig'));
assert(applyBody.indexOf('sanitizeConfigPatch(') !== -1
       && applyBody.indexOf('sanitizeConfigPatch(') < applyBody.indexOf('GRAPH_CONFIG.stixStyles[k]'),
       'applyConfig filters the patch before merging style maps');
