"""The bulk-tag admin panel renders job error messages as text.

Each message is `#<id>: ` plus exception output derived from conversion
content, so it is attacker-reachable in the same sense as any stored field.
The panel fetches the messages as JSON and renders them through Vue
interpolation; the rule is that data never becomes template markup, and
`v-html` in this card would be exactly that.
"""

from pathlib import Path

PANEL = (Path(__file__).resolve().parents[2]
         / "website/web/templates/admin/admin_bulk_tags.html")


def test_the_error_messages_are_interpolated_never_written_as_markup():
    source = PANEL.read_text(encoding="utf-8")

    assert "[[ message ]]" in source          # the messages render as text
    assert "v-html" not in source
    assert "innerHTML" not in source
