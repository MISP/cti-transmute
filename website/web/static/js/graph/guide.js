// ─────────────────────────────────────────────────────────────────────────────
//  Graph guide — fills the tables of "How to read this graph" from the code.
//
//  Families, colours, emblems, element sizes, link styles, relation colours,
//  TLP colours and views are read from vocabulary.js and views.js, the same
//  objects the graph draws with: the guide cannot drift from the graph.
//  Everything is written as text (textContent), never as HTML.
// ─────────────────────────────────────────────────────────────────────────────

import { ELEMENTS, FAMILIES, EDGE_KINDS, RELATION_COLORS, TLP } from './model/vocabulary.js'
import { VIEWS } from './views.js'

const EXAMPLES = {
    container: 'MISP event, STIX report or grouping',
    network: 'ip-dst, domain, url, hostname · ipv4-addr, domain-name, network-traffic',
    file: 'md5, sha256, filename, file object · file, artifact',
    email: 'email-src, email-subject, email object · email-addr, email-message',
    host: 'regkey, mutex, process · windows-registry-key, process, software',
    threat: 'threat-actor, malware, tool, campaign, intrusion-set',
    ttp: 'ATT&CK technique, attack-pattern, course-of-action',
    vuln: 'vulnerability (CVE), weakness',
    identity: 'identity, location, organisation, person, sector',
    knowledge: 'text, comment, link, note, opinion, observed-data',
}

const ELEMENT_TEXT = {
    container: 'The document itself: a MISP event, a STIX report or grouping.',
    entity: 'A STIX domain object: malware, threat actor, attack pattern…',
    object: 'A MISP object grouping attributes (file, domain-ip, email…).',
    indicator: 'A detection rule: a STIX indicator and its pattern.',
    context: 'Knowledge attached to other nodes: galaxy clusters, tags, notes.',
    observable: 'A single value: a MISP attribute, a STIX cyber-observable.',
    meta: 'Markings and definitions (not drawn by default).',
}

const LINK_SOURCE = {
    contains: 'Event → objects and attributes, object → its attributes, report → object_refs.',
    reference: 'MISP object references (connects-to, drops…).',
    relationship: 'STIX relationships (uses, indicates, targets…), and a report → its author.',
    sighting: 'STIX sightings: who saw an object, how many times.',
    'embedded-ref': 'Other STIX references: resolves_to_refs, src_ref, sample_refs…',
    galaxy: 'A node → its galaxy cluster or tag.',
    correlation: 'The same value in two events of the document.',
    pattern: 'A STIX indicator → the observable its pattern names (when no relationship says so).',
}

const el = (tag, text, cls) => {
    const e = document.createElement(tag)
    if (text !== undefined) e.textContent = text
    if (cls) e.className = cls
    return e
}

function swatch(color) {
    const s = el('span', '', 'graph-guide-swatch')
    s.style.background = color
    return s
}

function emblem(icon, color) {
    const span = el('span', '', 'graph-guide-emblem')
    span.style.borderColor = color
    span.style.color = color
    const i = el('i', '', `fa-solid ${icon}`)
    i.setAttribute('aria-hidden', 'true')
    span.append(i)
    return span
}

function line(kind) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '56'); svg.setAttribute('height', '12'); svg.setAttribute('aria-hidden', 'true')
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    l.setAttribute('x1', '2'); l.setAttribute('y1', '6'); l.setAttribute('x2', '54'); l.setAttribute('y2', '6')
    l.setAttribute('stroke', kind.color)
    l.setAttribute('stroke-width', String(Math.max(1.2, kind.width)))
    if (kind.dashed) l.setAttribute('stroke-dasharray', '5 4')
    svg.append(l)
    return svg
}

function row(cells) {
    const tr = el('tr')
    for (const c of cells) {
        const td = el('td')
        if (c instanceof Node) td.append(c); else td.textContent = c ?? ''
        tr.append(td)
    }
    return tr
}

function fill(root, name, rows) {
    const body = root.querySelector(`[data-guide="${name}"] tbody`)
    if (body) body.replaceChildren(...rows)
}

let filled = false

/** Fill the guide's generated tables (once). */
export function fillGraphGuide(root) {
    if (!root || filled) return
    filled = true

    fill(root, 'families', Object.entries(FAMILIES).map(([key, f]) => {
        const name = el('span'); name.append(swatch(f.color), document.createTextNode(` ${f.label}`))
        return row([name, f.color, emblem(f.icon, f.color), EXAMPLES[key] || ''])
    }))

    fill(root, 'elements', Object.entries(ELEMENTS)
        .sort((a, b) => b[1].size - a[1].size)
        .map(([key, e]) => row([e.label, `${e.size} px`, ELEMENT_TEXT[key] || ''])))

    fill(root, 'links', Object.entries(EDGE_KINDS).map(([key, k]) =>
        row([line(k), k.label, k.on ? 'Yes' : 'No (switch on in the legend)', LINK_SOURCE[key] || ''])))

    fill(root, 'views', Object.values(VIEWS).map((v) => row([v.label, v.description])))

    const rel = root.querySelector('[data-guide="relations"]')
    if (rel) rel.replaceChildren(el('span', 'Relationship colours:', 'graph-guide-chips-title'),
        ...Object.entries(RELATION_COLORS).map(([name, color]) => {
            const c = el('span', name, 'chip'); c.style.setProperty('--c', color); return c
        }))

    const tlp = root.querySelector('[data-guide="tlp"]')
    if (tlp) {
        const seen = new Set()
        tlp.replaceChildren(el('span', 'TLP badges:', 'graph-guide-chips-title'), ...Object.values(TLP)
            .filter((t) => !seen.has(t.label) && seen.add(t.label))
            .map((t) => {
                const c = el('span', t.label, 'graph-guide-tlp')
                c.style.background = t.color; c.style.color = t.ink
                return c
            }))
    }
}
