from lib.Page import Page
from lib.Publication import Publication
from jinja2 import Template
from typing import List


class FeedbackIndexPage(Page):

    def __init__(self, publications: List[Publication]):
        super(FeedbackIndexPage, self).__init__()

        self.publications = publications

    def get_path(self) -> str:
        return "output/feedback/index.html"

    def get_content(self) -> str:
        with open('templates/feedback/index_page.jinja2') as file_:
            template = Template(file_.read())

        return template.render(guides=self.get_grouped_publications())

    def get_grouped_publications(self) -> dict:
        grouped = {}
        for pub in self.publications:
            if pub.publicationTypeId in grouped:
                grouped[pub.publicationTypeId]["years"].append(pub)
                grouped[pub.publicationTypeId]["years"].sort(
                    key=lambda p: p.issueOrYear, reverse=True)
            else:
                grouped[pub.publicationTypeId] = {
                    "type": pub.publicationTypeDescription,
                    "years": [pub]
                }

        return dict(sorted(grouped.items()))
