from lib.Page import Page
from lib.PublicationAssets import PublicationAssets
from lib.Page import Page
from jinja2 import Template
from typing import List


class PdfsIndexPage(Page):

    def __init__(self, pubs: List[PublicationAssets]):
        super(PdfsIndexPage, self).__init__()

        self.pubs = pubs

    def get_path(self) -> str:
        return "output/pdf/index.html"

    def get_content(self) -> str:
        with open('templates/pdf/index_page.jinja2') as file_:
            template = Template(file_.read())

        sorted_pubs = sorted(
            self.pubs,
            key=lambda pub: (pub.name)
        )

        return template.render(pubs=sorted_pubs)
