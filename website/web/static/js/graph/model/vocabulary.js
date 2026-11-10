// ─────────────────────────────────────────────────────────────────────────────
//  Graph vocabulary — how every MISP and STIX type is drawn.
//
//  One table for both sides, so the same thing looks the same whichever
//  format it came from: an `ip-dst` MISP attribute and an `ipv4-addr` STIX
//  observable share a family (colour) and an icon.
//
//    element  what the node *is* in the model → its SHAPE
//    family   what domain it belongs to       → its COLOUR
//    icon     the Font Awesome 6 glyph drawn inside (the site already ships FA 6.3)
//
//  Nothing here knows about Pivotick: the render layer (render/styles.js)
//  turns these entries into node and edge styles.
// ─────────────────────────────────────────────────────────────────────────────

/** Element → shape. Containers are squares, domain objects hexagons,
 *  detection logic triangles, observables circles. */
export const ELEMENTS = {
    container:  { label: 'Container',  shape: 'square',   size: 22 },
    entity:     { label: 'Entity',     shape: 'hexagon',  size: 18 },
    indicator:  { label: 'Indicator',  shape: 'triangle', size: 16 },
    object:     { label: 'Object',     shape: 'hexagon',  size: 16 },
    observable: { label: 'Observable', shape: 'circle',   size: 12 },
    context:    { label: 'Context',    shape: 'square',   size: 14 },
    meta:       { label: 'Marking',    shape: 'square',   size: 10 },
}

/** Family → colour. Ten hues at most, each readable as a fill under a white
 *  glyph in both themes (all reach 4.5:1 against #fff). */
export const FAMILIES = {
    container: { label: 'Report / Event',      color: '#1e4fd8' },
    network:   { label: 'Network',             color: '#0369a1' },
    file:      { label: 'File & payload',      color: '#c2410c' },
    email:     { label: 'Email',               color: '#be185d' },
    host:      { label: 'Host & system',       color: '#6d28d9' },
    threat:    { label: 'Threat',              color: '#b91c1c' },
    ttp:       { label: 'Technique & defence', color: '#a16207' },
    vuln:      { label: 'Vulnerability',       color: '#a21caf' },
    identity:  { label: 'Identity & place',    color: '#0f766e' },
    knowledge: { label: 'Notes & references',  color: '#475569' },
}

/** Official FIRST TLP 2.0 colours, used for badges only. */
export const TLP = {
    'clear':        { label: 'TLP:CLEAR',        color: '#ffffff', ink: '#111827' },
    'white':        { label: 'TLP:CLEAR',        color: '#ffffff', ink: '#111827' },
    'green':        { label: 'TLP:GREEN',        color: '#33ff00', ink: '#052e00' },
    'amber':        { label: 'TLP:AMBER',        color: '#ffc000', ink: '#3b2a00' },
    'amber+strict': { label: 'TLP:AMBER+STRICT', color: '#ffc000', ink: '#3b2a00' },
    'red':          { label: 'TLP:RED',          color: '#ff2b2b', ink: '#ffffff' },
}

// type → [family, icon]. Keys are prefixed by side: `misp:` attribute types,
// `misp-object:` object names, `stix:` STIX types. Unknown types fall back to
// their element's generic entry (see `describe`).
const T = (family, icon) => ({ family, icon })

