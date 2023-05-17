from presentation.worker import celery_app
from presentation.worker.dependencies import get_log_processing_service


@celery_app.task(name="flight_duration", bind=True)
def process_flight_duration(self, flight_id):
    log_processing_service = get_log_processing_service()
    return log_processing_service.process_flight_duration(flight_id)
