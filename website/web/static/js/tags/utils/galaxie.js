/**
 * getTextColor
 * Returns '#000' or '#fff' depending on background luminance (YIQ formula).
 */
export function getTextColor(hex) {
    if (!hex || !hex.startsWith('#') || hex.length < 7) return '#fff';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 >= 145 ? '#000' : '#fff';
}

/**
 * mapIcon
 * Converts an icon name (FontAwesome solid) to its <i> class string.
 * Bind the result with :class - never render it as HTML, the icon is
 * user-supplied. Anything that isn't a plausible slug (the same rule the
 * server enforces in tags.py) falls back to the generic tag icon.
 */
export function mapIcon(icon) {
    const name = /^[a-z0-9-]{1,40}$/.test(icon || '') ? icon : 'tag';
    return `fas fa-${name}`;
}

/**
 * nameToColor
 * Derives a consistent vibrant HSL color from a string when no color is stored.
 */
export function nameToColor(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    h = Math.abs(h) % 360;
    const s = 0.72, l = 0.52, a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        return Math.max(0, Math.min(255,
            Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)))
        )).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}