const MISP_ATTRIBUTES = {
    // network
    'ip-src': T('network', 'fa-network-wired'), 'ip-dst': T('network', 'fa-network-wired'),
    'ip-src|port': T('network', 'fa-network-wired'), 'ip-dst|port': T('network', 'fa-network-wired'),
    'domain': T('network', 'fa-globe'), 'domain|ip': T('network', 'fa-globe'),
    'hostname': T('network', 'fa-server'), 'hostname|port': T('network', 'fa-server'),
    'url': T('network', 'fa-link'), 'uri': T('network', 'fa-link'), 'link': T('knowledge', 'fa-arrow-up-right-from-square'),
    'port': T('network', 'fa-plug'), 'AS': T('network', 'fa-tower-broadcast'),
    'mac-address': T('network', 'fa-ethernet'), 'user-agent': T('network', 'fa-window-maximize'),
    'ja3-fingerprint-md5': T('network', 'fa-fingerprint'), 'snort': T('network', 'fa-shield-halved'),
    'x509-fingerprint-sha1': T('network', 'fa-certificate'), 'x509-fingerprint-sha256': T('network', 'fa-certificate'),
    // file & payload
    'md5': T('file', 'fa-hashtag'), 'sha1': T('file', 'fa-hashtag'), 'sha256': T('file', 'fa-hashtag'),
    'sha512': T('file', 'fa-hashtag'), 'ssdeep': T('file', 'fa-hashtag'), 'imphash': T('file', 'fa-hashtag'),
    'tlsh': T('file', 'fa-hashtag'), 'authentihash': T('file', 'fa-hashtag'),
    'filename': T('file', 'fa-file'), 'filename|md5': T('file', 'fa-file'), 'filename|sha1': T('file', 'fa-file'),
    'filename|sha256': T('file', 'fa-file'), 'malware-sample': T('file', 'fa-biohazard'),
    'attachment': T('file', 'fa-paperclip'), 'size-in-bytes': T('file', 'fa-weight-hanging'),
    'mime-type': T('file', 'fa-file-code'), 'yara': T('file', 'fa-magnifying-glass'), 'sigma': T('file', 'fa-magnifying-glass'),
    // email
    'email': T('email', 'fa-at'), 'email-src': T('email', 'fa-envelope'), 'email-dst': T('email', 'fa-envelope-open'),
    'email-subject': T('email', 'fa-heading'), 'email-attachment': T('email', 'fa-paperclip'),
    'email-body': T('email', 'fa-align-left'), 'email-header': T('email', 'fa-list'),
    'email-reply-to': T('email', 'fa-reply'), 'email-message-id': T('email', 'fa-id-badge'),
    // host
    'regkey': T('host', 'fa-key'), 'regkey|value': T('host', 'fa-key'), 'mutex': T('host', 'fa-lock'),
    'windows-service-name': T('host', 'fa-gears'), 'process-state': T('host', 'fa-microchip'),
    'named pipe': T('host', 'fa-grip-lines'), 'pdb': T('host', 'fa-bug-slash'),
    'cpe': T('host', 'fa-box'), 'target-machine': T('host', 'fa-desktop'),
    // people & places
    'target-user': T('identity', 'fa-user'), 'target-email': T('identity', 'fa-user'),
    'target-org': T('identity', 'fa-building'), 'target-location': T('identity', 'fa-location-dot'),
    'threat-actor': T('threat', 'fa-user-secret'), 'campaign-name': T('threat', 'fa-flag'),
    'whois-registrant-email': T('identity', 'fa-address-card'), 'whois-registrant-name': T('identity', 'fa-address-card'),
    'phone-number': T('identity', 'fa-phone'), 'btc': T('identity', 'fa-bitcoin-sign'),
    // knowledge
    'vulnerability': T('vuln', 'fa-shield-virus'), 'weakness': T('vuln', 'fa-shield-virus'),
    'text': T('knowledge', 'fa-align-left'), 'comment': T('knowledge', 'fa-comment'),
    'other': T('knowledge', 'fa-circle-question'), 'datetime': T('knowledge', 'fa-clock'),
}

const MISP_OBJECTS = {
    'file': T('file', 'fa-file-lines'), 'pe': T('file', 'fa-file-code'), 'pe-section': T('file', 'fa-layer-group'),
    'elf': T('file', 'fa-file-code'), 'macho': T('file', 'fa-file-code'), 'lnk': T('file', 'fa-file-export'),
    'domain-ip': T('network', 'fa-globe'), 'url': T('network', 'fa-link'), 'ip-port': T('network', 'fa-network-wired'),
    'network-connection': T('network', 'fa-right-left'), 'network-socket': T('network', 'fa-right-left'),
    'dns-record': T('network', 'fa-book'), 'whois': T('identity', 'fa-address-card'),
    'x509': T('network', 'fa-certificate'), 'http-request': T('network', 'fa-arrow-right-arrow-left'),
    'email': T('email', 'fa-envelope'), 'process': T('host', 'fa-microchip'),
    'registry-key': T('host', 'fa-key'), 'user-account': T('identity', 'fa-user'),
    'person': T('identity', 'fa-user'), 'organization': T('identity', 'fa-building'),
    'geolocation': T('identity', 'fa-location-dot'), 'vulnerability': T('vuln', 'fa-shield-virus'),
    'attack-pattern': T('ttp', 'fa-crosshairs'), 'course-of-action': T('ttp', 'fa-kit-medical'),
    'report': T('knowledge', 'fa-file-lines'), 'annotation': T('knowledge', 'fa-note-sticky'),
    'yara': T('file', 'fa-magnifying-glass'), 'sigma': T('file', 'fa-magnifying-glass'),
    'virustotal-report': T('knowledge', 'fa-square-poll-vertical'),
}

