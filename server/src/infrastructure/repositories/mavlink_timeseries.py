from common.logging import get_logger
from domain import ID_Type
from domain.mavlink_timeseries.entities import MavLinkTimeseries
from infrastructure.db.orm import MavLinkTimeseries as MavLinkTimeseriesModel
from infrastructure.repositories.base import BaseRepository
from pymavlog import MavLinkMessageSeries
from sqlalchemy.orm import Session

logger = get_logger(__name__)


class MavLinkTimeseriesRepository(BaseRepository):
    _model = MavLinkTimeseriesModel
    _entity = MavLinkTimeseries

    def bulk_insert(self, session: Session, flight_id: ID_Type, series: MavLinkMessageSeries):
        try:
            timestamps = series["timestamp"]
            data = []
            for field in series.columns:
                data.extend(
                    [
                        {
                            "flight_id": flight_id,
                            "timestamp": timestamps[idx],
                            "message_type": series.name,
                            "message_field": field,
                            "value": value,
                        }
                        for idx, value in enumerate(series[field])
                        if (type(value) in [int, float]) and (field not in ["timestamp", "TimeUS"])
                    ]
                )
            logger.debug("inserting %s", field)
            session.bulk_insert_mappings(
                self._model,
                data,
            )
            session.commit()
            logger.info("inserting %s - done", field)
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

    def delete_by_flight_id(self, session: Session, flight_id: ID_Type):
        try:
            query = session.query(self._model).filter_by(
                flight_id=flight_id,
            )
            query.delete()
            session.commit()
        except Exception as e:
            session.rollback()
            raise e
