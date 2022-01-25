from dataclasses import dataclass
from datetime import datetime
from typing import List

from lib.PdfDetails import PdfDetails


def get_now():
    return datetime.utcnow().replace(microsecond=0).isoformat()


@dataclass
class PublicationAssets:
    id: int
    name: str
    coverImage: str
    description: str
    status: str
    created: str
    lastUpdated: str
    registerForInterestBanner: dict
    downloadBanner: dict
    files: list

    def __post_init__(self):
        self.id = int(self.id)

    def get_files(self) -> List[PdfDetails]:
        return [PdfDetails(**file) for file in self.files]

    def is_live(self) -> bool:
        return self.status == "Live"
