from lib.Publication import Publication
from jinja2 import Template
from lib.Email import Email


class NewFeedbackEmail(Email):

    def __init__(self, pub: Publication):
        self.pub = pub

    def get_subject(self) -> str:
        return f"Client feedback documents available for {self.pub.description}"

    def get_content(self) -> str:
        with open('templates/feedback/new_feedback_email.jinja2') as file_:
            template = Template(file_.read())

        return template.render(pub=self.pub)
