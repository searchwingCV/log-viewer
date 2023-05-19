import logging
from argparse import ArgumentParser, Namespace

from src.presentation.worker import celery_app as app


def get_args() -> Namespace:
    parser = ArgumentParser()
    parser.add_argument("--debug", help="Activate debug", action="store_true")
    return parser.parse_args()


if __name__ == "__main__":
    args = get_args()

    worker = app.Worker(include=["src.presentation.worker.tasks"])
    worker.setup_defaults(loglevel=logging.DEBUG if args.debug else logging.INFO)
    worker.start()
