/* Client-side checks that a stored tag icon can never reach an HTML sink.
 * Run by the pytest wrapper (test_tag_icon_js.py): node tag_icon_sink_check.mjs
 * Prints one line per check; exits non-zero on any failure. */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tagsJs = join(repoRoot, 'website/web/static/js/tags');
const { mapIcon } = await import(join(tagsJs, 'utils/galaxie.js'));

const assert = (cond, msg) => {
    if (!cond) { console.error('FAIL: ' + msg); process.exitCode = 1; }
    else console.log('ok: ' + msg);
};

// mapIcon output is bound as a class value, never parsed as HTML
assert(!mapIcon('"><svg onload=alert(1)>').includes('<'),
       'mapIcon never emits markup, even for a hostile stored icon');
assert(mapIcon('shield-halved') === 'fas fa-shield-halved',
       'mapIcon maps a catalogue slug to its FA class pair');
assert(mapIcon('') === 'fas fa-tag' && mapIcon(null) === 'fas fa-tag',
       'mapIcon falls back to the generic tag icon');

// No component template renders the icon through v-html
for (const file of ['singleTagDisplay.js', 'multiTagFilter.js']) {
    const src = readFileSync(join(tagsJs, file), 'utf8');
    assert(!/v-html\s*=\s*"mapIcon/.test(src),
           `${file} binds the icon as a class, not v-html`);
}
