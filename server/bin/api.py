from argparse import ArgumentParser, Namespace

import uvicorn
from fastapi import FastAPI
from src.presentation.rest.controllers import flight, health, mission, plane, root


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
    return parser.parse_args()


def build_api() -> FastAPI:

    app = FastAPI(
        title="Searchwing flight log data API",
        description="An API to keep log files organized and analyze them",
    )

    app.include_router(root.router)
    app.include_router(health.router)
    app.include_router(plane.router)
    app.include_router(mission.router)
    app.include_router(flight.router)

    return app


if __name__ == "__main__":
    args = get_args()

    uvicorn.run(
        "bin.api:build_api",
        port=args.port,
        host=args.host,
        log_level=args.log_level,
        workers=args.workers,
        reload=args.reload,
        debug=args.debug,
    )
