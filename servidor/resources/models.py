from dataclasses import dataclass, field
from datetime import datetime
from threading import Thread
from time import sleep
from typing import List
from uuid import UUID, uuid4

from flask import current_app
from flask_sse import sse


class SingletonMeta(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]


@dataclass
class User:
    id: UUID = field(init=False, default_factory=uuid4)
    name: str

    @staticmethod
    def objects():
        return current_app.config["USERS"]

    @staticmethod
    def all():
        return list(User.objects().values())


class UserManager(metaclass=SingletonMeta):
    def __init__(self):
        self.users = []

    def all(self):
        return self.users

    def create(self, name: str):
        user = User(name=name)
        self.users.append(user)
        return user


class Resource:
    def __init__(self, key):
        self.key = key
        self.queue = []
        self.access_counter = 0
        self.default_timer = 5
        self.timer = 0.0
        self.current_client = ""

    def enqueue(self, client):
        if self.timer > 0:
            self.queue.append(client)
            return False

        self.timer = self.default_timer
        self.access_counter += 1
        self.current_client = client
        return True

    def grant_access(self):
        if not self.queue or self.current_client:
            return None

        self.timer = self.default_timer
        self.access_counter += 1
        self.current_client = self.queue.pop(0)
        return self.current_client

    def expire_access(self):
        if self.current_client and self.timer == 0:
            self.timer = self.default_timer
            client = self.current_client
            self.current_client = ""
            return client

    def release_access(self):
        if self.current_client:
            self.timer = 0.0
            self.current_client = ""


class ResourceManager(metaclass=SingletonMeta):
    def __init__(self):
        self.resources = {
            1: Resource(1),
            2: Resource(2),
        }

    def request_access(self, resource_id, client):
        resource = self.resources.get(resource_id, None)
        if resource is None:
            raise Exception(f"Resource with id {resource_id} not found")
        return resource.enqueue(client)

    def release_access(self, resource_id, client):
        resource = self.resources.get(resource_id, None)
        if resource is None:
            raise Exception(f"Resource with id {resource_id} not found")
        if resource.current_client != client:
            return False
        resource.release_access()
        return True
