"""Rename Convert -> Conversion: tables and FK columns (spine 04).

The persisted record is a **Conversion**, not a Convert (CONTEXT.md glossary).
This renames the six `convert*` tables and every `convert_id` foreign-key column
to their `conversion*` / `conversion_id` equivalents. Data is preserved — these
are in-place renames, not drop/create.

Constraint and index *names* that embed "convert" are left as-is: they are
cosmetic (Postgres keys foreign keys by table identity, not name) and renaming
them is not required for correctness. The SQLAlchemy models reference these
constraints by their unchanged names, so model and schema stay in sync.

Revision ID: f1a2b3c4d5e6
Revises: 08cac0fef09f
"""
from alembic import op

# revision identifiers, used by Alembic.
revision = 'f1a2b3c4d5e6'
down_revision = '08cac0fef09f'
branch_labels = None
depends_on = None


# (old_table, new_table)
_TABLES = [
    ("convert", "conversion"),
    ("convert_report", "conversion_report"),
    ("convert_history", "conversion_history"),
    ("convert_favorite", "conversion_favorite"),
    ("convert_evaluation", "conversion_evaluation"),
    ("convert_tag_association", "conversion_tag_association"),
]

# Tables carrying a `convert_id` FK column (post-table-rename names). `comment`
# is not renamed but its column is.
_FK_COLUMN_TABLES = [
    "comment",
    "conversion_report",
    "conversion_history",
    "conversion_favorite",
    "conversion_evaluation",
    "conversion_tag_association",
]


def upgrade():
    for old, new in _TABLES:
        op.rename_table(old, new)
    for table in _FK_COLUMN_TABLES:
        op.alter_column(table, "convert_id", new_column_name="conversion_id")


def downgrade():
    for table in _FK_COLUMN_TABLES:
        op.alter_column(table, "conversion_id", new_column_name="convert_id")
    for old, new in _TABLES:
        op.rename_table(new, old)
