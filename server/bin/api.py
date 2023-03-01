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
    parser.add_argument("--debug", help="Activate debug", type=bool, default=False)
    parser.add_argument("--reload", help="Activate reload (only for dev)", type=bool, default=False)
    return parser.parse_args()


def run_api():
    args = get_args()

    app = FastAPI(
        title="Searchwing flight log data API",
        description="An API to keep log files organized and analyze them",
    )

    app.include_router(root.router)
    app.include_router(health.router)
    app.include_router(plane.router)
    app.include_router(mission.router)
    app.include_router(flight.router)

    uvicorn.run(
        app,
        port=args.port,
        host=args.host,
        log_level=args.log_level,
        workers=args.workers,
        reload=args.reload,
        debug=args.debug,
    )


if __name__ == "__main__":
    run_api()
