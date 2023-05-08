from celery import Celery
from common.config import get_current_config

cfg = get_current_config()


def make_celery(config: dict = cfg.CELERY_CONFIG) -> Celery:
    celery_app = Celery("worker")
    celery_app.conf.update(config)
    celery_app.conf.imports = ["src.presentation.worker.tasks"]
    return celery_app
