/* Round-trip checks for the shared client date helper (static/js/datetime.js).
 * Run under a fixed non-UTC zone by the pytest wrapper (test_datetime_js.py):
 *   TZ=Europe/Luxembourg node datetime_check.mjs
 * Prints one line per check; exits non-zero on any failure. */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
global.window = {};
eval(readFileSync(join(repoRoot, 'website/web/static/js/datetime.js'), 'utf8'));
const { parse, formatDate, formatDateTime, timeAgo, timeAgoOrDate } = window.ctiDate;

const assert = (cond, msg) => {
    if (!cond) { console.error('FAIL: ' + msg); process.exitCode = 1; }
    else console.log('ok: ' + msg);
};

// The original bug: a fresh UTC timestamp must not show the viewer's offset
const nowIso = new Date().toISOString().slice(0, 19) + 'Z';
assert(timeAgo(nowIso) === 'just now', `fresh Z timestamp is "just now" in TZ=${process.env.TZ}`);
const h2 = new Date(Date.now() - 2 * 3600 * 1000).toISOString().slice(0, 19) + 'Z';
assert(timeAgo(h2) === '2h ago', '2-hour-old Z timestamp is "2h ago"');

// Wire-format round trip: the Z string parses back to the same UTC instant
assert(parse('2026-07-13T09:05:00Z').getTime() === Date.UTC(2026, 6, 13, 9, 5, 0),
       'Z string parses as the UTC instant');

// Legacy tolerance and calendar dates
assert(parse('2026-07-13 09:05') !== null, 'legacy offset-less string still parses');
const cal = parse('2026-07-13');
assert(cal.getFullYear() === 2026 && cal.getMonth() === 6 && cal.getDate() === 13,
       'date-only value stays on its calendar day (local midnight, no UTC shift)');

// Fallback semantics preserved from the per-page formatters
assert(formatDate(null) === '' && formatDate('') === '', 'formatDate falsy renders empty');
assert(formatDateTime(null) === 'N/A', 'formatDateTime default fallback');
assert(formatDateTime(null, '—') === '—', 'formatDateTime custom fallback');
assert(formatDateTime('garbage') === 'garbage', 'unparseable passes through');
assert(timeAgo('garbage') === '', 'timeAgo on garbage renders empty');
assert(formatDate('2026-07-13T09:05:00Z').includes('2026'), 'formatDate renders the year');

/* The hybrid the bulk-tag jobs card reads with: relative while the row is
 * fresh, a calendar date once it is not. Run against a fixed clock - the
 * helper reads the time once, through Date.now(), so stubbing it pins the
 * day boundary and the year rule exactly rather than approximately. */
const realNow = Date.now;
Date.now = () => Date.UTC(2026, 9, 19, 12, 0, 0);
assert(timeAgoOrDate('2026-10-18T13:00:00Z') === '23h ago', 'under a day stays relative');
const pastDay = timeAgoOrDate('2026-10-18T11:00:00Z');
assert(!pastDay.includes('ago') && pastDay.includes('18'),
       'past a day it is the calendar day, 25 hours included');
assert(!/\d{4}/.test(pastDay), 'the current year is left off');
assert(timeAgoOrDate('2024-09-23T10:00:00Z').includes('2024'), 'another year is spelled out');
assert(timeAgoOrDate('garbage') === 'garbage', 'unparseable passes through');
Date.now = realNow;
