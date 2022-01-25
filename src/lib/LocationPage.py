from lib.Location import Location
from lib.Page import Page
from lib.Publication import Publication
from jinja2 import Template


class LocationPage(Page):

    def __init__(self, publication: Publication, location: Location):
        super(LocationPage, self).__init__()

        self.publication = publication
        self.location = location

    def get_path(self) -> str:
        return f"output/feedback/{self.publication.description}/{self.location.description}.html"

    def get_content(self) -> str:
        with open('templates/feedback/location_page.jinja2') as file_:
            template = Template(file_.read())

        return template.render(location=self.location)
