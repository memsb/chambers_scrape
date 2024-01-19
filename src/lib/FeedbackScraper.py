from typing import List
from lib.ChambersApi import ChambersApi
from lib.Dynamo import Dynamo
from lib.Emailer import Emailer
from lib.FeedbackPage import FeedbackPage
from lib.Location import Location
from lib.LocationPage import LocationPage
from lib.NewFeedbackEmail import NewFeedbackEmail
from lib.s3 import S3
from lib.Publication import Publication
from lib.FeedbackIndexPage import FeedbackIndexPage

class FeedbackScraper:

    def __init__(self, api: ChambersApi, db: Dynamo, s3: S3, emailer: Emailer):
        self.api = api
        self.db = db
        self.s3 = s3
        self.emailer = emailer

    def scrape_all_publications(self, force: bool = False):
        for publication in self.api.get_publications():
            self.scrape_publication(publication.id, force)

    def scrape_publication(self, publication_id: int, force: bool = False):
        pub = self.db.get_publication_by_id(publication_id)

        if pub.feedback_scraped and not force:
            return

        print(f"Scraping {pub.description}")
        self.scrape_feedback(pub)
        self.db.set_publication_feedback_scraped(pub)
        self.update_index_page()

        self.send_notifications(pub)

    def scrape_feedback(self, pub):
        locations = self.get_feedback_by_location(pub)
        for location in locations:
            self.create_location_page(pub, location)

        self.create_publication_page(pub, locations)

    def get_feedback_by_location(self, pub: Publication) -> List[Location]:
        locations = []
        for location in self.api.get_locations(pub):
            print("\t" + location.description)
            locations.append(location)
            for area in self.api.get_practice_areas(pub, location):

                try:
                    subsection = self.api.get_subsections(pub, location, area)
                except:
                    continue
                
                area.subsection = subsection
                location.practice_areas.append(area)

                individual_rankings = self.api.get_individual_rankings(
                    subsection)
                subsection.individual_rankings = individual_rankings

                organisation_rankings = self.api.get_organisation_rankings(
                    subsection)
                subsection.organisation_rankings = organisation_rankings

                for category in organisation_rankings:
                    for org in category["organisations"]:
                        org["reviews"] = self.api.get_reviews(
                            pub, location, area, org["organisationId"]
                        )

        return locations

    def create_location_page(self, publication: Publication, location: Location):
        page = LocationPage(publication, location)
        self.s3.upload_page(page, f"feedback/{publication.description}")

    def create_publication_page(self, publication: Publication, locations: List[Location]):
        page = FeedbackPage(publication, locations)
        self.s3.upload_page(page, f"feedback/{publication.description}")

    def send_notifications(self, publication: Publication):
        subscribers = self.db.get_guide_subscribers(
            publication.publicationTypeId)

        if not subscribers:
            print("No subscribers, not sending notifications")
            return

        email = NewFeedbackEmail(publication)
        self.emailer.send(email, subscribers)

    def update_index_page(self):
        publications = self.db.get_publications_with_scraped_feedback()
        index_page = FeedbackIndexPage(publications)
        self.s3.upload_page(index_page, 'feedback')
