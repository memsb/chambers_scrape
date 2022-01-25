from dataclasses import dataclass
from dateutil.parser import ParserError, parse
from lib.ResearchDetails import ResearchDetails


@dataclass
class Research:
    id: int
    statusId: int
    status: str
    guideType: str
    guideYear: int
    location: str
    practiceArea: str
    researcherNotes: str = ""
    statusDate: str = ""
    researcherFullName: str = ""
    researcherPhone: str = ""
    researcherEmail: str = ""

    def add_details(self, details: ResearchDetails):
        self.researcherFullName = details.researcherFullName
        self.researcherPhone = details.researcherPhone
        self.researcherEmail = details.researcherEmail

    def date_changed(self, other) -> bool:
        return self.statusDate != other.statusDate

    def get_date(self) -> str:
        try:
            dt = parse(self.statusDate)
            return dt.strftime("%d %B %Y")
        except ParserError:
            return ""

    def researcher_changed(self, other) -> bool:
        return self.researcherFullName and self.researcherFullName != other.researcherFullName

    def is_complete(self) -> bool:
        return self.statusId == 2
