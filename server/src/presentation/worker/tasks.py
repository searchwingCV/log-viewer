from common.config import get_current_config
from presentation.worker import celery_app
from presentation.worker.dependencies import get_log_processing_service

config = get_current_config()


@celery_app.task(name="flight_duration", bind=True)
def process_flight_duration(self, flight_id):
    log_processing_service = get_log_processing_service()
    return log_processing_service.process_flight_duration(flight_id)


@celery_app.task(name="save_timeseries", bind=True)
def save_timeseries(self, flight_id):
    log_processing_service = get_log_processing_service()
    return log_processing_service.save_timeseries(flight_id, config.MAVLOG_MAX_RATE_HZ)