const STIX_TYPES = {
    // containers
    'report': T('container', 'fa-file-lines'), 'grouping': T('container', 'fa-folder-open'),
    'note': T('knowledge', 'fa-note-sticky'), 'opinion': T('knowledge', 'fa-comment-dots'),
    'observed-data': T('knowledge', 'fa-eye'), 'malware-analysis': T('knowledge', 'fa-flask'),
    // threat
    'threat-actor': T('threat', 'fa-user-secret'), 'intrusion-set': T('threat', 'fa-users-viewfinder'),
    'campaign': T('threat', 'fa-flag'), 'malware': T('threat', 'fa-bug'), 'tool': T('threat', 'fa-screwdriver-wrench'),
    'incident': T('threat', 'fa-triangle-exclamation'), 'infrastructure': T('network', 'fa-server'),
    // techniques & defence
    'attack-pattern': T('ttp', 'fa-crosshairs'), 'course-of-action': T('ttp', 'fa-kit-medical'),
    'vulnerability': T('vuln', 'fa-shield-virus'),
    // who & where
    'identity': T('identity', 'fa-building'), 'location': T('identity', 'fa-location-dot'),
    // detection
    'indicator': T('network', 'fa-bullseye'),
    // observables
    'ipv4-addr': T('network', 'fa-network-wired'), 'ipv6-addr': T('network', 'fa-network-wired'),
    'domain-name': T('network', 'fa-globe'), 'url': T('network', 'fa-link'),
    'network-traffic': T('network', 'fa-right-left'), 'autonomous-system': T('network', 'fa-tower-broadcast'),
    'mac-addr': T('network', 'fa-ethernet'), 'x509-certificate': T('network', 'fa-certificate'),
    'file': T('file', 'fa-file-lines'), 'artifact': T('file', 'fa-box-archive'), 'directory': T('file', 'fa-folder'),
    'email-addr': T('email', 'fa-envelope'), 'email-message': T('email', 'fa-envelope-open-text'),
    'process': T('host', 'fa-microchip'), 'software': T('host', 'fa-box'),
    'windows-registry-key': T('host', 'fa-key'), 'mutex': T('host', 'fa-lock'),
    'user-account': T('identity', 'fa-user'),
    // meta
    'marking-definition': T('knowledge', 'fa-tag'), 'extension-definition': T('knowledge', 'fa-puzzle-piece'),
    'language-content': T('knowledge', 'fa-language'),
}

/** STIX types → element. */
const STIX_ELEMENT = {
    'report': 'container', 'grouping': 'container',
    'indicator': 'indicator',
    'marking-definition': 'meta', 'extension-definition': 'meta', 'language-content': 'meta',
    'note': 'context', 'opinion': 'context', 'observed-data': 'context', 'malware-analysis': 'context',
}
const STIX_SCO = new Set(['ipv4-addr', 'ipv6-addr', 'domain-name', 'url', 'network-traffic',
    'autonomous-system', 'mac-addr', 'x509-certificate', 'file', 'artifact', 'directory',
    'email-addr', 'email-message', 'process', 'software', 'windows-registry-key', 'mutex', 'user-account'])

/** MISP galaxy type → family/icon of its clusters. */
const GALAXIES = {
    'mitre-attack-pattern': T('ttp', 'fa-crosshairs'), 'mitre-course-of-action': T('ttp', 'fa-kit-medical'),
    'mitre-intrusion-set': T('threat', 'fa-users-viewfinder'), 'mitre-malware': T('threat', 'fa-bug'),
    'mitre-tool': T('threat', 'fa-screwdriver-wrench'), 'threat-actor': T('threat', 'fa-user-secret'),
    'malpedia': T('threat', 'fa-bug'), 'ransomware': T('threat', 'fa-lock'), 'tool': T('threat', 'fa-screwdriver-wrench'),
    'sector': T('identity', 'fa-industry'), 'country': T('identity', 'fa-flag'), 'region': T('identity', 'fa-earth-europe'),
}

const FALLBACK = {
    container: T('container', 'fa-folder'), entity: T('knowledge', 'fa-cube'),
    indicator: T('network', 'fa-bullseye'), object: T('knowledge', 'fa-cubes'),
    observable: T('knowledge', 'fa-circle-dot'), context: T('knowledge', 'fa-tag'), meta: T('knowledge', 'fa-tag'),
}

/** The MISP category, when a type is unknown, still says something. */
const MISP_CATEGORY_FAMILY = {
    'Network activity': 'network', 'Payload delivery': 'file', 'Payload installation': 'file',
    'Artifacts dropped': 'file', 'Persistence mechanism': 'host', 'Targeting data': 'identity',
    'Attribution': 'threat', 'External analysis': 'knowledge', 'Financial fraud': 'identity',
    'Social network': 'identity', 'Person': 'identity', 'Antivirus detection': 'file',
}

/**
 * The drawing of one model element.
 * @param {'misp'|'misp-object'|'stix'|'galaxy'|'event'} kind  where the type comes from
 * @param {string} type      the native type (`ip-dst`, `file`, `malware`, a galaxy type)
 * @param {object} [extra]   { category } for MISP attributes
 * @returns {{element:string, family:string, icon:string, color:string, shape:string, size:number}}
 */
