"""Migrate stored 'convert' values to 'conversion'.

The activity log and notifications are display data, not tamper-evident audit
evidence: when the domain vocabulary changes, stored rows are rewritten in
place rather than translated at read time. The last stored-data remnants of
the retired noun. Machine values are re-keyed via exact maps; free text via
exact known patterns. The facts (actor, action, target, timestamp) are untouched.

Idempotent by construction (every UPDATE matches the old value only), so rows
the code already wrote as 'conversion' pass through unchanged.
Downgrade applies the exact inverse; rows written by newer code map back to
the old vocabulary too, which is what older code expects to read.

Revision ID: c4d5e6f7a8b9
Revises: a7b9c1d3e5f7
"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = 'c4d5e6f7a8b9'
down_revision = 'a7b9c1d3e5f7'
branch_labels = None
depends_on = None


# Whole-value machine enums: (table, column, old, new).
_VALUES = [
    *[('system_log', 'event_type', f'convert_{stem}', f'conversion_{stem}')
      for stem in (
          'created', 'refreshed', 'history_accepted', 'history_rejected',
          'deleted', 'edited', 'visibility_changed', 'favorited',
          'unfavorited', 'restored', 'hard_deleted',
      )],
    ('system_log', 'target_type', 'convert', 'conversion'),
    ('system_log', 'target_type', 'convert_history', 'conversion_history'),
    ('notification', 'related_type', 'convert', 'conversion'),
    ('notification', 'type', 'new_follow_convert', 'new_follow_conversion'),
]

# Full-value free text (the writer stored exactly this string): equality.
_TEXT_EQUALS = [
    ('system_log', 'details', 'Liked convert', 'Liked conversion'),
    ('system_log', 'details', 'Removed like from convert', 'Removed like from conversion'),
    ('system_log', 'details', 'Disliked convert', 'Disliked conversion'),
    ('system_log', 'details', 'Removed dislike from convert', 'Removed dislike from conversion'),
]

# Substring free text: replace() guarded by LIKE. No pattern contains a
# LIKE wildcard (% or _), so the guard is literal.
_TEXT_INFIX = [
    ('system_log', 'details', ' convert(s), job=', ' conversion(s), job='),
    ('system_log', 'target_name', 'On convert: ', 'On conversion: '),
    ('system_log', 'target_name', 'On convert #', 'On conversion #'),
    ('notification', 'message', 'reported convert: ', 'reported conversion: '),
    ('notification', 'message', 'on your convert "', 'on your conversion "'),
]


def _apply(forward: bool) -> None:
    conn = op.get_bind()
    direction = (lambda old, new: (old, new)) if forward else (lambda old, new: (new, old))

    for table, column, a, b in _VALUES + _TEXT_EQUALS:
        old, new = direction(a, b)
        conn.execute(
            sa.text(f"UPDATE {table} SET {column} = :new WHERE {column} = :old"),  # noqa: S608 — identifiers from the fixed lists above
            {"old": old, "new": new},
        )
    for table, column, a, b in _TEXT_INFIX:
        old, new = direction(a, b)
        conn.execute(
            sa.text(
                f"UPDATE {table} SET {column} = replace({column}, :old, :new) "  # noqa: S608
                f"WHERE {column} LIKE :pattern"
            ),
            {"old": old, "new": new, "pattern": f"%{old}%"},
        )


def upgrade():
    _apply(forward=True)


def downgrade():
    _apply(forward=False)
