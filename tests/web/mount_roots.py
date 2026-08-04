"""The page regions Vue mounts over, and what may be rendered inside them.

Vue compiles the DOM it is mounted on, so anything Jinja renders inside a
mounted region is template markup rather than text. ADR-0021 states the rule
that follows from that: server-rendered user data may not reach Vue as template
markup. `website/web/templating.py` enforces it globally at the render
boundary; this module is the structural half - it records *where* the mounted
regions are and fails when a template writes an unrecognised expression into
one.

## Deriving the mount roots

The set is derived from two sources, because searching for mount calls alone
under-reports it:

1. Explicit `.mount('#id')` / `.mount(el)` calls in a template.
2. The layout's default `{% block script %}`, which mounts `#main-container`.
   A page that declares that id and does not override the block is mounted
   with no mount call of its own - `account/register_user.html` is exactly
   that, and its own inline comment says so.

Three traps that cost time when this was first enumerated:

- **Not every mount call is a mount.** `docs/index.html` contains
  `app.mount('#main-containers')` inside a `<pre>` documentation sample. Code
  samples are blanked before mount calls are read.
- **Not every mounted page has a mount call.** See source 2 above.
- **Not every page that declares the id is mounted.** `conversions/edit.html`
  declares `#main-container` but overrides `{% block script %}` with a
  TagInput-only script, so the layout's default mount never runs and the
  validation error it echoes is not a sink. The echoed-error sink is the
  register page, which the two-source rule turned up instead.

## Whole-page roots and per-widget roots

A root is recorded as `page` or `widget`, and the distinction is derived rather
than asserted: a widget root is an *empty* element that a Vue component fills
from its own `template` option, so the region holds no server-rendered content
and carries no exposure. Recording that is what stops the next audit from
re-checking `#param-surface` and friends.

## What counts as a sink

Every Jinja expression inside a mounted region is reported unless it matches a
known-safe shape or is an allowlisted sink. Three things take a region, or part
of one, out of scope, and each was measured against the vendored
`vue.global.js` (3.2.47) rather than assumed;
`test_vue_template_positions_js.py` pins them.

- `<script>` and `<style>` content is not interpolated: Vue drops side-effect
  tags. That is why a JSON data island a converted page delivers its state
  through is inert.
- A `v-pre` subtree is not interpolated - the skip marker, the other of the two
  patterns a conversion moves a region to.
- Anything outside the mounted element. For most pages the mounted region is
  the layout's `<main>`, which holds the flash region and the page's content
  block but not its head or script blocks.

Scope runs the other way too: an `{% include %}` inside a mounted region is
followed, because a partial renders there without a single expression of its
own showing at the call site.

A `v-pre` has to sit *inside* the region rather than on the mounted element
itself. `mount()` assigns `container.innerHTML` as the template, so the
container's own attributes never reach the compiler and a marker there protects
nothing - read off `mount()` in the vendored bundle, not from the compiler
probe, which only sees templates it is handed. The lint reports through such a
marker instead of honouring it, because a page whose content root and mount
root are one element - the register page - makes that the natural mistake. If a
later Vue did compile the container's attributes, the strict direction is still
the safe one.

Position within the region is deliberately *not* a defence. Vue interpolates
text nodes and leaves plain attributes alone, but the lint checks both the
same way: every expression currently sitting in an attribute is a known-safe
shape, so the strict rule costs nothing, and the loose one would turn an
expression the scanner could not place into a pass. A `<pre>` body is a text
node like any other - it is only treated as a documentation sample when mount
calls are being read.
"""

import re
from collections import namedtuple
from pathlib import Path

_REPO = Path(__file__).resolve().parents[2]
TEMPLATES = _REPO / "website" / "web" / "templates"
STATIC_JS = _REPO / "website" / "web" / "static" / "js"

# The layout every page extends, the region id it wraps page content in, and
# the id its default script block mounts.
LAYOUT = "base.html"
LAYOUT_REGION_ID = "main-containers"
LAYOUT_DEFAULT_MOUNT_ID = "main-container"

# Vendored third-party bundles: their delimiter literals are not ours to pin.
VENDORED_JS = ("vue.global.js", "pivotick.umd.js")


# ── Inventory ────────────────────────────────────────────────────────────────

