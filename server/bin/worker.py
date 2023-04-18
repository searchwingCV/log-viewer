import logging

from src.presentation.worker import celery_app as app

if __name__ == "__main__":
    app.autodiscover_tasks(force=True)
    worker = app.Worker(include=["src.presentation.worker.tasks"])

    worker.setup_defaults(loglevel=logging.DEBUG)
    worker.start()
