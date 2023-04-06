FROM python:3.10.10-slim-buster as base
LABEL maintainer="searchwing"
RUN apt-get update \
    && apt-get -y install libpq-dev gcc

WORKDIR /searchwing

COPY requirements.txt requirements.txt
COPY src src
COPY bin bin

ENV PYTHONPATH="/searchwing:/searchwing/src:"

CMD ["python", "bin/api.py", "--automigrate"]
FROM base as dev

COPY requirements-dev.txt requirements-dev.txt
COPY migrations migrations
COPY scripts scripts
COPY tests tests
COPY ./alembic.ini ./alembic.ini
RUN python -m pip install -r requirements.txt
RUN python -m pip install -r requirements-dev.txt
CMD ["python", "bin/api.py", "--automigrate"]

ENV PYTHONPATH="/searchwing:/searchwing/src:/searchwing/migrations"

FROM base as prod
RUN python -m pip install -r requirements.txt
CMD ["python", "bin/api.py", "--automigrate"]
