"""add platform_review table

Revision ID: b2e4f1a9c035
Revises: a1f3c8e2d947
Create Date: 2026-05-28

"""
from alembic import op
import sqlalchemy as sa

revision = 'b2e4f1a9c035'
down_revision = 'a1f3c8e2d947'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('platform_review',
        sa.Column('id',         sa.Integer(),  nullable=False),
        sa.Column('user_id',    sa.Integer(),  nullable=True),
        sa.Column('rating',     sa.Integer(),  nullable=False),
        sa.Column('comment',    sa.Text(),     nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_platform_review_user_id',    'platform_review', ['user_id'])
    op.create_index('ix_platform_review_created_at', 'platform_review', ['created_at'])


def downgrade():
    op.drop_index('ix_platform_review_created_at', 'platform_review')
    op.drop_index('ix_platform_review_user_id',    'platform_review')
    op.drop_table('platform_review')
