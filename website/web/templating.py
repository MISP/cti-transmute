"""Vue's expression delimiters, neutralised in everything the server renders.

Vue compiles the DOM it mounts over, so a server-rendered value carrying the
delimiters the apps are configured with is not text: it is an expression Vue
evaluates through ``new Function``. The nonce CSP does not stop that - Vue's
runtime compiler is exactly why the policy has to keep ``'unsafe-eval'``. This
module splits those delimiters in every value the server writes into a page.

It is registered as the Jinja environment's ``finalize`` hook, so it applies to
every ``{{ ... }}`` in every template at once. That is the point: a per-call-site
filter would have to be remembered by every future template, which is the
failure mode being fixed.

HTML-escaping the brackets does not work. Vue reads its in-DOM template from
``container.innerHTML``, by which point the browser has parsed ``&#91;`` back
into ``[`` and the serialiser leaves it that way - only ``&``, ``<`` and ``>``
survive a round trip. The delimiter has to stop being the delimiter in the DOM
text itself, which is what the word joiner does: zero-width and non-breaking,
so the page still shows the brackets the submitter typed, side by side.
"""

import re

from jinja2 import pass_eval_context

# The pair every Vue app in this project is configured with. Defined once, so
# the neutralisation and the front-end configuration cannot drift apart over
# what needs neutralising.
VUE_DELIMITERS = ("[[", "]]")

# U+2060 WORD JOINER renders as nothing and forbids a line break, so a split
# delimiter still displays as two adjacent brackets.
WORD_JOINER = "\u2060"

# Matches the empty string between a delimiter's first character and the rest.
# Splitting at every such seam handles overlapping runs: a left-to-right
# ``str.replace`` on "[[[" consumes the first pair and steps over the second,
# leaving a live delimiter behind - and the payloads open on exactly that.
_DELIMITER_SEAMS = re.compile("|".join(
    f"(?<={re.escape(delimiter[0])})(?={re.escape(delimiter[1:])})"
    for delimiter in VUE_DELIMITERS
))

# Every character a delimiter is built from.
_DELIMITER_CHARS = frozenset("".join(VUE_DELIMITERS))


def neutralise_delimiters(text: str) -> str:
    """Return `text` with a word joiner inside every Vue delimiter.

    A joiner also guards either end that sits on a delimiter character. The
    hook below sees one expression at a time, so two adjacent ones - the
    profile page renders its avatar initials as ``{{ first[0] }}{{ last[0] }}``
    - would otherwise reassemble a live delimiter out of two values that each
    carry none.
    """
    text = _DELIMITER_SEAMS.sub(WORD_JOINER, text)
    if text[:1] in _DELIMITER_CHARS:
        text = WORD_JOINER + text
    if text[-1:] in _DELIMITER_CHARS:
        text += WORD_JOINER
    return text


@pass_eval_context
def neutralise_delimiters_in_output(eval_ctx, value):
    """Jinja ``finalize``: runs on every rendered expression before escaping.

    Only values Jinja is about to escape into HTML are touched. A value that
    already declares itself markup (``|safe``, ``|tojson``, a macro's return)
    is the template author's own, and splitting delimiters inside it would
    corrupt the JSON data islands the front end reads its state from - ``]]``
    ends every nested array. Expressions inside a macro are still finalised
    individually, so only the assembled markup is passed over.

    Everything else is rendered through ``str`` first, the same conversion
    Jinja's escaping would have applied: a list renders as ``[[1, 2]]``, which
    is a live delimiter Python's own repr handed over.
    """
    if not eval_ctx.autoescape or hasattr(value, "__html__"):
        return value
    return neutralise_delimiters(str(value))
