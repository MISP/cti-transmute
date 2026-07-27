// DOM builders for the "FROM MISP INSTANCE" event browser (misp_to_stix.html).
// Every value rendered here is fetched from a remote MISP instance the operator
// merely queries, so it is controlled by whoever runs that instance. Nothing
// remote-derived may ever reach innerHTML: rows, badges and tooltips are built
// with createElement/textContent/setAttribute only.

const HEX_COLOUR = /^#[0-9a-fA-F]{6}$/;

// Tag colours also come from the remote; anything but a plain hex colour
// (e.g. a CSS url(...) beacon) falls back to the neutral default.
function safeColour(colour, fallback) {
    return HEX_COLOUR.test(colour || '') ? colour : fallback;
}

function badgeTextColour(bg) {
    const lum = parseInt(bg.replace('#', ''), 16);
    return isNaN(lum) || lum < 0x888888 ? '#fff' : '#111';
}

export function threatBadge(level) {
    if (!level) return null;
    const map = { High: 'danger', Medium: 'warning', Low: 'success', Undefined: 'secondary' };
    const span = document.createElement('span');
    span.className = `badge bg-${map[level] || 'secondary'}`;
    span.style.fontSize = '0.65rem';
    span.textContent = level;
    return span;
}

export function tagBadges(tags) {
    if (!tags || !tags.length) {
        const dash = document.createElement('span');
        dash.className = 'text-muted';
        dash.style.fontSize = '0.72rem';
        dash.textContent = '—';
        return [dash];
    }
    const max = 3;
    const badges = tags.slice(0, max).map(t => {
        const bg = safeColour(t.colour, '#888888');
        const name = String(t.name ?? '');
        const span = document.createElement('span');
        span.className = 'badge me-1';
        span.style.fontSize = '0.62rem';
        span.style.fontWeight = '500';
        span.style.background = bg;
        span.style.color = badgeTextColour(bg);
        span.setAttribute('title', name);
        span.textContent = name.length > 28 ? name.slice(0, 25) + '…' : name;
        return span;
    });
    if (tags.length > max) {
        const extra = document.createElement('span');
        extra.className = 'text-muted';
        extra.style.fontSize = '0.7rem';
        extra.textContent = `+${tags.length - max}`;
        badges.push(extra);
    }
    return badges;
}

// The larger badge shown in the sensitivity-warning overlay for TLP tags.
export function sensitivityTagBadge(tag) {
    const bg = safeColour(tag.colour, '#cc2200');
    const span = document.createElement('span');
    span.className = 'badge';
    span.style.fontSize = '0.78rem';
    span.style.padding = '0.3em 0.65em';
    span.style.fontWeight = '600';
    span.style.background = bg;
    span.style.color = badgeTextColour(bg);
    span.textContent = String(tag.name ?? '');
    return span;
}

export function buildEventRow(ev, checked) {
    const tr = document.createElement('tr');
    const cell = (className) => {
        const td = document.createElement('td');
        if (className) td.className = className;
        tr.appendChild(td);
        return td;
    };
    const evId = String(ev.id ?? '');

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'mi-row-check';
    check.dataset.id = evId;
    check.checked = !!checked;
    check.style.cursor = 'pointer';
    cell('text-center').appendChild(check);

    const tdId = cell();
    const idBadge = document.createElement('span');
    idBadge.className = 'badge bg-secondary';
    idBadge.style.fontSize = '0.68rem';
    idBadge.textContent = `#${evId}`;
    tdId.appendChild(idBadge);
    if (ev.distribution === '0' || ev.distribution === '4') {
        const icon = document.createElement('i');
        icon.className = `fas ${ev.distribution === '0' ? 'fa-building' : 'fa-users'} ms-1`;
        icon.setAttribute('title', ev.distribution === '0' ? 'Your organisation only' : 'Sharing Group');
        icon.style.cssText = 'color:var(--text-3);font-size:0.6rem;vertical-align:middle';
        tdId.appendChild(icon);
    }

    const tdInfo = cell();
    tdInfo.style.maxWidth = '250px';
    const info = document.createElement('span');
    info.setAttribute('title', ev.info || '');
    info.style.cssText = 'display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
    info.textContent = ev.info || '—';
    tdInfo.appendChild(info);

    cell('text-nowrap').textContent = ev.date || '';

    const tdOrg = cell();
    tdOrg.style.cssText = 'max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
    tdOrg.setAttribute('title', ev.org || '');
    tdOrg.textContent = ev.org || '';

    cell('text-center').textContent = String(ev.attribute_count || 0);

    const tdThreat = cell('text-center');
    const threat = threatBadge(ev.threat_level);
    if (threat) tdThreat.appendChild(threat);

    const tdTags = cell();
    tagBadges(ev.tags).forEach(b => tdTags.appendChild(b));

    const btn = document.createElement('button');
    btn.className = 'btn btn-xs btn-primary mi-select-btn';
    btn.dataset.id = evId;
    btn.style.whiteSpace = 'nowrap';
    const btnIcon = document.createElement('i');
    btnIcon.className = 'fas fa-check me-1';
    btn.appendChild(btnIcon);
    btn.appendChild(document.createTextNode('Select'));
    cell().appendChild(btn);

    return tr;
}
