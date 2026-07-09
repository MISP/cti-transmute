"""Persistence for the ConversionReport aggregate (abuse reports).

This is the single place that writes ``ConversionReport`` rows. The
``report_conversion`` use-case in ``website/lib/conversions.py`` and the thin
admin ops in ``website/web/conversions/`` route their writes through here;
``conversions_core`` keeps only the report read/query helpers
(``get_report`` / ``get_reports``).

Transaction seam: every write takes ``commit: bool = True``. The
``report_conversion`` use-case passes ``commit=False`` to ``create`` so the
report row and its Activity log entry commit together in one all-or-nothing
transaction owned by the use-case. ``set_status`` and ``delete`` are the admin
write ops, keyed by id (the admin routes never hold the row object) and
behaviour-identical to the ``review_report`` / ``delete_report`` helpers they
replaced.
"""

from datetime import datetime, timezone

from website.db_class.db import ConversionReport
from website.web import db


def create(
    *, conversion_id: int, user_id: int | None, reason: str,
    description: str | None = None, created_at: datetime | None = None,
    commit: bool = True) -> ConversionReport:
    """Build and persist a ``ConversionReport`` row (status ``pending``).

    ``add`` + ``flush`` always run (so ``report.id`` is assigned); the commit
    is gated on ``commit`` so a caller can bundle this row with other writes
    (e.g. an Activity log entry) in one transaction.
    """
    report = ConversionReport(
        conversion_id=conversion_id,
        user_id=user_id,
        reason=reason,
        description=description,
        status="pending",
        created_at=created_at or datetime.now(timezone.utc)
    )
    db.session.add(report)
    db.session.flush()  # assign report.id within the transaction
    if commit:
        db.session.commit()
    return report


def set_status(report_id: int, new_status: str, reviewed_by_id: int, *,
               commit: bool = True) -> bool:
    """Admin: mark a report reviewed/dismissed. False if it no longer exists."""
    report = ConversionReport.query.get(report_id)
    if not report:
        return False
    report.status = new_status
    report.reviewed_at = datetime.now(timezone.utc)
    report.reviewed_by = reviewed_by_id
    if commit:
        db.session.commit()
    return True


def delete(report_id: int, *, commit: bool = True) -> None:
    """Admin: permanently delete a report. A missing id is a no-op."""
    report = ConversionReport.query.get(report_id)
    if report:
        db.session.delete(report)
        if commit:
            db.session.commit()
