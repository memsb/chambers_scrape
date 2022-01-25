import os


class File:
    def __init__(self, path):
        self.path = path

    def get_filename(self) -> str:
        return os.path.basename(self.path)

    def save(self, content: str):
        self.ensure_dir(self.path)

        f = open(self.path, "w")
        f.write(content)
        f.close()

    def save_bytes(self, content):
        self.ensure_dir(self.path)

        f = open(self.path, "wb")
        f.write(content)
        f.close()

    def ensure_dir(self, path):
        dirname = os.path.dirname(path)

        if not os.path.exists(dirname):
            os.makedirs(dirname)
