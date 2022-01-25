from lib.Lawyer import Lawyer
from lib.Page import Page
from lib.Publication import Publication
from lib.Page import Page
from jinja2 import Template
from typing import List


class LawyersPage(Page):

    def __init__(self, publication: Publication, lawyers: List[Lawyer]):
        super(LawyersPage, self).__init__()

        self.publication = publication
        self.lawyers = lawyers

    def get_path(self) -> str:
        return f"output/lawyers/{self.publication.description}.html"

    def get_content(self) -> str:
        with open('templates/lawyers/lawyers_page.jinja2') as file_:
            template = Template(file_.read())

        sorted_lawyers = sorted(self.lawyers, key=lambda l: l.name)

        return template.render(
            publication=self.publication,
            lawyers=sorted_lawyers
        )
