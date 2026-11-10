/* Client-side checks that attacker-controlled converted content cannot execute
 * in the conversion graph. Three sinks:
 *   1. "Open raw JSON" popup - must be built via DOM textContent, never markup.
 *   2. Pivotick node/edge labels - handed over verbatim, because Pivotick
 *      >= 1.5.0 inserts them as text. Pre-escaping them (which is what we did
 *      against 1.4.0, whose renderer used innerHTML) double-escapes ordinary
 *      CTI, so the check here is that labels are passed through untouched and
 *      that the library version the guarantee rests on is the one vendored.
 *   3. Properties-panel cells - a cell handed over as a string resolves to a
 *      text span in >= 1.5.0, but every cell is still wrapped as an element
 *      whose text was set via textContent, so the value cannot be parsed even
 *      if that resolution changes. Fires on hover (tooltip) and click (sidebar).
 * Run by the pytest wrapper (test_graph_xss_js.py): node graph_xss_check.mjs
 * Prints one line per check; exits non-zero on any failure. */
import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const graphJs = join(repoRoot, 'website/web/static/js/graph');
const pivotickStatic = join(repoRoot, 'website/web/static/pivotick');
const { renderRawJson, normaliseNodeTypes, textCell } = await import(join(graphJs, 'graphSafety.js'));
const { _nodeProperties } = await import(join(graphJs, 'conversionGraph.js'));

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
        appendChild(child) { this.children.push(child); }
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

// ── Sink 2: labels reach Pivotick verbatim, and it renders them as text ─────
const parsed = {
    nodes: [{ id: 'n1', data: {
        label: '<img src=x onerror=alert(1)>',
        sublabel: '<svg onload=alert(2)>',
        type: 'x', raw: { value: '<img src=x onerror=alert(1)>' }
    } }],
    edges: [{ from: 'n1', to: 'n2', data: { label: '<b onmouseover=alert(3)>' } }]
};
normaliseNodeTypes(parsed);

assert(parsed.nodes[0].data.label === '<img src=x onerror=alert(1)>',
       'a hostile node label is passed through verbatim (Pivotick inserts it as text)');
assert(!parsed.nodes[0].data.label.includes('&lt;'),
       'the node label is not HTML-escaped, so it cannot reach the viewer double-escaped');
assert(parsed.nodes[0].data.sublabel === '<svg onload=alert(2)>', 'the node sublabel is untouched');
assert(parsed.edges[0].data.label === '<b onmouseover=alert(3)>', 'the edge label is untouched');
assert(parsed.nodes[0].data.raw.value === '<img src=x onerror=alert(1)>',
       'the raw object is left untouched (tooltip/properties read it as text)');

// The regression that pre-escaping caused: ordinary CTI carries & and ", so an
// event info or a URL attribute must not arrive as entities.
const benign = {
    nodes: [{ id: 'a', data: { label: 'Phishing "ACME" & co', sublabel: 'filename' } }],
    edges: [{ from: 'a', to: 'b', data: { label: 'http://x/?a=1&b=2' } }]
};
normaliseNodeTypes(benign);
assert(benign.nodes[0].data.label === 'Phishing "ACME" & co',
       'an event info keeps its ampersand and quotes, not &amp;/&quot;');
assert(benign.edges[0].data.label === 'http://x/?a=1&b=2',
       'a URL label keeps its query-string ampersand');

// Label safety is Pivotick's guarantee from 1.5.0 on ("a string always renders
// as text", docs/security.md), so pin the version that promise came with. What
// gets pinned is the copy the browser loads, not the submodule: the two are
// coupled only by a manual bin/build_assets.py run, so a static/ copy left
// behind by a submodule bump would pass a check that read the submodule.
// build_assets.py records the version and the digests beside the bundle.
const bundleRecord = join(pivotickStatic, 'BUNDLE.json');
const hasRecord = existsSync(bundleRecord);
assert(hasRecord,
       'static/pivotick/BUNDLE.json exists, recording which Pivotick is served');

// Everything below reads the record, so a missing one stops here: assert only
// marks the run failed, and reading on would bury that FAIL under a stack.
if (hasRecord) {
    const { version, sha256 } = JSON.parse(readFileSync(bundleRecord, 'utf8'));
    const [major, minor] = version.split('.').map(Number);
    assert(major > 1 || (major === 1 && minor >= 5),
           `served Pivotick is >= 1.5.0, which renders labels as text (found ${version})`);

    for (const [name, digest] of Object.entries(sha256)) {
        const served = join(pivotickStatic, name);
        if (!existsSync(served)) {
            assert(false, `${name} is where BUNDLE.json says it is`);
            continue;
        }
        const actual = createHash('sha256').update(readFileSync(served)).digest('hex');
        assert(actual === digest,
               `${name} is the build BUNDLE.json recorded, not an edited or stale copy`);
    }

    // When the submodule is checked out it must agree, or static/ is a rebuild
    // behind. CI clones without it, so this part alone stays conditional.
    const pivotickPkg = join(repoRoot, 'submodules/pivotick/package.json');
    if (existsSync(pivotickPkg)) {
        const pkg = JSON.parse(readFileSync(pivotickPkg, 'utf8'));
        assert(pkg.version === version,
               `the served bundle is built from the vendored submodule (static ${version}, submodule ${pkg.version})`);
    } else {
        console.log('skip: Pivotick submodule not checked out, rebuild staleness not verified');
    }
}

