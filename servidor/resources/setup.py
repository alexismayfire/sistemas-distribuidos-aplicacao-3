from threading import Thread
from time import sleep

from flask import Flask
from flask_cors import CORS
from flask_sse import sse

from resources.models import ResourceManager

app = Flask(__name__)
app.register_blueprint(sse, url_prefix="/stream")


def resource_listener(resource_id):
    resource = ResourceManager().resources.get(resource_id, None)
    if resource is None:
        raise Exception(f"Resource with id {resource_id} not found")

    with app.app_context():
        while True:
            if resource.timer > 0:
                resource.timer -= 1
                sleep(1)
                continue

            expired_client = resource.expire_access()
            if expired_client:
                print(f"Client {expired_client} expired at {resource.key}")
                sse.publish(
                    {"granted": False, "resource": resource.key},
                    type=f"resource{resource.key}",
                    channel=expired_client,
                )

            client = resource.grant_access()
            if client:
                print(f"Client {client} granted at {resource.key}")
                sse.publish(
                    {"granted": True, "resource": resource.key},
                    type=f"resource{resource.key}",
                    channel=client,
                )
            # sse.publish({"message": "Resource is busy"}, type="resource")
            # sleep(1)


@app.before_first_request
def config():
    app.config["REDIS_URL"] = "redis://localhost"
    CORS(app)
    ResourceManager()
    thread1 = Thread(target=resource_listener, args=(1,))
    thread1.start()
    thread2 = Thread(target=resource_listener, args=(2,))
    thread2.start()