MountRoot = namedtuple("MountRoot", "template root_id kind mounted_by")
Absent = namedtuple("Absent", "template root_id reason")
Unmounted = namedtuple("Unmounted", "template reason")
KnownSink = namedtuple("KnownSink", "template expressions removed_by note")

# Every region a rendered page mounts a Vue app on. `template` is the page
# whose render performs the mount; for `main-containers` the element itself is
# the layout's <main>, and the page's content block renders inside it.
MOUNT_ROOTS = (
    MountRoot("account/account_index.html", "main-containers", "page", "mount call"),
    MountRoot("account/account_notifications.html", "main-containers", "page", "mount call"),
    MountRoot("account/public_user.html", "main-containers", "page", "mount call"),
    MountRoot("account/register_user.html", "main-container", "page", "layout default"),
    MountRoot("admin/admin_bulk_tags.html", "bulk-tags-app", "page", "mount call"),
    MountRoot("admin/admin_comments.html", "main-containers", "page", "mount call"),
    MountRoot("admin/admin_logs.html", "main-containers", "page", "mount call"),
    MountRoot("admin/admin_reports.html", "main-containers", "page", "mount call"),
    MountRoot("admin/admin_tags.html", "main-containers", "page", "mount call"),
    MountRoot("admin/deleted_conversions.html", "main-containers", "page", "mount call"),
    MountRoot("admin/detail_user.html", "main-containers", "page", "mount call"),
    MountRoot("admin/manage_user.html", "mu-app", "page", "mount call"),
    MountRoot("base.html", "main-containers", "page", "layout region"),
    MountRoot("base.html", "navbar-search-mount", "widget", "mount call"),
    MountRoot("conversions/compare_version/difference.html", "main-containers", "page", "mount call"),
    MountRoot("conversions/detail.html", "main-containers", "page", "mount call"),
    MountRoot("conversions/edit.html", "tag-input-mount-edit", "widget", "mount call"),
    MountRoot("conversions/history.html", "main-containers", "page", "mount call"),
    MountRoot("conversions/misp_to_stix.html", "main-container", "page", "mount call"),
    MountRoot("conversions/misp_to_stix.html", "param-surface", "widget", "mount call"),
    MountRoot("conversions/misp_to_stix.html", "tag-input-mount-m2s", "widget", "mount call"),
    MountRoot("conversions/refresh.html", "main-containers", "page", "mount call"),
    MountRoot("conversions/refresh.html", "param-surface", "widget", "mount call"),
    MountRoot("conversions/stix_to_misp.html", "main-container", "page", "mount call"),
    MountRoot("conversions/stix_to_misp.html", "param-surface", "widget", "mount call"),
    MountRoot("conversions/stix_to_misp.html", "tag-input-mount-s2m", "widget", "mount call"),
    MountRoot("conversions/trash.html", "main-containers", "page", "mount call"),
    MountRoot("evaluate/admin_evaluations.html", "main-container", "page", "mount call"),
    MountRoot("evaluate/overview.html", "ov-app", "page", "mount call"),
    MountRoot("home.html", "home-app", "page", "mount call"),
    MountRoot("list.html", "main-containers", "page", "mount call")
)

# `base.html` holds the region for every `main-containers` row above; the
# navbar widget's element is in the layout's sidebar include.
ROOT_ELEMENT_ELSEWHERE = {
    ("base.html", "navbar-search-mount"): "sidebar.html"
}

# A whole-page app that declares no delimiters falls back to Vue's `{{ }}`,
# which the central neutralisation does not split. Every page root's app
# declares the pair in its own template bar these two.
DELIMITERS_DECLARED_ELSEWHERE = {
    ("account/register_user.html", "main-container"):
        "website/web/templates/base.html",
    ("evaluate/overview.html", "ov-app"):
        "website/web/static/js/evaluate/overview.js"
}

# Mounts that resolve to no element. Recorded so the derivation stays total and
# a future mount call that silently hits nothing is visible rather than lost.
MOUNTS_WITHOUT_A_REGION = (
    Absent("403.html", "main-container", "layout default; the page declares no such id"),
    Absent("404.html", "main-container", "layout default; the page declares no such id"),
    Absent("access_denied.html", "main-container", "layout default; the page declares no such id"),
    Absent(
        "admin/admin_bulk_tags.html", "main-container",
        "layout default; the page wraps its content in #bulk-tags-app instead"
    ),
    Absent(
        "base.html", "main-container",
        "the layout's own default mount; the region is whichever page declares the id"
    ),
    Absent(
        "list.html", "?el",
        "a per-row ParamSurface, mounted into a div Vue itself rendered, so the "
        "id is only known at runtime and the region holds nothing from the server"
    )
)

