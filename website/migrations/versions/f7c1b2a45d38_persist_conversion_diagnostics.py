"""Persist the Diagnostics a conversion's output came with.

Adds a nullable ``diagnostics`` JSON column to ``conversion`` and
``conversion_history``, holding the converter's own report verbatim
(``{warnings, errors, counts}``). Pre-migration rows get ``NULL`` — the concept
did not exist for them, and the read side renders "not recorded" rather than
claiming a clean conversion.

NOTE: generic ``JSON`` (not ``JSONB``) to match the portable ``db.JSON`` model
type, which also runs under the SQLite test harness; the blob is write-and-read
whole, never queried into, so JSONB buys nothing here.

Revision ID: f7c1b2a45d38
Revises: e5f6a7b8c9d0
"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = 'f7c1b2a45d38'
down_revision = 'e5f6a7b8c9d0'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('conversion', sa.Column('diagnostics', sa.JSON(), nullable=True))
    op.add_column('conversion_history', sa.Column('diagnostics', sa.JSON(), nullable=True))


def downgrade():
    op.drop_column('conversion_history', 'diagnostics')
    op.drop_column('conversion', 'diagnostics')
