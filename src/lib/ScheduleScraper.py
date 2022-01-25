from lib.PublicationResearch import PublicationResearch
from typing import List
from lib.Research import Research
from lib.exceptions import EmptyScheduleException
from lib.Schedule import Schedule
from lib.SchedulePage import SchedulePage
from lib.ScheduleIndexPage import ScheduleIndexPage
from lib.ScheduleChangeEmail import ScheduleChangeEmail
from lib.ResearcherChangeEmail import ResearcherChangeEmail
from lib.Emailer import Emailer
from lib.Dynamo import Dynamo
from lib.s3 import S3
from lib.ChambersApi import ChambersApi


class ScheduleScraper:

    def __init__(self, db: Dynamo, s3: S3, emailer: Emailer):
        self.db = db
        self.s3 = s3
        self.emailer = emailer
        self.api = ChambersApi()

    def scrape_guides(self, force: bool = False):
        for guide in self.api.get_researching_guides():
            try:
                self.scrape_guide(guide["id"], force)
            except EmptyScheduleException:
                pass

    def scrape_guide(self, guide_id: int, force: bool = False):
        future_pub = self.api.get_publication_research_by_guide(guide_id)

        print(f"Scraping schedule for: {future_pub.get_description()}")

        if self.db.has_publication_research(future_pub):
            future_pub = self.db.get_publication_research(future_pub)
        else:
            self.db.add_publication_research(future_pub)
            self.update_index_page()

        if future_pub.research_complete and not force:
            return

        latest_research = self.api.get_schedule(future_pub)
        self.db.update_schedule(latest_research)

        if latest_research.is_research_complete():
            self.db.completed_publication_research(future_pub)

        self.generate_research_page(future_pub, latest_research)

        self.send_notifications(future_pub, latest_research)

    def send_notifications(self, future_pub: PublicationResearch, latest_research: Schedule):
        subscribers = self.db.get_guide_subscribers(future_pub.id)
        print(subscribers)

        if not subscribers:
            return

        stored_research = self.db.get_schedule(future_pub)

        dates_changed = latest_research.compare_due_dates(stored_research)
        print(dates_changed)
        if dates_changed:
            print("Sending emails to:")
            print(subscribers)
            email = ScheduleChangeEmail(future_pub, dates_changed)
            self.emailer.send(email, subscribers)

        assignments = latest_research.compare_researchers(stored_research)
        print(assignments)
        if assignments:
            print("Sending emails to:")
            print(subscribers)
            email = ResearcherChangeEmail(future_pub, assignments)
            self.emailer.send(email, subscribers)

    def generate_research_page(self, future_pub: PublicationResearch, schedule: Schedule):
        page = SchedulePage(future_pub, schedule)
        self.s3.upload_page(page, "research")

    def update_index_page(self):
        publications = self.db.get_researched_publications()
        page = ScheduleIndexPage(publications)
        self.s3.upload_page(page, "research")
