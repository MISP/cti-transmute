"""Give bulk conversion-tag jobs a durable home.

Creates ``bulk_tag_job``, the durable home for state the bulk tag workers kept
in a module-level dict: progress, counts and per-item errors. No data
migration — what this replaces lived in process memory and was lost on every
restart anyway.

``token`` is the public job id (it appears in the poll URL and in audit
entries); the integer primary key stays internal so an enumerable route never
hands out a sequential row counter.

NOTE: generic ``JSON`` (not ``JSONB``) for ``errors``, to match the portable
``db.JSON`` model type that also runs under the SQLite test harness; the list
is read and written whole, never queried into.

Revision ID: c7a93b4e1d26
Revises: f7c1b2a45d38
"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = 'c7a93b4e1d26'
down_revision = 'f7c1b2a45d38'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'bulk_tag_job',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=32), nullable=False),
        sa.Column('job_type', sa.String(length=20), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('total', sa.Integer(), nullable=False),
        sa.Column('progress', sa.Integer(), nullable=False),
        sa.Column('affected', sa.Integer(), nullable=False),
        sa.Column('skipped', sa.Integer(), nullable=False),
        sa.Column('errors', sa.JSON(), nullable=True),
        sa.Column('error_count', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('heartbeat_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('bulk_tag_job', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_bulk_tag_job_token'), ['token'], unique=True)
        batch_op.create_index(batch_op.f('ix_bulk_tag_job_created_at'), ['created_at'], unique=False)


def downgrade():
    with op.batch_alter_table('bulk_tag_job', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_bulk_tag_job_created_at'))
        batch_op.drop_index(batch_op.f('ix_bulk_tag_job_token'))

    op.drop_table('bulk_tag_job')
