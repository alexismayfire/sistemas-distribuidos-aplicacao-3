from dataclasses import dataclass

from flask import Flask, g, jsonify, request
from flask_cors import CORS
from flask_sse import sse

from resources.models import ResourceManager, UserManager
from resources.setup import app


@app.route("/")
def home():
    return jsonify({"message": "Hello World!"})


@app.route("/login", methods=["POST"])
def login():
    content = request.get_json()
    if not content:
        raise Exception("No content")
    user = UserManager().create(content["name"])
    message = "Usuário registrado com sucesso!"
    data = {"user": user, "message": message}
    sse.publish({"message": data}, type="login")
    return jsonify(data)


@app.route("/users")
def users():
    return jsonify(UserManager().all())


@app.route("/resource/<int:id>", methods=["POST"])
def resource(id):
    content = request.get_json()
    if not content:
        raise Exception("No content")
    granted = ResourceManager().request_access(id, content["uuid"])
    return jsonify({"granted": granted})


@app.route("/release/<int:id>", methods=["POST"])
def release(id):
    content = request.get_json()
    if not content:
        raise Exception("No content")
    released = ResourceManager().release_access(id, content["uuid"])
    return jsonify({"released": released})


if __name__ == "__main__":
    app.run(threaded=True)
