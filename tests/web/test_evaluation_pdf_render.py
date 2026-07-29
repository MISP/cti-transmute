"""End-to-end checks for the evaluation PDF render.

These exercise the real build->markdown->WeasyPrint path, so they need
WeasyPrint's native libraries (Pango, cairo, ...). They are skipped where
those are absent.
"""

import warnings

import pytest

try:
    # evaluate_core imports weasyprint at module level, which loads its
    # native libraries (Pango, cairo, ...) -- missing libs raise OSError.
    from website.web.evaluate import evaluate_core
    _WEASYPRINT_OK = True
except OSError:
    _WEASYPRINT_OK = False

pytestmark = pytest.mark.skipif(
    not _WEASYPRINT_OK, reason="WeasyPrint native libraries not installed"
)


def _report(description=""):
    """A minimal report dict shaped like build_evaluation_report's output."""
    return {
        "conversion": {
            "id": 1, "name": "Render Test", "uuid": "uuid-1",
            "description": description, "type": "MISP_TO_STIX",
            "source_fmt": "MISP", "target_fmt": "STIX 2.1",
            "created_at": "2026-01-01 00:00 UTC", "public": True,
        },
        "generated_at": "2026-01-01 00:00 UTC",
        "overall": {"level": "high", "score": 80, "total_votes": 3,
                    "likes": 2, "dislikes": 1, "like_ratio": 67},
        "dimensions": [], "consensus_tags": [], "all_tags": [], "eval_comments": [],
    }


def test_benign_report_renders_to_pdf():
    pdf = evaluate_core.render_evaluation_pdf(_report())
    assert pdf[:5] == b"%PDF-"


def test_data_uri_images_render_without_deprecated_api():
    """data: URIs are the one allowed resource, and fetching them must go
    through WeasyPrint's URLFetcher API (default_url_fetcher is deprecated
    upstream and about to be removed)."""
    report = _report(
        '<img src="data:image/gif;base64,'
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">'
    )
    with warnings.catch_warnings():
        warnings.filterwarnings(
            "error", category=DeprecationWarning, module=r"weasyprint"
        )
        pdf = evaluate_core.render_evaluation_pdf(report)
    assert pdf[:5] == b"%PDF-"


def test_injected_resources_are_not_fetched(monkeypatch):
    """A hostile conversion cannot make the render read files or reach hosts."""
    attempts, fetched = [], []
    real = evaluate_core._pdf_url_fetcher

    def spy(url):
        attempts.append(url)
        result = real(url)   # raises for any non-data: URL
        fetched.append(url)  # reached only if the fetch was allowed through
        return result

    monkeypatch.setattr(evaluate_core, "_pdf_url_fetcher", spy)

    report = _report(
        '<link rel="attachment" href="file:///etc/passwd">'
        '<img src="http://127.0.0.1:6868/x.png">'
    )
    try:
        evaluate_core.render_evaluation_pdf(report)
    except Exception:  # noqa: BLE001 -- a block that aborts the render still leaks nothing
        pass

    # The render must route resources through our fetcher (guards against the
    # url_fetcher wiring being dropped), and nothing external may get through.
    assert attempts, "render did not route resources through _pdf_url_fetcher"
    assert all(u.startswith("data:") for u in fetched), f"external resource fetched: {fetched}"
