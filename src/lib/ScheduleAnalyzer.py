from lib.PublicationResearch import PublicationResearch
from lib.Schedule import Schedule


class ScheduleAnalyzer:

    def check_for_schedule_changes(self, pub: PublicationResearch, latest_research: Schedule):
        stored_research = self.db.get_schedule(pub)

        dates_changed = latest_research.compare_due_dates(stored_research)
        if dates_changed:
            self.notify_date_subscribers(pub, dates_changed)

        assignments = latest_research.compare_researchers(stored_research)
        if assignments:
            self.notify_researcher_subscribers(pub, assignments)

    def notify_date_subscribers(self, pub: PublicationResearch, changes: List[Research]):
        subscribers = self.db.get_guide_subscribers(pub)
        if subscribers:
            return

        email = ScheduleChangeEmail(pub, changes)
        self.emailer.send(email, subscribers)

    def notify_researcher_subscribers(self, pub: PublicationResearch, changes: List[Research]):
        subscribers = self.db.get_guide_subscribers(pub)
        if not subscribers:
            return

        email = ResearcherChangeEmail(pub, changes)
        self.emailer.send(email, subscribers)
