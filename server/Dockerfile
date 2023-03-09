FROM python:3.10.9-slim-buster
LABEL maintainer="searchwing"
RUN apt-get update \
    && apt-get -y install libpq-dev gcc
COPY requirements.txt requirements.txt
RUN python -m pip install -r requirements.txt
WORKDIR /searchwing
COPY src src
COPY bin bin
COPY migrations migrations
COPY ./alembic.ini ./alembic.ini

ENV PYTHONPATH="/searchwing:/searchwing/src:/searchwing/migrations"

CMD ["python", "bin/api.py"]
