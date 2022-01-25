from dataclasses import dataclass


@dataclass
class PublicationResearch:
    id: int
    guideYear: int
    guideType: str
    research_complete: bool = False

    def get_description(self) -> str:
        return f"{self.guideType} {self.guideYear}"
