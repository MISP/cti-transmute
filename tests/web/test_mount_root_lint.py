"""No template writes an unprotected user value into a Vue-mounted region.

ADR-0021's rule is that server-rendered user data never reaches Vue as template
markup. `test_delimiter_neutralisation.py` covers the global protection that
makes forgetting survivable; this covers the structural half, which is the only
way to assert "no *future* template does this".

The check is allowlist-driven, and the allowlist is of expression *shapes*, not
of sites: something that carries no user data passes wherever it lands, and
anything else inside a mounted region fails and is named. The seven sinks this
class was found through each had a temporary row of their own until the ticket
that converted it deleted the row; all seven are converted, so there are no
per-site exemptions left and an unfamiliar construct is a failing test rather
than a hole.

`mount_roots.py` is the inventory itself and carries the derivation rules.
"""

import mount_roots as roots

from website.web.templating import VUE_DELIMITERS


def mounted_page(body):
    """A page shaped like the real ones.

    It extends the layout and mounts the layout's `<main>`, so everything in
    its content block renders inside the mounted region and everything in its
    script block renders outside it.
    """
    return (
        '{% extends "base.html" %}\n'
        "{% block content %}\n"
        + body
        + "\n{% endblock %}\n"
        "{% block script %}\n"
        '<script type="module" nonce="{{ csp_nonce }}">\n'
        "    Vue.createApp(App).mount('#main-containers')\n"
        "</script>\n"
        "{% endblock %}\n"
    )


def describe(findings):
    return "\n".join(
        f"  {f.template}:{f.line} in #{f.root_id} -- {{{{ {f.expression} }}}}"
        for f in findings
    )


# ── The inventory ────────────────────────────────────────────────────────────

def test_recorded_mount_roots_match_the_templates():
    derived, _absent = roots.derive_inventory()
    assert derived == roots.MOUNT_ROOTS, (
        "the recorded mount-root inventory is out of date\n"
        f"  no longer derived: {sorted(set(roots.MOUNT_ROOTS) - set(derived))}\n"
        f"  not recorded:      {sorted(set(derived) - set(roots.MOUNT_ROOTS))}"
    )


def test_mounts_that_resolve_to_no_element_are_recorded():
    _derived, absent = roots.derive_inventory()
    assert absent == tuple(
        (entry.template, entry.root_id) for entry in roots.MOUNTS_WITHOUT_A_REGION
    )


def test_pages_that_mount_nothing_are_recorded():
    """Pins the trap: `docs/index.html`'s mount call is a `<pre>` sample."""
    recorded = tuple(page.template for page in roots.UNMOUNTED_PAGES)
    assert roots.derive_unmounted_pages() == recorded
    assert "docs/index.html" in recorded


# ── The lint ─────────────────────────────────────────────────────────────────

def test_no_unprotected_user_value_in_a_mounted_region():
    findings = roots.scan_tree()
    assert not findings, (
        "server-rendered expressions inside a Vue-mounted region, neither a "
        "known-safe shape nor an allowlisted sink:\n" + describe(findings)
    )


def test_a_planted_sink_is_reported():
    """A lint with no failing case is not known to work.

    Planted on the detail page's conversion-id element, which sits in the
    mounted region and outside every marker on the page. The Conversion name
    that used to anchor this is inside the share modal's `v-pre` now, and a
    plant there would pass for the wrong reason.
    """
    name = "conversions/detail.html"
    source = (roots.TEMPLATES / name).read_text()
    planted = source.replace(
        'data-conversion-id="{{ conversion.id }}"></div>',
        'data-conversion-id="{{ conversion.id }}">{{ conversion.description }}</div>',
        1
    )
    assert planted != source
    findings = roots.scan(name, planted)
    assert [(f.root_id, f.expression) for f in findings] == [
        ("main-containers", "conversion.description")
    ]


def test_an_unrecognised_shape_inside_a_mounted_region_fails():
    findings = roots.scan("planted.html", mounted_page("<p>{{ whatever }}</p>"))
    assert [f.expression for f in findings] == ["whatever"]


