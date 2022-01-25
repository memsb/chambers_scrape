from lib.Publication import Publication
from jinja2 import Template
from lib.Email import Email


class NewLawyersEmail(Email):

    def __init__(self, pub: Publication):
        self.pub = pub

    def get_subject(self) -> str:
        return f"Lawyers list now available for {self.pub.description}"

    def get_content(self) -> str:
        with open('templates/lawyers/new_lawyers_email.jinja2') as file_:
            template = Template(file_.read())

        return template.render(pub=self.pub)
