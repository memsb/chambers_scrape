from lib.ChambersApi import ChambersApi
from lib.Dynamo import Dynamo
from lib.Downloader import Downloader
from lib.Emailer import Emailer
from lib.NewPDFsEmail import NewPDFsEmail
from lib.Publication import Publication
from lib.PublicationAssets import PublicationAssets
from lib.PdfPage import PdfPage
from lib.PdfsIndexPage import PdfsIndexPage
from lib.exceptions import PublicationUnavailableException
from lib.s3 import S3


class PdfScraper:

    def __init__(self, api: ChambersApi, db: Dynamo, s3: S3, emailer: Emailer):
        self.api = api
        self.db = db
        self.s3 = s3
        self.emailer = emailer

    def scrape_publications(self, force: bool = False):
        for publication in self.api.get_publications():
            self.scrape_publication(publication.id, force)

    def scrape_publication(self, publication_id: int, force: bool = False):
        publication = self.db.get_publication_by_id(publication_id)

        if self.db.has_pdf(publication) and not force:
            return

        print(publication.description)

        try:
            pub_assets = self.api.get_publication_assets(publication)
        except PublicationUnavailableException as e:
            print(e)
            return

        if not pub_assets.is_live():
            return

        self.download_files(pub_assets)
        self.db.add_publication_assets(pub_assets)
        self.create_guide_page(pub_assets)
        self.create_index_page()

        self.send_notifications(publication, pub_assets)

    def download_files(self, pub_assets: PublicationAssets):
        downloader = Downloader()
        for file in downloader.get_files(pub_assets):
            self.s3.upload_file(file, f"pdf/{pub_assets.name}", {'ContentType': 'application/pdf'})

    def create_index_page(self):
        pubs = self.db.get_all_publication_assets()
        page = PdfsIndexPage(pubs)
        self.s3.upload_page(page, "pdf")

    def send_notifications(self, publication: Publication, pub_assets: PublicationAssets):
        subscribers = self.db.get_guide_subscribers(
            publication.publicationTypeId)
        if not subscribers:
            print("No subscribers, not sending notifications")
            return

        email = NewPDFsEmail(pub_assets)
        self.emailer.send(email, subscribers)

    def create_guide_page(self, pub_assets: PublicationAssets):
        page = PdfPage(pub_assets)
        self.s3.upload_page(page, f"pdf/{pub_assets.name}")
