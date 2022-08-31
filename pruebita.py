from celery import Celery

app = Celery('tasks', broker='pyamqp://root@localhost//')

@app.task
def add(x, y):
    return x + y