# Pages that extend the layout and mount nothing at all.
UNMOUNTED_PAGES = (
    Unmounted("403.html", "no mount call and no #main-container"),
    Unmounted("404.html", "no mount call and no #main-container"),
    Unmounted("access_denied.html", "no mount call and no #main-container"),
    Unmounted(
        "account/edit_user.html",
        "declares #main-container, but overrides the script block with a "
        "password-toggle script, so the layout default never runs"
    ),
    Unmounted("account/login.html", "overrides the script block; mounts nothing"),
    Unmounted(
        "docs/index.html",
        "its app.mount('#main-containers') is inside a <pre> documentation "
        "sample, not a real mount; the script block it does override mounts nothing"
    ),
    Unmounted("why.html", "overrides the script block; mounts nothing")
)

# The sinks this class was found through, allowlisted until the ticket named
# against each converts it. An entry that no longer matches anything fails the
# lint, so the list empties itself rather than rotting.
KNOWN_SINKS = (
    KnownSink(
        "conversions/detail.html", ("conversion.name",), "ticket 4",
        "the share-modal title; the sink the security review reported"
    ),
    KnownSink(
        "conversions/refresh.html", ("conversion_obj.name", "filename"), "ticket 4",
        "the Conversion name and the uploaded filename on the refresh page"
    ),
    KnownSink(
        "conversions/compare_version/difference.html", ("conversion_obj.name",), "ticket 4",
        "the Conversion name in the version-comparison header"
    )
)

# Expression shapes that carry no user data, so they are safe wherever they
# land. Anything else inside a mounted region is reported. Position is not a
# defence here: an attribute is checked like a text node even though Vue only
# interpolates the latter, because the cost of the stricter rule is nil (every
# expression currently in an attribute is one of these shapes) and the looser
# one would turn the unknown case into a pass.
SAFE_SHAPES = (
    ("route helper", re.compile(r"url_for\(.*\)")),
    ("CSP nonce", re.compile(r"csp_nonce")),
    ("CSRF token", re.compile(r"csrf_token\(\)")),
    (
        "record id",
        re.compile(
            r"(?:\w+\.)*(?:id|uuid|\w+_(?:id|uuid))"
            r"(?: if .+ else (?:\d+|'[^']*'|None))?"
        )
    ),
    ("boolean", re.compile(r"'(?:true|false)' if .+ else '(?:true|false)'")),
    ("loop variable", re.compile(r"loop\.\w+")),
    (
        "WTForms rendering",
        # A field, its label or the CSRF hidden tag, each of which renders an
        # element rather than a string. `.errors` and `.data` are strings and
        # are deliberately not cleared.
        re.compile(r"form\.hidden_tag\(\)|form\.(?!errors\b|data\b)\w+(?:\.label)?(?:\(.*\))?")
    )
)


# ── Derivation ───────────────────────────────────────────────────────────────

_CODE_SAMPLE = re.compile(r"<pre\b.*?</pre>", re.S | re.I)
_JINJA_COMMENT = re.compile(r"{#.*?#}", re.S)
_MOUNT_SELECTOR = re.compile(r"\.mount\(\s*['\"]#([\w-]+)['\"]\s*\)")
_MOUNT_VARIABLE = re.compile(r"\.mount\(\s*([A-Za-z_$][\w$]*)\s*\)")
_ELEMENT_BY_ID = re.compile(r"\b(\w+)\s*=\s*document\.getElementById\(\s*['\"]([\w-]+)['\"]")
_EXTENDS = re.compile(r"{%-?\s*extends\s+['\"][^'\"]+['\"]")
_SCRIPT_BLOCK = re.compile(r"{%-?\s*block\s+script\b")
_CONTENT_BLOCK = re.compile(r"{%-?\s*block\s+content\s*-?%}(.*?){%-?\s*endblock", re.S)
_EXPRESSION = re.compile(r"{{-?(.*?)-?}}", re.S)
_RAW_TEXT = re.compile(r"<(script|style)\b[^>]*>(.*?)</\1\s*>", re.S | re.I)
_V_PRE = re.compile(r"<(\w+)[^>]*\sv-pre[\s>]")
_INCLUDE = re.compile(r"{%-?\s*include\s+['\"]([^'\"]+)['\"]")
_DELIMITERS = re.compile(r"delimiters\s*:\s*\[\s*(['\"])(.*?)\1\s*,\s*(['\"])(.*?)\3\s*\]")

