from lib.Dynamo import Dynamo
from lib.ChambersApi import ChambersApi
from lib.Publication import Publication
from lib.Guide import Guide


class PublicationScraper:

    def __init__(self, db: Dynamo, api: ChambersApi):
        self.db = db
        self.api = api

    def scrape_publications(self, force: bool = False) -> None:
        for publication in self.api.get_publications():
            self.store_guide_if_new(publication.get_guide(), force)
            self.store_publication_if_new(publication, force)

    def store_guide_if_new(self, guide: Guide, force: bool = False) -> None:
        if self.db.has_guide(guide) and not force:
            return

        print(f"New guide: {guide.publicationTypeDescription}")
        self.db.add_guide(guide)

    def store_publication_if_new(self, publication: Publication, force: bool = False) -> None:
        if not force and self.db.has_publication(publication):
            return

        print(f"New publication: {publication.description}")
        self.db.add_publication(publication)
