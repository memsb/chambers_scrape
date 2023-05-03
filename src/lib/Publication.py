from dataclasses import dataclass
from datetime import datetime
from lib.Guide import Guide
import urllib.parse


@dataclass
class Publication:
    publicationTypeId: int
    publicationTypeGroupId: int
    publicationTypeDescription: str
    isLocationBased: bool
    isBarrister: bool
    isProfessionalAdviser: bool
    isDisabled: bool
    isMostRelevant: bool
    active: bool
    issueOrYear: int
    id: int
    description: str
    isRanked: bool = False
    feedback_scraped: bool = False
    lawyers_scraped: bool = False
    scraped_lawyers: bool = False
    scraped_firms: bool = False
    schedule_scraped: bool = False
    research_complete: bool = False
    created_at: str = datetime.utcnow().replace(microsecond=0).isoformat()

    def get_guide(self) -> Guide:
        return Guide(self.publicationTypeId, self.publicationTypeGroupId, self.publicationTypeDescription)

    def get_link(self):
        return urllib.parse.quote(self.description)
