/* Client-side checks that a hostile remote MISP instance cannot execute
 * script through the "FROM MISP INSTANCE" event browser. Every field of a
 * listed event (id, info, date, org, tag names and colours) is authored on
 * the remote instance, so the row builder must never hand any of it to
 * innerHTML - rows, badges and tooltips are DOM-built, and the sensitivity
 * overlay's TLP badges and distribution label are text-only.
 * Run by the pytest wrapper (test_misp_rows_xss_js.py): node misp_rows_xss_check.mjs
 * Prints one line per check; exits non-zero on any failure. */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Fake DOM: records structure and throws on any innerHTML assignment, so
// simply reaching the end proves no markup path is ever taken.
function makeEl(tag) {
    return {
        tagName: tag,
        children: [],
        attrs: {},
        dataset: {},
        style: {},
        _text: '',
        set textContent(v) { this._text = String(v); },
        get textContent() { return this._text; },
        set innerHTML(v) { throw new Error('innerHTML must never be assigned: ' + v); },
        setAttribute(name, value) { this.attrs[name] = String(value); },
        appendChild(child) { this.children.push(child); return child; }
    };
}
globalThis.document = {
    createElement: makeEl,
    createTextNode: (v) => ({ nodeType: 3, textContent: String(v) })
};

const { buildEventRow, threatBadge, tagBadges, sensitivityTagBadge } =
    await import(join(repoRoot, 'website/web/static/js/misp/mispEventRows.js'));

const assert = (cond, msg) => {
    if (!cond) { console.error('FAIL: ' + msg); process.exitCode = 1; }
    else console.log('ok: ' + msg);
};

const payload = 'Test"><img src=x onerror=alert(document.domain)>';

// ── A fully hostile event row ────────────────────────────────────────────────
const hostile = {
    id: '7"><script>alert(1)</script>',
    info: payload,
    date: '2026-07-26<img src=x onerror=alert(2)>',
    org: 'Evil"><svg onload=alert(3)>',
    attribute_count: '13<b>',
    threat_level: 'High',
    distribution: '4',
    tags: [{ name: 'tlp:red"><img src=x onerror=alert(4)>', colour: 'red;background:url(https://evil.example)' }]
};
const tr = buildEventRow(hostile, true);
assert(tr.tagName === 'tr' && tr.children.length === 9, 'the row still renders all nine cells');

const check = tr.children[0].children[0];
assert(check.type === 'checkbox' && check.checked === true && check.dataset.id === hostile.id,
       'the checkbox keeps the hostile id as an inert data attribute and stays checked');

assert(tr.children[1].children[0].textContent === '#' + hostile.id,
       'the id badge carries the hostile id verbatim as text');
assert(tr.children[1].children[1].attrs.title === 'Sharing Group',
       'distribution 4 still renders the sharing-group icon');

const info = tr.children[2].children[0];
assert(info.attrs.title === payload,
       'the hostile info lands in the title attribute via setAttribute, verbatim');
assert(info.textContent === payload,
       'the hostile info lands in the cell text via textContent, verbatim');

assert(tr.children[3].textContent === hostile.date, 'the hostile date is carried as text');
assert(tr.children[4].textContent === hostile.org && tr.children[4].attrs.title === hostile.org,
       'the hostile org is text in both the cell and its tooltip');
assert(tr.children[5].textContent === hostile.attribute_count,
       'the attribute count is carried as text');

const tag = tr.children[7].children[0];
assert(tag.attrs.title === hostile.tags[0].name,
       'the full hostile tag name is an inert title attribute');
assert(tag.textContent === hostile.tags[0].name.slice(0, 25) + '…',
       'the visible tag label is the truncated name, as text');
assert(tag.style.background === '#888888',
       'a non-hex tag colour is rejected and falls back to the neutral default');

const btn = tr.children[8].children[0];
assert(btn.className === 'btn btn-xs btn-primary mi-select-btn' && btn.dataset.id === hostile.id,
       'the Select button survives with the hostile id as an inert data attribute');
assert(btn.children[0].className === 'fas fa-check me-1' && btn.children[1].textContent === 'Select',
       'the Select button keeps its icon and label');

// ── A benign event renders every column unchanged ────────────────────────────
const benign = {
    id: 42, info: 'Phishing campaign', date: '2026-07-01', org: 'CIRCL',
    attribute_count: 12, threat_level: 'Medium', distribution: '3',
    tags: [
        { name: 'tlp:white', colour: '#FFCC00' },
        { name: 'type:osint', colour: '#004646' },
        { name: 'source:feed', colour: '#000000' },
        { name: 'extra:one', colour: '#888888' }
    ]
};
const tr2 = buildEventRow(benign, false);
assert(tr2.children[0].children[0].checked === false, 'an unselected row is unchecked');
assert(tr2.children[1].children.length === 1, 'distribution 3 draws no restriction icon');
assert(tr2.children[2].children[0].textContent === 'Phishing campaign'
       && tr2.children[5].textContent === '12',
       'a benign row keeps its info and attribute count');
const threatCell = tr2.children[6];
assert(threatCell.children[0].className === 'badge bg-warning'
       && threatCell.children[0].textContent === 'Medium',
       'the threat badge maps Medium to bg-warning');
const tagCell = tr2.children[7];
assert(tagCell.children.length === 4 && tagCell.children[3].textContent === '+1',
       'three tag badges plus the +N overflow marker');
assert(tagCell.children[0].style.color === '#111' && tagCell.children[2].style.color === '#fff',
       'badge text colour still adapts to light and dark tag colours');

// ── Badge helpers on their own ───────────────────────────────────────────────
assert(threatBadge('') === null, 'no threat level renders no badge');
assert(threatBadge('Bogus').className === 'badge bg-secondary',
       'an unknown threat level falls back to the secondary badge');
assert(tagBadges(null)[0].textContent === '—', 'no tags renders the muted dash');

const swBadge = sensitivityTagBadge({ name: payload, colour: 'javascript:alert(1)' });
assert(swBadge.textContent === payload,
       'the sensitivity-overlay badge carries a hostile tag name verbatim as text');
assert(swBadge.style.background === '#cc2200',
       'the sensitivity-overlay badge rejects a non-hex colour');
assert(sensitivityTagBadge({ name: 'tlp:red', colour: '#CC0033' }).style.background === '#CC0033',
       'a legitimate hex tag colour is kept');

// ── The view actually wires the safe builders ────────────────────────────────
const tpl = readFileSync(
    join(repoRoot, 'website/web/templates/conversions/misp_to_stix.html'), 'utf8');
assert(/mispEventRows\.js/.test(tpl) && /buildEventRow\(/.test(tpl),
       'the view imports and uses buildEventRow for the event table');
assert(!/tr\.innerHTML/.test(tpl),
       'the interpolated row template is gone');
assert(!/\$\{ev\.(info|org|date|id|attribute_count)/.test(tpl),
       'no remote event field is interpolated into markup anymore');
assert(!/\$\{tagHtml\}/.test(tpl) && !/\$\{t\.name\}/.test(tpl),
       'the sensitivity overlay no longer interpolates tag names');
assert(!/\$\{distInfo\.label\}/.test(tpl) && /sw-dist-label/.test(tpl),
       'the distribution label (remote sharing-group name) is set as text');
assert(/sensitivityTagBadge\(/.test(tpl),
       'the sensitivity overlay builds its TLP badges via sensitivityTagBadge');
assert(!/\$\{msg\}/.test(tpl) && /\.flash-msg'\)\.textContent = msg/.test(tpl),
       'flash toasts set the message as text, never as markup');
