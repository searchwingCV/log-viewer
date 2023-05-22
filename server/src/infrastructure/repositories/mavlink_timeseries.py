from domain import ID_Type
from domain.mavlink_timeseries.entities import MavLinkTimeseries
from infrastructure.db.orm import MavLinkTimeseries as MavLinkTimeseriesModel
from infrastructure.repositories.base import BaseRepository
from pymavlog import MavLinkMessageSeries
from sqlalchemy.orm import Session


class MavLinkTimeseriesRepository(BaseRepository):
    _model = MavLinkTimeseriesModel
    _entity = MavLinkTimeseries

    def bulk_insert(self, session: Session, flight_id: ID_Type, series: MavLinkMessageSeries):
        try:
            timestamps = series["timestamp"]
            for field in series.columns:
                if field == "timestamp":
                    continue
                session.bulk_insert_mappings(
                    self._model,
                    [
                        {
                            "flight_id": flight_id,
                            "timestamp": timestamps[idx],
                            "message_type": series.name,
                            "message_field": field,
                            "value": value,
                        }
                        for idx, value in enumerate(series[field])
                    ],
                )
                session.commit()
        except Exception as e:
            session.rollback()
            raise e

    def get_by_flight_type_field(
        self,
        session: Session,
        flight_id: ID_Type,
        message_type: str,
        message_field: str,
    ) -> MavLinkTimeseries:
        query = (
            session.query(self._model)
            .filter_by(
                flight_id=flight_id,
                message_type=message_type,
                message_field=message_field,
            )
            .order_by(self._model.timestamp.asc())
        )
        return MavLinkTimeseries.build_from_entries(
            flight_id=flight_id, message_type=message_type, message_field=message_field, entries=query.all()
        )
