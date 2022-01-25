from lib.Location import Location
from lib.Page import Page
from lib.Publication import Publication
from jinja2 import Template
from typing import List


class FeedbackPage(Page):

    def __init__(self, publication: Publication, locations: List[Location]):
        super(FeedbackPage, self).__init__()

        self.publication = publication
        self.locations = locations

    def get_path(self) -> str:
        return f"output/feedback/{self.publication.description}/index.html"

    def get_content(self) -> str:
        with open('templates/feedback/publication_page.jinja2') as file_:
            template = Template(file_.read())

        return template.render(
            publication=self.publication,
            locations=self.locations
        )