Expression = namedtuple("Expression", "line text")
Finding = namedtuple("Finding", "template line root_id expression")
Delimiters = namedtuple("Delimiters", "path line pair")


def template_paths():
    """Every template file, in a stable order."""
    return sorted(TEMPLATES.rglob("*.html"))


def template_name(path):
    return path.relative_to(TEMPLATES).as_posix()


def _blank(match):
    """Erase a match, keeping every offset and line number after it intact."""
    return re.sub(r"[^\n]", " ", match.group(0))


def _scannable(source):
    """`source` with the Jinja comments blanked.

    A comment renders nothing, but it reads like markup to every regex here -
    the register page keeps a literal `<script>` in one, and a scanner that
    misses that treats two thirds of the page as raw text and calls it clean.

    `<pre>` bodies are deliberately *not* blanked: Vue interpolates them like
    any other text node, so a documentation sample is only special when mount
    calls are being read, never when expressions are.
    """
    return _JINJA_COMMENT.sub(_blank, source)


def _sources():
    """Every template's scannable source, keyed by name."""
    if not _SOURCES:
        for path in template_paths():
            _SOURCES[template_name(path)] = _scannable(path.read_text())
    return _SOURCES


_SOURCES = {}


def _declaration(source, root_id):
    return re.search(
        r"<(\w+)[^>]*\bid\s*=\s*[\"']" + re.escape(root_id) + r"[\"']", source
    )


def _element_span(source, opening):
    """The span of the element `opening` starts, its closing tag included.

    Falls back to the end of the source when the tags do not balance, which is
    the conservative direction: a region too large over-reports rather than
    letting a sink slip out the bottom.
    """
    tag = opening.group(1)
    depth = 0
    for match in re.finditer(r"</?" + tag + r"\b", source[opening.start():], re.I):
        if match.group(0).startswith("</"):
            depth -= 1
            if depth == 0:
                closing = source.find(">", opening.start() + match.end())
                return (opening.start(), len(source) if closing < 0 else closing + 1)
        else:
            depth += 1
    return (opening.start(), len(source))


def mount_root_ids(name, source):
    """`{element id: how it comes to be mounted}` for one template.

    Unresolvable `.mount(el)` targets come back as `?<variable>`.
    """
    body = _CODE_SAMPLE.sub(_blank, _scannable(source))
    elements = dict(_ELEMENT_BY_ID.findall(body))
    ids = {root_id: "mount call" for root_id in _MOUNT_SELECTOR.findall(body)}
    for variable in _MOUNT_VARIABLE.findall(body):
        ids[elements.get(variable, "?" + variable)] = "mount call"
    if name == LAYOUT:
        # The layout does not mount its own <main>; the pages do. It is listed
        # here so the flash region it holds is scanned once.
        ids.setdefault(LAYOUT_REGION_ID, "layout region")
    elif _EXTENDS.search(source) and not _SCRIPT_BLOCK.search(source):
        ids.setdefault(LAYOUT_DEFAULT_MOUNT_ID, "layout default")
    return ids


def mounted_regions(name, source):
    """`(root_id, span, root_start)` for each region whose element this file holds.

    `root_start` is where the mounted element's own tag begins, or None when the
    element lives in the layout and the span is the page's content block. A
    `v-pre` there is inert - see the module docstring.
    """
    source = _scannable(source)
    regions = []
    for root_id in sorted(mount_root_ids(name, source)):
        opening = _declaration(source, root_id)
        if opening is not None:
            regions.append((root_id, _element_span(source, opening), opening.start()))
        elif root_id == LAYOUT_REGION_ID and name != LAYOUT:
            # The page's content block renders inside the layout's <main>.
            content = _CONTENT_BLOCK.search(source)
            if content is not None:
                regions.append((root_id, content.span(1), None))
    return regions


