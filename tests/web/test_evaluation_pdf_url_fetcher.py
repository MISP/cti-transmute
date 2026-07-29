"""The evaluation PDF must render with no filesystem or network access.

The report is built from untrusted CTI content, so a crafted ``file://`` or
``http(s)://`` reference in a conversion name/description/comment must not be
fetched while WeasyPrint renders the PDF (arbitrary file read / SSRF).
"""

import pytest

try:
    # evaluate_core imports weasyprint at module level, which loads its
    # native libraries (Pango, cairo, ...) -- missing libs raise OSError.
    from website.web.evaluate.evaluate_core import _pdf_url_fetcher
    _WEASYPRINT_OK = True
except OSError:
    _WEASYPRINT_OK = False

pytestmark = pytest.mark.skipif(
    not _WEASYPRINT_OK, reason="WeasyPrint native libraries not installed"
)


@pytest.mark.parametrize("url", [
    "file:///etc/passwd",
    "http://127.0.0.1:6868/static/image/logo.png",
    "http://internal-service.local/admin/status",
    "https://fonts.googleapis.com/css2?family=Inter",
    "ftp://example.com/x",
])
def test_pdf_url_fetcher_blocks_external_resources(url):
    with pytest.raises(ValueError):
        _pdf_url_fetcher(url)
