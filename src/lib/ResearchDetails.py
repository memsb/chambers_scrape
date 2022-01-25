from dataclasses import dataclass


@dataclass
class ResearchDetails:
    id: int
    researcherNotes: str
    researcherFullName: str = ""
    researcherPhone: str = ""
    researcherEmail: str = ""

    def has_researcher_assigned(self) -> bool:
        return self.researcherFullName != ""
