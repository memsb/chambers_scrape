from lib.Page import Page
from lib.PublicationAssets import PublicationAssets
from jinja2 import Template


class PdfPage(Page):

    def __init__(self, pub: PublicationAssets):
        super(PdfPage, self).__init__()

        self.pub = pub

    def get_path(self) -> str:
        return f"output/pdf/{self.pub.name}/index.html"

    def get_content(self) -> str:
        with open('templates/pdf/pdf_page.jinja2') as file_:
            template = Template(file_.read())

        return template.render(pub=self.pub)