export function describe(kind, type, extra = {}) {
    let element, entry
    switch (kind) {
        case 'event':
            element = 'container'; entry = T('container', 'fa-file-shield'); break
        case 'misp':
            element = 'observable'
            entry = MISP_ATTRIBUTES[type]
                ?? (MISP_CATEGORY_FAMILY[extra.category] && T(MISP_CATEGORY_FAMILY[extra.category], FALLBACK.observable.icon))
            break
        case 'misp-object':
            element = 'object'; entry = MISP_OBJECTS[type]; break
        case 'galaxy':
            element = 'context'; entry = GALAXIES[type] ?? T('knowledge', 'fa-tag'); break
        case 'stix':
        default:
            element = STIX_ELEMENT[type] ?? (STIX_SCO.has(type) ? 'observable' : 'entity')
            entry = STIX_TYPES[type]
    }
    entry = entry ?? FALLBACK[element]
    const el = ELEMENTS[element]
    return {
        element, family: entry.family, icon: entry.icon,
        color: FAMILIES[entry.family].color, shape: el.shape, size: el.size,
    }
}

/** A family's colour for a type an indicator's pattern names (`ipv4-addr`…). */
export function familyOfStixType(type) {
    return STIX_TYPES[type]?.family ?? 'knowledge'
}

// ── Edges ────────────────────────────────────────────────────────────────────

/** Edge kinds → how the line looks and whether it shows by default.
 *  `structure` is the containment skeleton: thin and quiet. */
export const EDGE_KINDS = {
    contains:     { label: 'Contains',            color: '#94a3b8', width: 1,   dashed: false, on: true  },
    reference:    { label: 'Object reference',    color: '#2563eb', width: 1.8, dashed: false, on: true  },
    relationship: { label: 'Relationship',        color: '#2563eb', width: 1.8, dashed: false, on: true  },
    sighting:     { label: 'Sighting',            color: '#d97706', width: 1.5, dashed: true,  on: true  },
    'embedded-ref': { label: 'Embedded reference', color: '#64748b', width: 1, dashed: true,  on: false },
    galaxy:       { label: 'Galaxy / tag',        color: '#a16207', width: 1,   dashed: true,  on: true  },
    correlation:  { label: 'Same value',          color: '#7c3aed', width: 1.2, dashed: true,  on: true  },
    pattern:      { label: 'Pattern observable',  color: '#0f766e', width: 1,   dashed: true,  on: false },
    origin:       { label: 'MISP ↔ STIX',         color: '#9333ea', width: 1,   dashed: true,  on: true  },
}

/** relationship_type → colour, for the semantic edges. Others keep the kind's. */
export const RELATION_COLORS = {
    'indicates': '#7c3aed', 'based-on': '#7c3aed',
    'uses': '#dc2626', 'targets': '#b91c1c', 'attributed-to': '#9a3412', 'impersonates': '#9a3412',
    'mitigates': '#15803d', 'remediates': '#15803d',
    'drops': '#c2410c', 'downloads': '#c2410c', 'contains': '#64748b', 'delivers': '#c2410c',
    'communicates-with': '#0369a1', 'connects-to': '#0369a1', 'resolves-to': '#0e7490', 'beacons-to': '#0369a1',
    'exploits': '#a21caf', 'has': '#64748b', 'variant-of': '#6d28d9', 'derived-from': '#6d28d9',
    'related-to': '#64748b', 'duplicate-of': '#64748b',
}

// ── Labels ───────────────────────────────────────────────────────────────────

const HASH_RE = /^[a-f0-9]{32,128}$/i

/** A label short enough for the canvas: hashes keep both ends, URLs drop the
 *  scheme, everything else is cut at `max` with an ellipsis in the middle. */
export function shortLabel(value, max = 28) {
    let s = String(value ?? '').trim()
    if (!s) return ''
    if (HASH_RE.test(s)) return `${s.slice(0, 6)}…${s.slice(-4)}`
    s = s.replace(/^https?:\/\//i, '')
    if (s.length <= max) return s
    const head = Math.ceil((max - 1) * 0.6), tail = max - 1 - head
    return `${s.slice(0, head)}…${s.slice(-tail)}`
}

/** `tlp:amber+strict` / `TLP:AMBER` / marking `{tlp:'amber'}` → 'amber+strict'. */
export function tlpKey(name) {
    const m = /tlp:\s*([a-z+]+)/i.exec(String(name ?? ''))
    return m ? m[1].toLowerCase() : null
}

/** The most restrictive of several TLP keys. */
export function strictestTlp(keys) {
    const order = ['red', 'amber+strict', 'amber', 'green', 'clear', 'white']
    let best = null
    for (const k of keys) if (k && (best === null || order.indexOf(k) < order.indexOf(best))) best = k
    return best
}
