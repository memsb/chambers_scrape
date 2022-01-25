from dataclasses import dataclass, field
from typing import List
import urllib.parse


@dataclass
class Location:
    id: int
    description: str
    practice_areas: List = field(default_factory=lambda: [])

    def get_link(self):
        return urllib.parse.quote(self.description)
