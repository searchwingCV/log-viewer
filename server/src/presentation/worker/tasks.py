from celery import shared_task


@shared_task(name="say_hello", bind=True)
def say_hello(self, name):
    print(self.request.id)
    return f"hello {name}"