// ── Sink 3: properties-panel cells ──────────────────────────────────────────
// Pivotick's own resolver runs `template.innerHTML` on a string cell and returns
// the parsed element, so the value must reach it as an element carrying text.
globalThis.document = {
    createElement(tag) {
        return {
            tagName: tag, _text: '',
            set textContent(v) { this._text = String(v); },
            get textContent() { return this._text; },
            set innerHTML(v) { throw new Error('textCell must never assign innerHTML: ' + v); }
        };
    }
};

const cell = textCell('<img src=x onerror=alert(1)>');
assert(cell.tagName === 'span', 'a property cell is a real element, not a string');
assert(cell.textContent === '<img src=x onerror=alert(1)>',
       'the cell carries the payload as text, verbatim and unescaped for display');

// A node `type` is a style key, but for STIX it comes from the input bundle, so
// the charset is restricted to keep it usable as one (the ego graph passes it
// straight through as a bare string).
const typed = {
    nodes: [
        { id: 'a', data: { label: 'x', type: 'grouping<img src=x onerror=alert(1)>' } },
        { id: 'b', data: { label: 'x', type: 'ipv4-addr' } }
    ],
    edges: []
};
normaliseNodeTypes(typed);
assert(!/[<>"']/.test(typed.nodes[0].data.type),
       'a hostile node type keeps no HTML specials for the ego-graph property map');
assert(typed.nodes[1].data.type === 'ipv4-addr',
       'a real STIX type is left alone, so style lookups still match');

// _nodeProperties feeds both the hover tooltip and the sidebar; every cell it
// emits must be an element (name and value alike), so Pivotick's resolver never
// HTML-parses a converted string. childAttrs keys sit in the name position too.
const hostile = {
    getData: () => ({
        raw: {
            value: '<img src=x onerror=alert(1)>',
            description: 'desc <img src=x onerror=alert(2)>'
        },
        childAttrs: { '<b onmouseover=alert(3)>': 'malware <img src=x>' }
    })
};
const rows = _nodeProperties(hostile);
assert(rows.length > 0 && rows.every(r => r.name.tagName === 'span' && r.value.tagName === 'span'),
       'every _nodeProperties cell, name and value, is a span element - never a bare string');
const desc = rows.find(r => r.value.textContent.startsWith('desc '));
assert(desc && desc.value.textContent === 'desc <img src=x onerror=alert(2)>',
       'a hostile value is carried verbatim as text, unescaped and never parsed');
const key = rows.find(r => r.name.textContent.startsWith('<b'));
assert(key && key.name.tagName === 'span',
       'a hostile childAttrs key in the name position is wrapped as an element too');
assert(!rows.some(r => r.value.textContent === ''),
       'the empty separator row is filtered out before wrapping (an element is always truthy)');

// ── The component actually uses the safe helpers ────────────────────────────
const src = readFileSync(join(graphJs, 'conversionGraph.js'), 'utf8');
assert(!/document\.write/.test(src),
       'conversionGraph.js no longer calls document.write');
assert(/renderRawJson\(/.test(src),
       'conversionGraph.js opens the raw-JSON popup via renderRawJson');
assert(/normaliseNodeTypes\(/.test(src),
       'conversionGraph.js routes the parsed graph through normaliseNodeTypes');
assert(src.indexOf('normaliseNodeTypes(') < src.indexOf('new window.Pivotick('),
       'the node types are normalised before the graph is handed to Pivotick');

// The inline edgePropertiesMap cannot be imported, so assert on its source that
// no cell is left as a bare string (Fix: stop relying on label escaping).
const edgeMap = src.slice(src.indexOf('edgePropertiesMap:'));
const edgeMapBody = edgeMap.slice(0, edgeMap.indexOf(']'));
const edgeCells = edgeMapBody.match(/\b(?:name|value):/g) || [];
const wrappedCells = edgeMapBody.match(/\b(?:name|value):\s*textCell\(/g) || [];
assert(edgeCells.length >= 6 && edgeCells.length === wrappedCells.length,
       'every edge property cell (all three rows, name and value) is wrapped in textCell');
