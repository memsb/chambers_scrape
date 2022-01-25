from dataclasses import dataclass
import os


@dataclass
class PdfDetails:
    id: str
    name: str
    uri: str
    fileSize: str

    def get_filename(self) -> str:
        return os.path.basename(self.uri)
