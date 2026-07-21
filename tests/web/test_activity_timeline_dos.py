"""`/evaluate/activity_timeline?days=` must clamp an unbounded `days`.

The route is unauthenticated and passes `days` straight into
`get_activity_timeline`, which does O(days) work: it builds a `days`-long list
and, once the window falls before year 1, raises `OverflowError` -> 500. An
anonymous caller can pin a worker with a single large `days`. The fix clamps
`days` to `[1, 1095]` (3 years) at the route boundary.

Two tests, one per clamp bound (the two halves of `max(1, min(days, 1095))`):
excessive `days` must stay bounded and not 500 (upper), and non-positive `days`
must still yield a day rather than an empty range (lower). No login helper is
used, which also documents that the route is reachable unauthenticated.
"""

import pytest

try:
    # Importing the evaluate blueprint pulls in evaluate_core, which imports
    # weasyprint at module level; its native libs (Pango, cairo, ...) raise
    # OSError when absent. The dev container and CI install them, so this runs
    # there; it skips where they are missing rather than failing collection.
    from website.web.evaluate.evaluate import evaluate_blueprint
    _EVAL_IMPORTABLE = True
except OSError:
    _EVAL_IMPORTABLE = False

pytestmark = pytest.mark.skipif(
    not _EVAL_IMPORTABLE, reason="WeasyPrint native libraries not installed"
)


@pytest.fixture
def eval_client(app_db):
    """Evaluate blueprint mounted on the SQLite-backed app, mirroring
    ``bin/start_website.py`` (``url_prefix="/evaluate"``)."""
    from website.web import application

    application.config["TESTING"] = True
    if evaluate_blueprint.name not in application.blueprints:
        application.register_blueprint(evaluate_blueprint, url_prefix="/evaluate")
    return application.test_client()


def test_excessive_days_is_clamped_not_500(eval_client):
    # 800000 days pushes the window before year 1 -> unpatched raises
    # OverflowError -> 500. Clamped to the 1095-day (3-year) cap it returns 200
    # with exactly one bucket per capped day, never an unbounded list.
    resp = eval_client.get("/evaluate/activity_timeline?days=800000")
    assert resp.status_code == 200
    assert len(resp.get_json()["timeline"]) == 1095


@pytest.mark.parametrize("days", [0, -5])
def test_nonpositive_days_floors_to_one(eval_client, days):
    # range(<=0) yields an empty timeline unpatched; the max(1, ...) floor
    # guarantees at least one day.
    resp = eval_client.get(f"/evaluate/activity_timeline?days={days}")
    assert resp.status_code == 200
    assert len(resp.get_json()["timeline"]) == 1