def expressions_in(source, span, root_start=None):
    """The Jinja expressions Vue would compile inside `span`.

    A `v-pre` at `root_start` - the mounted element itself - does not count.
    """
    source = _scannable(source)
    skipped = [match.span(2) for match in _RAW_TEXT.finditer(source)]
    skipped += [
        _element_span(source, match) for match in _V_PRE.finditer(source)
        if match.start() != root_start
    ]
    low, high = span
    found = []
    for match in _EXPRESSION.finditer(source, low, high):
        if match.end() > high:
            continue
        if any(start <= match.start() < end for start, end in skipped):
            continue
        found.append(Expression(
            source.count("\n", 0, match.start()) + 1,
            " ".join(match.group(1).split())
        ))
    return found


def included_in(source, span):
    """The templates pulled into `span` by `{% include %}`.

    An include renders inside the mounted region without a single expression
    of its own showing at the call site, so its body has to be walked too or a
    partial becomes the way to smuggle a sink past the lint.
    """
    source = _scannable(source)
    low, high = span
    return [match.group(1) for match in _INCLUDE.finditer(source, low, high)]


def cleared_by(expression):
    """Which safe shape allows `expression` inside a mounted region, or None."""
    for label, shape in SAFE_SHAPES:
        if shape.fullmatch(expression.text):
            return label
    return None


def scan(name, source, allowlist=None):
    """Report every expression written unprotected into one of `name`'s regions.

    `allowlist` defaults to the recorded sinks; pass an empty set to see the
    tree as it will look once every remaining sink has been converted.
    """
    if allowlist is None:
        allowlist = allowlisted_sinks()
    findings = []
    for root_id, span, root_start in mounted_regions(name, source):
        reachable = [(name, source, span, root_start)]
        for included in included_in(source, span):
            body = _sources().get(included)
            if body is not None:
                reachable.append((included, body, (0, len(body)), None))
        for origin, body, region, start in reachable:
            for expression in expressions_in(body, region, start):
                if cleared_by(expression) is not None:
                    continue
                if (origin, expression.text) in allowlist:
                    continue
                findings.append(Finding(origin, expression.line, root_id, expression.text))
    return sorted(findings)


def allowlisted_sinks():
    return {(sink.template, text) for sink in KNOWN_SINKS for text in sink.expressions}


def scan_tree(allowlist=None):
    findings = []
    for name, source in sorted(_sources().items()):
        findings += scan(name, source, allowlist)
    return findings


def derive_inventory():
    """`(MountRoot, ...)` and the mounts that resolve to no element."""
    roots, absent = [], []
    for name, source in sorted(_sources().items()):
        if name != LAYOUT and not _EXTENDS.search(source):
            continue  # a macro or an include, not a page
        for root_id, mounted_by in sorted(mount_root_ids(name, source).items()):
            region = region_template(name, root_id)
            if region is None:
                absent.append((name, root_id))
            else:
                roots.append(MountRoot(name, root_id, _kind(region, root_id), mounted_by))
    return tuple(roots), tuple(absent)


def region_template(name, root_id):
    """The template whose markup holds `root_id`'s element, or None."""
    if _declaration(_sources()[name], root_id) is not None:
        return name
    if root_id == LAYOUT_REGION_ID:
        return LAYOUT
    return ROOT_ELEMENT_ELSEWHERE.get((name, root_id))


def _kind(name, root_id):
    """"page" if the root holds server-rendered content, "widget" if empty."""
    source = _sources()[name]
    opening = _declaration(source, root_id)
    _start, end = _element_span(source, opening)
    inner = source[source.find(">", opening.start()) + 1:end]
    return "page" if re.sub(r"</\w+\s*>\s*$", "", inner).strip() else "widget"


def derive_unmounted_pages():
    return tuple(
        name for name, source in sorted(_sources().items())
        if _EXTENDS.search(source) and not mounted_regions(name, source)
    )


def delimiter_literals():
    """Every `delimiters: [...]` the project declares, vendored bundles aside."""
    files = list(template_paths())
    files += [
        path for path in sorted(STATIC_JS.rglob("*.js"))
        if path.name not in VENDORED_JS
    ]
    found = []
    for path in files:
        source = path.read_text()
        for match in _DELIMITERS.finditer(source):
            found.append(Delimiters(
                path.relative_to(_REPO).as_posix(),
                source.count("\n", 0, match.start()) + 1,
                (match.group(2), match.group(4))
            ))
    return found
