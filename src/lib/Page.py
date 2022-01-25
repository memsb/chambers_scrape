from lib.File import File


class Page:

    def save(self) -> File:
        file = File(self.get_path())
        file.save(self.get_content())

        return file

    def get_content(self) -> str:
        return ""

    def get_path(self) -> str:
        return ""
