import logging
from fastapi import FastAPI
from uicheckapp.services import EchoService

# setup loggers
logging.config.fileConfig('logging.conf', disable_existing_loggers=False)

# get root logger
logger = logging.getLogger(__name__)  # the __name__ resolve to "main" since we are at the root of the project. 
                                      # This will get the root logger since no logger in the configuration has this name.

app = FastAPI()


@app.get("/")
async def root():
    logger.info("logging from the root logger")
    EchoService.echo("hi")
    return {"status": "alive"}