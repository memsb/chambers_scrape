from lib.PublicationAssets import PublicationAssets
from jinja2 import Template
from lib.Email import Email


class NewPDFsEmail(Email):

    def __init__(self, pub: PublicationAssets):
        self.pub = pub

    def get_subject(self) -> str:
        return f"PDFs now available for {self.pub.name}"

    def get_content(self) -> str:
        with open('templates/pdf/new_pdf_email.jinja2') as file_:
            template = Template(file_.read())

        return template.render(pub=self.pub)
