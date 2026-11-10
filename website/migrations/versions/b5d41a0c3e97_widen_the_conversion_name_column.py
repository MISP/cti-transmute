"""Widen conversion.name to the length the model has declared since 1.5.

The models were changed from 100 to 255 characters without a revision, so a
database bootstrapped before that change still holds varchar(100) while every
install created since holds varchar(255). On the narrow column a conversion
whose name comes from the submitted document - a STIX report title runs well
past 100 characters - is converted in full and then refused at the insert.

Revision ID: b5d41a0c3e97
Revises: c7a93b4e1d26
Create Date: 2026-10-21 09:14:52.118374

"""
import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision = 'b5d41a0c3e97'
down_revision = 'c7a93b4e1d26'
branch_labels = None
depends_on = None


def upgrade():
    # Already 255 on an install created after the model change, and on the one
    # widened by hand; widening to the width it already has is a no-op there.
    with op.batch_alter_table('conversion', schema=None) as batch_op:
        batch_op.alter_column('name',
               existing_type=sa.VARCHAR(length=100),
               type_=sa.String(length=255),
               existing_nullable=False)


def downgrade():
    # Names longer than 100 characters are the reason this revision exists, so
    # the narrowing has to say what happens to them: Postgres refuses the cast
    # unless they are cut first.
    op.execute(
        "UPDATE conversion SET name = LEFT(name, 100) WHERE LENGTH(name) > 100")
    with op.batch_alter_table('conversion', schema=None) as batch_op:
        batch_op.alter_column('name',
               existing_type=sa.VARCHAR(length=255),
               type_=sa.String(length=100),
               existing_nullable=False)
