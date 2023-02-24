FROM python:3.9.13-slim-buster
LABEL maintainer="searchwing"
RUN apt-get update \
    && apt-get -y install libpq-dev gcc
COPY requirements.txt requirements.txt
RUN python -m pip install -r requirements.txt
WORKDIR /searchwing
COPY app .

ENTRYPOINT ["uvicorn app.main:app --reload --debug --host 0.0.0.0 --port 8080 --log-level info"]
