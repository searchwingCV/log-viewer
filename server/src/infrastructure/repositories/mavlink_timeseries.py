from typing import Type

from common.logging import get_logger
from domain import ID_Type
from domain.mavlink_timeseries.entities import MavLinkFlightMessageProperties, MavLinkTimeseries
from infrastructure.db.orm import MavLinkTimeseries as MavLinkTimeseriesModel
from infrastructure.repositories.base import BaseRepository
from pymavlog import MavLinkMessageSeries
from sqlalchemy.orm import Session

logger = get_logger(__name__)


class MavLinkTimeseriesRepository(BaseRepository):
    _model: Type[MavLinkTimeseriesModel] = MavLinkTimeseriesModel
    _entity: Type[MavLinkTimeseries] = MavLinkTimeseries

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

    def get_available_messages_by_group(self, session: Session, flight_id: ID_Type) -> MavLinkFlightMessageProperties:
        """
        Returns available messages by flight id
        """
        query = (
            session.query(self._model)
            .filter_by(flight_id=flight_id)
            .group_by(
                self._model.flight_id,
                self._model.message_type,
                self._model.message_field,
            )
            .with_entities(
                self._model.flight_id,
                self._model.message_type,
                self._model.message_field,
            )
        )
        entries = query.all()
        flight_messages = MavLinkFlightMessageProperties(flight_id=flight_id, message_properties=[])
        flight_messages.add_entries(entries)
        return flight_messages

    def get_by_flight_type_field(
        self,
        session: Session,
        flight_id: ID_Type,
        message_type: str,
        message_field: str,
    ) -> MavLinkTimeseries:
        query = f"""
        SELECT mavlink_timeseries.timestamp, mavlink_timeseries.value
        FROM mavlink_timeseries
        WHERE mavlink_timeseries.flight_id = {flight_id}
        AND mavlink_timeseries.message_type = '{message_type}'
        AND mavlink_timeseries.message_field = '{message_field}'
        ORDER BY mavlink_timeseries.timestamp ASC;
        """
        result = session.execute(query).all()

        return MavLinkTimeseries.build_from_entries(
            flight_id=flight_id,
            message_type=message_type,
            message_field=message_field,
            entries=result,
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
