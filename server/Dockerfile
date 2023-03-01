FROM python:3.9.13-slim-buster
LABEL maintainer="searchwing"
RUN apt-get update \
    && apt-get -y install libpq-dev gcc
COPY requirements.txt requirements.txt
RUN python -m pip install -r requirements.txt
WORKDIR /searchwing
COPY src src
COPY bin bin
COPY alembic alembic

ENV PYTHONPATH="/searchwing:/searchwing/src"
CMD ["python", "bin/api.py"]
