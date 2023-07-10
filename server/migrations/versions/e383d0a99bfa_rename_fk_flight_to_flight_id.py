"""rename fk_flight to flight_id

Revision ID: e383d0a99bfa
Revises: 10a897dc176b
Create Date: 2023-05-22 15:57:59.094012

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "e383d0a99bfa"
down_revision = "10a897dc176b"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint("mavlink_timeseries_fk_flight_fkey", "mavlink_timeseries", type_="foreignkey")
    op.alter_column("mavlink_timeseries", "fk_flight", nullable=False, new_column_name="flight_id")
    op.create_foreign_key(None, "mavlink_timeseries", "flight", ["flight_id"], ["id"])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint("mavlink_timeseries_fk_flight_fkey", "mavlink_timeseries", type_="foreignkey")
    op.alter_column("mavlink_timeseries", "flight_id", nullable=False, new_column_name="fk_flight")
    op.create_foreign_key(None, "mavlink_timeseries", "flight", ["fk_flight"], ["id"])
    # ### end Alembic commands ###
