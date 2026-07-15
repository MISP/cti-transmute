"""Persist params + replace free-form conversion_type with source/target (spine 05).

Stores the typed Pydantic params each conversion ran with, and replaces the
stored free-form ``conversion_type`` string with explicit ``source_format`` /
``target_format`` Converter slugs. ``conversion_type`` survives as a *derived*
hybrid property on the model (``f"{source}_to_{target}".upper()``), so it is no
longer a persisted column.

Data is preserved: ``source_format`` / ``target_format`` are backfilled from the
old ``conversion_type`` (split on ``_TO_``, lowercased) before the column is
dropped. Pre-migration rows get ``params = NULL`` — the concept did not exist for
them, and the read-side renders "Parameters not recorded" rather than faking values.

NOTE: ``params`` uses generic ``JSON`` (not ``JSONB``) to match the portable
``db.JSON`` model type, which also runs under the SQLite test harness. params is
write-only (never queried), so JSONB buys nothing here.

Revision ID: a7b9c1d3e5f7
Revises: f1a2b3c4d5e6
"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = 'a7b9c1d3e5f7'
down_revision = 'f1a2b3c4d5e6'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('conversion', sa.Column('source_format', sa.String(length=50), nullable=True))
    op.add_column('conversion', sa.Column('target_format', sa.String(length=50), nullable=True))
    op.add_column('conversion', sa.Column('params', sa.JSON(), nullable=True))
    # Backfill the explicit slugs from the old free-form discriminator.
    op.execute(
        "UPDATE conversion SET "
        "source_format = lower(split_part(conversion_type, '_TO_', 1)), "
        "target_format = lower(split_part(conversion_type, '_TO_', 2)) "
        "WHERE conversion_type IS NOT NULL"
    )
    op.drop_column('conversion', 'conversion_type')

    op.add_column('conversion_history', sa.Column('params', sa.JSON(), nullable=True))


def downgrade():
    op.drop_column('conversion_history', 'params')

    op.add_column('conversion', sa.Column('conversion_type', sa.String(length=50), nullable=True))
    # Reconstruct the free-form discriminator from the slugs.
    op.execute(
        "UPDATE conversion SET "
        "conversion_type = upper(source_format || '_TO_' || target_format) "
        "WHERE source_format IS NOT NULL AND target_format IS NOT NULL"
    )
    op.alter_column('conversion', 'conversion_type', nullable=False)
    op.drop_column('conversion', 'params')
    op.drop_column('conversion', 'target_format')
    op.drop_column('conversion', 'source_format')
