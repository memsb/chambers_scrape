from lib.Page import Page
from lib.Page import Page
from jinja2 import Template
from typing import List

from lib.PublicationResearch import PublicationResearch


class ScheduleIndexPage(Page):

    def __init__(self, researched_publications: List[PublicationResearch]):
        super(ScheduleIndexPage, self).__init__()

        self.researched_publications = researched_publications

    def get_path(self) -> str:
        return "output/schedule/index.html"

    def get_content(self) -> str:
        with open('templates/schedule/index_page.jinja2') as file_:
            template = Template(file_.read())

        return template.render(guides=self.get_group_publications())

    def get_group_publications(self) -> dict:
        grouped = {}
        for pub in self.researched_publications:
            if pub.id in grouped:
                grouped[pub.id]["years"].append(pub)
                grouped[pub.id]["years"].sort(
                    key=lambda p: p.guideYear, reverse=True)
            else:
                grouped[pub.id] = {
                    "type": pub.guideType,
                    "years": [pub]
                }

        return dict(sorted(grouped.items()))
