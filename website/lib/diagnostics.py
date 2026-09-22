"""Reading a conversion's Diagnostics for the surfaces that announce them.

The blob itself is the converter's own report, stored and returned verbatim -
nothing here renames, flattens or re-summarises it. What every surface does ask
first is the same question: did this conversion report anything, and how much.
The API answers it in the count headers, the web in the flash and refresh
messages, so the rule lives in one place rather than drifting between them.
"""


def reported_counts(diagnostics: dict | None) -> tuple[int, int] | None:
    """``(warnings, errors)`` when either bucket holds something, else ``None``.

    ``None`` covers both a clean conversion and a pre-Diagnostics ``NULL``:
    neither has anything to announce, and a surface that stays silent for one
    should stay silent for the other. The numbers come from the report's own
    ``counts``, which are taken before its messages are capped, so they keep
    saying "hundreds" when the messages show ten.
    """
    diagnostics = diagnostics or {}
    if not diagnostics.get("warnings") and not diagnostics.get("errors"):
        return None
    totals = diagnostics.get("counts") or {}
    return totals.get("warnings", 0), totals.get("errors", 0)
