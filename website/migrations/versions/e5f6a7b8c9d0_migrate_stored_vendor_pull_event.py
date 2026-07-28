"""Migrate the stored 'tags_vendor_pull_started' event to 'tags_submodule_pull_started'.

The vendor/ shelf is renamed to submodules/ and the word swept from the
runtime vocabulary; the pull-and-import activity-log event rides along.
The activity log is rewritable display data (see the stored-convert-values
migration), so historical rows are rewritten in place rather than
translated at read time.

Idempotent by construction (the UPDATE matches the old value only) and
downgrade applies the exact inverse.

Revision ID: e5f6a7b8c9d0
Revises: c4d5e6f7a8b9
"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = 'e5f6a7b8c9d0'
down_revision = 'c4d5e6f7a8b9'
branch_labels = None
depends_on = None

_OLD = 'tags_vendor_pull_started'
_NEW = 'tags_submodule_pull_started'


def _apply(old: str, new: str) -> None:
    op.get_bind().execute(
        sa.text("UPDATE system_log SET event_type = :new WHERE event_type = :old"),
        {"old": old, "new": new},
    )


def upgrade():
    _apply(_OLD, _NEW)


def downgrade():
    _apply(_NEW, _OLD)
