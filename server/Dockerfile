FROM python:3.9.13-slim-buster
LABEL maintainer="searchwing"
RUN apt-get update \
    && apt-get -y install libpq-dev gcc
COPY requirements.txt requirements.txt
RUN python -m pip install -r requirements.txt
WORKDIR /searchwing
COPY app app

CMD ["uvicorn", "app.main:app", "--port=80", "--log-level=info"]
