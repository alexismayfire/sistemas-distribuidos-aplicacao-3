class Resource:
    def __init__(self):
        self.queue = []
        self.access_counter = 0
        self.is_busy = False

    def enqueue(self, client):
        if self.is_busy:
            self.queue.append(client)
            return False

        self.is_busy = True
        self.access_counter += 1
        return True

    def grant_access(self):
        if not self.queue:
            self.is_busy = False
            return None

        self.is_busy = True
        self.access_counter += 1
        return self.queue.pop(0)


class SingletonMeta(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]


class ResourceManager(metaclass=SingletonMeta):
    def __init__(self):
        resource1 = Resource()
        resource2 = Resource()
