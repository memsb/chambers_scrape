from typing import List
from jinja2 import Template
from lib.Email import Email
from lib.PublicationResearch import PublicationResearch
from lib.Research import Research


class ScheduleChangeEmail(Email):

    def __init__(self, pub: PublicationResearch, changes: List[Research]):
        self.pub = pub
        self.changes = changes

    def get_subject(self) -> str:
        return f"Research schedule changes for {self.pub.get_description()}"

    def get_content(self) -> str:
        with open('templates/schedule/schedule_change_email.jinja2') as file_:
            template = Template(file_.read())

        sorted_changes = sorted(
            self.changes,
            key=lambda r: (r.location, r.practiceArea)
        )

        return template.render(pub=self.pub, changes=sorted_changes)
