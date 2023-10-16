from datetime import datetime
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
                        for idx, value in enumerate(series.raw_fields[field])
                        if (type(value) in [int, float]) and (field not in ["timestamp", "TimeUS"])
                    ]
                )
                if len(data) == 0:
                    logger.warning(f"empty field -> {field}")
            logger.info(f"inserting {series.name}, columns={series.columns}")
            session.bulk_insert_mappings(
                self._model,
                data,
            )
            session.commit()
            logger.info("inserting %s - done", series.name)
        except Exception as e:
            logger.exception("something went wrong while inserting")
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

    def _timeseries_sql_query(
        self, flight_id: ID_Type, message_type: str, message_field, start_timestamp, end_timestamp
    ) -> str:
        query = f"""
        SELECT mavlink_timeseries.timestamp, mavlink_timeseries.value
        FROM mavlink_timeseries
        WHERE mavlink_timeseries.flight_id = {flight_id}
        AND mavlink_timeseries.message_type = '{message_type}'
        AND mavlink_timeseries.message_field = '{message_field}'
        """
        if start_timestamp:
            query += f" AND mavlink_timeseries.timestamp >= '{start_timestamp}'"
        if end_timestamp:
            query += f" AND mavlink_timeseries.timestamp <= '{end_timestamp}'"
        query += " ORDER BY mavlink_timeseries.timestamp ASC"
        return query

    def _timeseries_sql_query_lttb(
        self,
        flight_id: ID_Type,
        message_type: str,
        message_field: str,
        start_timestamp: datetime,
        end_timestamp: datetime,
        n_points: int,
    ) -> str:
        query = f"""
        SELECT time as timestamp, value
        FROM unnest(
            (SELECT lttb(timestamp, value, {n_points})
                    FROM mavlink_timeseries
                    WHERE mavlink_timeseries.flight_id = {flight_id}
                    AND mavlink_timeseries.message_type = '{message_type}'
                    AND mavlink_timeseries.message_field = '{message_field}'
        """
        if start_timestamp:
            query += f" AND mavlink_timeseries.timestamp >= '{start_timestamp}'"
        if end_timestamp:
            query += f" AND mavlink_timeseries.timestamp <= '{end_timestamp}'"
        query += " )) ORDER BY timestamp ASC"
        return query

    def get_by_flight_type_field(
        self,
        session: Session,
        flight_id: ID_Type,
        message_type: str,
        message_field: str,
        start_timestamp: datetime | None = None,
        end_timestamp: datetime | None = None,
        n_points: int | None = None,
    ) -> MavLinkTimeseries:
        if n_points is None:
            query = self._timeseries_sql_query(flight_id, message_type, message_field, start_timestamp, end_timestamp)
        else:
            query = self._timeseries_sql_query_lttb(
                flight_id, message_type, message_field, start_timestamp, end_timestamp, n_points
            )

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
