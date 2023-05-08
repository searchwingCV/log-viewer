FROM python:3.10.10-slim-buster as base
LABEL maintainer="searchwing"
RUN apt-get update \
    && apt-get -y install libpq-dev gcc

WORKDIR /searchwing

COPY requirements.txt requirements.txt
COPY src src
COPY bin bin
COPY tmp tmp
COPY requirements-dev.txt requirements-dev.txt
COPY migrations migrations
COPY scripts scripts
COPY tests tests
COPY ./alembic.ini ./alembic.ini

ENV PYTHONPATH="/searchwing:/searchwing/src:"

CMD ["python", "bin/api.py", "--automigrate"]
FROM base as dev

RUN python -m pip install -r requirements.txt
RUN python -m pip install -r requirements-dev.txt
ENV PYTHONPATH="/searchwing:/searchwing/src:/searchwing/migrations"

FROM dev as dev-api
CMD ["python", "bin/api.py", "--automigrate", "--debug"]

FROM dev as dev-worker
CMD ["python", "bin/worker.py", "--debug"]

FROM base as prod
RUN python -m pip install -r requirements.txt

FROM prod as prod-api
CMD ["python", "bin/api.py", "--automigrate"]

FROM prod as prod-worker
CMD ["python", "bin/worker.py"]
