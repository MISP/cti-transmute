/* Client-side checks that attacker-controlled converted content cannot execute
 * in the conversion graph. Two sinks (review §2.2):
 *   1. "Open raw JSON" popup - must be built via DOM textContent, never markup.
 *   2. Pivotick node/edge labels - must be HTML-escaped before the library
 *      renders them through innerHTML.
 * Run by the pytest wrapper (test_graph_xss_js.py): node graph_xss_check.mjs
 * Prints one line per check; exits non-zero on any failure. */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const graphJs = join(repoRoot, 'website/web/static/js/graph');
const { escapeGraphLabels, renderRawJson } = await import(join(graphJs, 'graphSafety.js'));

const assert = (cond, msg) => {
    if (!cond) { console.error('FAIL: ' + msg); process.exitCode = 1; }
    else console.log('ok: ' + msg);
};

// ── Sink 1: the raw-JSON popup builder ──────────────────────────────────────
// Minimal DOM double: every element records its textContent and flags any
// innerHTML write, so the test proves no markup path is ever taken.
function fakeWindow() {
    const innerHTMLWrites = [];
    const makeEl = (tag) => ({
        tagName: tag,
        style: {},
        children: [],
        _text: '',
        set textContent(v) { this._text = String(v); },
        get textContent() { return this._text; },
        set innerHTML(v) { innerHTMLWrites.push(v); },
        appendChild(child) { this.children.push(child); },
    });
    const body = makeEl('body');
    return { innerHTMLWrites, body, win: { document: { body, createElement: makeEl } } };
}

const payload = { value: '</pre><img src=x onerror=alert(document.domain)>' };
const { win, body, innerHTMLWrites } = fakeWindow();
const pre = renderRawJson(win, payload, false);

assert(pre.tagName === 'pre', 'raw JSON goes into a <pre> built with createElement');
assert(pre.textContent === JSON.stringify(payload, null, 2),
       'raw JSON is set as textContent, still formatted and readable');
assert(pre.textContent.includes('</pre><img src=x onerror=alert(document.domain)>'),
       'hostile payload is preserved verbatim as text, not parsed');
assert(innerHTMLWrites.length === 0,
       'renderRawJson never assigns innerHTML on any element');
assert(body.children.includes(pre), 'the <pre> is appended to the popup body');

// ── Sink 2: label escaping before Pivotick ──────────────────────────────────
const parsed = {
    nodes: [{ id: 'n1', data: {
        label: '<img src=x onerror=alert(1)>',
        sublabel: '<svg onload=alert(2)>',
        type: 'x', raw: { value: '<img src=x onerror=alert(1)>' },
    } }],
    edges: [{ from: 'n1', to: 'n2', data: { label: '<b onmouseover=alert(3)>' } }],
};
escapeGraphLabels(parsed);

assert(!parsed.nodes[0].data.label.includes('<img'),
       'node label is escaped before Pivotick renders it via innerHTML');
assert(parsed.nodes[0].data.label.includes('&lt;img'), 'node label is HTML-escaped');
assert(!parsed.nodes[0].data.sublabel.includes('<svg'), 'node sublabel is escaped');
assert(!parsed.edges[0].data.label.includes('<b'), 'edge label is escaped');
assert(parsed.nodes[0].data.raw.value === '<img src=x onerror=alert(1)>',
       'the raw object is left untouched (tooltip/properties read it as text)');

// Benign labels are unchanged - no double-escaping artifacts for real data
const benign = { nodes: [{ id: 'a', data: { label: 'malware.exe', sublabel: 'filename' } }], edges: [] };
escapeGraphLabels(benign);
assert(benign.nodes[0].data.label === 'malware.exe',
       'a benign label passes through unchanged');

// ── The component actually uses the safe helpers ────────────────────────────
const src = readFileSync(join(graphJs, 'conversionGraph.js'), 'utf8');
assert(!/document\.write/.test(src),
       'conversionGraph.js no longer calls document.write');
assert(/renderRawJson\(/.test(src),
       'conversionGraph.js opens the raw-JSON popup via renderRawJson');
assert(/escapeGraphLabels\(/.test(src),
       'conversionGraph.js escapes labels via escapeGraphLabels before rendering');
assert(src.indexOf('escapeGraphLabels(') < src.indexOf('new window.Pivotick('),
       'labels are escaped before the parsed graph is handed to Pivotick');
