/* Client-side checks that the conversion-table search highlight escapes
 * attacker-controlled cell values before injecting <mark> markup.
 * Run by the pytest wrapper (test_conversion_table_js.py): node conversion_table_highlight_check.mjs
 * Prints one line per check; exits non-zero on any failure. */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const graphJs = join(repoRoot, 'website/web/static/js/graph');
const { escapeHtml, highlightMatches } = await import(join(graphJs, 'searchHighlight.js'));

const assert = (cond, msg) => {
    if (!cond) { console.error('FAIL: ' + msg); process.exitCode = 1; }
    else console.log('ok: ' + msg);
};

// A hostile stored cell value must render as escaped text, even while a
// search term keeps the row visible
const payload = '<img src=x onerror=alert(1)>';
const marked = highlightMatches(payload, 'img');
assert(!marked.includes('<img'), 'hostile cell value never survives as markup');
assert(marked.includes('&lt;'), 'hostile cell value is HTML-escaped');
assert(marked.includes('<mark class="ctbl-mark">img</mark>'),
       'search matches still get the <mark> wrapper');

// The <mark> tags are the only markup that survives
const stripped = marked.replaceAll('<mark class="ctbl-mark">', '').replaceAll('</mark>', '');
assert(!stripped.includes('<'), '<mark> is the only markup in the output');

// A query containing HTML specials matches the escaped text
assert(highlightMatches(payload, '<img').includes('<mark class="ctbl-mark">&lt;img</mark>'),
       'query with HTML specials still matches (both sides escaped alike)');

// Regex metacharacters in the query are literals, not patterns
assert(highlightMatches('ip 1.2.3.4 seen', '1.2.3.4').includes('<mark class="ctbl-mark">1.2.3.4</mark>'),
       'regex metacharacters in the query match literally');
assert(highlightMatches('call(x)', '(x)').includes('<mark class="ctbl-mark">(x)</mark>'),
       'unbalanced-regex query does not throw');

// No search term: plain escaping, no <mark>
assert(highlightMatches(payload, '') === escapeHtml(payload),
       'empty query returns the escaped text verbatim');
assert(highlightMatches('benign value', 'x') === 'benign value',
       'non-matching benign text passes through unchanged');

// Matching stays case-insensitive
assert(highlightMatches('MALWARE sample', 'malware').includes('<mark class="ctbl-mark">MALWARE</mark>'),
       'matching is case-insensitive and preserves the original casing');

// The component's v-html sink goes through the escaping helper
const tableSrc = readFileSync(join(graphJs, 'conversionTable.js'), 'utf8');
assert(/import\s*{\s*highlightMatches\s*}\s*from\s*'\.\/searchHighlight\.js'/.test(tableSrc),
       'conversionTable.js imports highlightMatches from ./searchHighlight.js');
assert(!/\.replace\([^)]*<mark/.test(tableSrc),
       'conversionTable.js builds no <mark> markup of its own');
