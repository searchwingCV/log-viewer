import logging

# from src.presentation.worker import celery_app as app
from src.presentation.worker.factory import make_celery

if __name__ == "__main__":
    app = make_celery()

    # app.autodiscover_tasks(force=True)

    worker = app.Worker(include=["src.presentation.worker.tasks"], queues=["hello"])
    worker.setup_defaults(loglevel=logging.DEBUG)
    worker.start()
