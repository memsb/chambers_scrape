from lib.NewLawyersEmail import NewLawyersEmail
from lib.Publication import Publication
from lib.LawyersIndexPage import LawyersIndexPage
from lib.LawyersPage import LawyersPage
from lib.Emailer import Emailer

from lib.ChambersApi import ChambersApi
from lib.Dynamo import Dynamo
from lib.s3 import S3


class LawyerScraper:

    def __init__(self, api: ChambersApi, db: Dynamo, s3: S3, emailer: Emailer):
        self.api = api
        self.db = db
        self.s3 = s3
        self.emailer = emailer

    def scrape_all_lawyers(self, force: bool = False):
        for publication in self.api.get_publications():
            self.scrape_lawyers(publication.id, force)

    def scrape_lawyers(self, publication_id: int, force: bool = False):
        publication = self.db.get_publication_by_id(publication_id)

        if publication.lawyers_scraped and not force:
            return

        print(f"Scraping {publication.description}")
        self.create_lawyer_page(publication)
        self.flag_publication_as_scraped(publication)
        self.update_index_page()

        self.send_notifications(publication)

    def create_lawyer_page(self, publication: Publication):
        lawyers = self.api.get_lawyers(publication)
        page = LawyersPage(publication, lawyers)
        self.s3.upload_page(page, 'lawyers')

    def flag_publication_as_scraped(self, publication: Publication):
        self.db.set_publication_lawyers_scraped(publication)

    def send_notifications(self, publication: Publication):
        subscribers = self.db.get_guide_subscribers(
            publication.publicationTypeId)
        if not subscribers:
            print("No subscribers, not sending notifications")
            return

        email = NewLawyersEmail(publication)
        self.emailer.send(email, subscribers)

    def update_index_page(self):
        publications = self.db.get_publications_with_scraped_lawyers()
        index_page = LawyersIndexPage(publications)
        self.s3.upload_page(index_page, 'lawyers')
