from dataclasses import dataclass

from lib.Subsection import Subsection
import urllib.parse


@dataclass
class PracticeArea:
    id: int
    subsectionTypeId: int
    description: str
    subsection: Subsection = None

    def get_link(self):
        return urllib.parse.quote(self.description)
