"""add source_type to convert_tag_association

Revision ID: a1f3c8e2d947
Revises: 60afda35ece4
Create Date: 2026-05-28

"""
from alembic import op
import sqlalchemy as sa

revision = 'a1f3c8e2d947'
down_revision = '60afda35ece4'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'convert_tag_association',
        sa.Column('source_type', sa.String(10), nullable=False, server_default='user')
    )


def downgrade():
    op.drop_column('convert_tag_association', 'source_type')
