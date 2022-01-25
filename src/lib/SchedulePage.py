from lib.Page import Page
from lib.PublicationResearch import PublicationResearch
from lib.Schedule import Schedule
from jinja2 import Template


class SchedulePage(Page):

    def __init__(self, future_pub: PublicationResearch, schedule: Schedule):
        super(SchedulePage, self).__init__()

        self.future_pub = future_pub
        self.schedule = schedule

    def get_path(self) -> str:
        return f"output/schedule/{self.future_pub.get_description()}.html"

    def get_content(self) -> str:
        with open('templates/schedule/schedule_page.jinja2') as file_:
            template = Template(file_.read())

        return template.render(
            future_pub=self.future_pub,
            schedule=self.schedule.sort()
        )
