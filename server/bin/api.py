import os
from argparse import ArgumentParser, Namespace

import uvicorn
from alembic.command import upgrade
from alembic.config import Config as AlembicConfig
from common.logging import get_logger
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from presentation.rest.controllers import drone, file, flight, health, mission, root
from presentation.rest.serializers.errors import InternalServerError

logger = get_logger(__name__)


def migrate_db():
    try:
        logger.info("Running DB migrations")
        basedir = os.path.join(os.path.dirname(os.path.realpath(__file__)), os.pardir)
        migrations_dir = os.path.join(basedir, "migrations")

        config = AlembicConfig(file_=os.path.join(basedir, "alembic.ini"))
        config.set_main_option("script_location", migrations_dir)

        upgrade(config, "head")
        logger.info("DB migrated!")
    except Exception:
        logger.exception("Error while running migrations, aborting boot...")
        raise


def get_args() -> Namespace:
    parser = ArgumentParser()
    parser.add_argument("--port", help="The HTTP port to listen", type=int, default=80)
    parser.add_argument("--host", help="The host to listen to", type=str, default="0.0.0.0")
    parser.add_argument("--log-level", help="Log level", type=str, default="info")
    parser.add_argument(
        "--workers",
        help="Number of workers to handle HTTP requests",
        type=int,
        default=1,
    )
    parser.add_argument("--debug", help="Activate debug", action="store_true")
    parser.add_argument("--reload", help="Activate reload (only for dev)", action="store_true")
    parser.add_argument("--automigrate", help="Run migrations on startup", action="store_true")
    return parser.parse_args()


def log_exception_handler(request: Request, exc: Exception):
    logger.exception(f"exception detected in request -> {request} ")
    return Response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=InternalServerError(detail=str(exc)).json(),
    )


def build_api() -> FastAPI:
    app = FastAPI(
        title="Searchwing flight log data API",
        description="An API to keep log files organized and analyze them",
    )
    origins = [
        "http://localhost",
        "http://localhost:3000",
        "http://staging.flight-data.searchwing.org",
        "http://flight-data.searchwing.org",
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(root.router)
    app.include_router(health.router)
    app.include_router(drone.router)
    app.include_router(mission.router)
    app.include_router(flight.router)
    app.include_router(file.router)

    app.add_exception_handler(Exception, log_exception_handler)

    return app


if __name__ == "__main__":
    args = get_args()

    if args.automigrate:
        migrate_db()

    uvicorn.run(
        "bin.api:build_api",
        port=args.port,
        host=args.host,
        log_level=args.log_level,
        workers=args.workers,
        reload=args.reload,
        debug=args.debug,
    )
