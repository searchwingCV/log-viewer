"""create extension timescaledb-toolkit

Revision ID: 80f7539b8ca8
Revises: e383d0a99bfa
Create Date: 2023-07-10 17:40:16.134920

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "80f7539b8ca8"
down_revision = "e383d0a99bfa"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.execute("CREATE EXTENSION IF NOT EXISTS timescaledb_toolkit;")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.execute("DROP EXTENSION IF EXISTS timescaledb_toolkit;")
    # ### end Alembic commands ###