/* Shared date-time helpers for server timestamps.
 *
 * The wire format is ISO-8601 UTC with a Z marker (utc_iso in
 * website/db_class/db.py); parse() also tolerates the legacy offset-less
 * 'YYYY-MM-DD HH:MM' form. All formatters render in the viewer's local zone.
 * Loaded globally from base.html; Vue apps expose the formatters they need:
 *   methods/return: { formatDate: ctiDate.formatDate, ... }
 */
window.ctiDate = (function () {
    'use strict';

    function parse(str) {
        if (!str) return null;
        let s = String(str).replace(' ', 'T');
        /* A date-only value is a calendar date, not an instant: force local
         * midnight, else Date() reads it as UTC midnight and viewers west of
         * UTC see the previous day. */
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += 'T00:00:00';
        const d = new Date(s);
        return isNaN(d) ? null : d;
    }

    /* Short local date, e.g. "Jul 13, 2026". Falsy input renders empty. */
    function formatDate(str) {
        if (!str) return '';
        const d = parse(str);
        return d ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : str;
    }

    /* Full local date + time via toLocaleString(). Falsy input renders the
     * fallback ('N/A' unless the call site shows a dash etc.). */
    function formatDateTime(str, fallback) {
        if (!str) return fallback === undefined ? 'N/A' : fallback;
        const d = parse(str);
        return d ? d.toLocaleString() : str;
    }

    function timeAgo(str) {
        const d = parse(str);
        if (!d) return '';
        const diff = Date.now() - d.getTime();
        const min = Math.floor(diff / 60000);
        if (min < 1)  return 'just now';
        if (min < 60) return `${min}m ago`;
        const h = Math.floor(min / 60);
        if (h < 24)   return `${h}h ago`;
        const days = Math.floor(h / 24);
        if (days < 30) return `${days}d ago`;
        const mo = Math.floor(days / 30);
        return mo < 12 ? `${mo}mo ago` : `${Math.floor(mo / 12)}y ago`;
    }

    return { parse, formatDate, formatDateTime, timeAgo };
})();