def test_a_known_safe_shape_passes():
    body = "<a href=\"{{ url_for('home.home') }}\">{{ conversion.id }}</a>"
    assert roots.scan("planted.html", mounted_page(body)) == []
    assert roots.cleared_by(roots.Expression(1, "url_for('home.home')")) == "route helper"
    assert roots.cleared_by(roots.Expression(1, "conversion.id")) == "record id"


def test_a_wtforms_error_string_is_not_a_field_render():
    """`form.<field>` renders an element; `.errors` and `.data` are strings."""
    assert roots.cleared_by(roots.Expression(1, "form.email(class_='x')"))
    assert roots.cleared_by(roots.Expression(1, "form.errors")) is None
    assert roots.cleared_by(roots.Expression(1, "form.data")) is None


def test_the_protection_markers_clear_a_region():
    """The two patterns a sink is converted to."""
    island = '<script type="application/json">{{ user.name | tojson }}</script>'
    assert roots.scan("planted.html", mounted_page(island)) == []
    skipped = "<div v-pre><span>{{ user.name }}</span></div>"
    assert roots.scan("planted.html", mounted_page(skipped)) == []


def test_a_marker_on_the_mounted_element_itself_is_not_a_defence():
    """The marker has to sit inside the region, not on the mounted element.

    A page whose content root and mount root are one element - the register
    page - makes that the natural mistake.
    """
    page = (
        '{% extends "base.html" %}\n'
        "{% block content %}\n"
        '<div v-pre id="own-root"><span>{{ user.name }}</span></div>\n'
        "{% endblock %}\n"
        "{% block script %}\n"
        '<script type="module" nonce="{{ csp_nonce }}">\n'
        "    Vue.createApp(App).mount('#own-root')\n"
        "</script>\n"
        "{% endblock %}\n"
    )
    findings = roots.scan("planted.html", page)
    assert [f.expression for f in findings] == ["user.name"]


def test_a_user_value_in_an_attribute_is_reported():
    """Vue interpolates text nodes only, but the lint does not lean on that.

    A directive value really is compiled as JavaScript, and treating the plain
    attribute next to it as inert would make the unknown case a pass.
    """
    for body in ('<my-widget :label="{{ user.name }}"></my-widget>',
                 '<img alt="{{ user.name }}">'):
        findings = roots.scan("planted.html", mounted_page(body))
        assert [f.expression for f in findings] == ["user.name"], body


def test_a_pre_body_inside_a_mounted_region_is_scanned():
    """Vue interpolates a `<pre>`; only mount calls treat one as a sample."""
    findings = roots.scan("planted.html", mounted_page("<pre>{{ user.name }}</pre>"))
    assert [f.expression for f in findings] == ["user.name"]


def test_an_included_partial_is_scanned_through_the_call_site():
    """An include renders in the region without an expression of its own."""
    page = mounted_page("{% include 'macros/form_macros.html' %}")
    findings = roots.scan("planted.html", page)
    assert findings
    assert {f.template for f in findings} == {"macros/form_macros.html"}


def test_an_expression_outside_the_mounted_region_is_not_scanned():
    """The layout renders `{% block head %}` and `{% block script %}` outside
    the `<main>` the page mounts."""
    page = mounted_page("") + "{% block head %}{{ whatever }}{% endblock %}\n"
    assert roots.scan("planted.html", page) == []


# ── Delimiter agreement ──────────────────────────────────────────────────────

def test_every_delimiter_literal_matches_the_server_constant():
    literals = roots.delimiter_literals()
    assert literals
    drifted = [found for found in literals if found.pair != VUE_DELIMITERS]
    assert not drifted, (
        f"delimiter literals disagreeing with VUE_DELIMITERS {VUE_DELIMITERS}: "
        f"{[(found.path, found.line, found.pair) for found in drifted]}"
    )


def test_every_page_root_app_declares_the_delimiters():
    """An app that declares none falls back to `{{ }}`, which layer 1 misses."""
    declaring = {found.path for found in roots.delimiter_literals()}
    for root in roots.MOUNT_ROOTS:
        if root.kind != "page":
            continue
        expected = roots.DELIMITERS_DECLARED_ELSEWHERE.get(
            (root.template, root.root_id), f"website/web/templates/{root.template}"
        )
        assert expected in declaring, (
            f"#{root.root_id} on {root.template} mounts a whole-page app with no "
            "delimiters literal in reach"
        )
