from dataclasses import dataclass, field
from typing import List
import urllib.parse


@dataclass
class Subsection:
    id: int
    description: str
    locationId: int
    publicationTypeDescription: str
    locationDescription: str
    practiceAreaId: int
    practiceAreaDescription: str
    internalOverview: str
    publicationTypeId: int
    publicationTypeGroupId: int
    subsectionTypeId: int
    locales: List
    individual_rankings: dict = field(default_factory=lambda: {})
    organisation_rankings: dict = field(default_factory=lambda: {})

    def get_link(self):
        return urllib.parse.quote(self.practiceAreaDescription)
