FROM python=3.9

COPY requirements.txt requirements.txt
RUN python -m pip install -r requirements.txt
WORKDIR /app
COPY app .
EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--port", "8080"]
