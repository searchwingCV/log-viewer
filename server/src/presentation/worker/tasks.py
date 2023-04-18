from src.presentation.worker import celery_app


@celery_app.task(name="say_hello", bind=True)
def say_hello(self, name):
    print(self.request.id)
    return f"hello {name}"
