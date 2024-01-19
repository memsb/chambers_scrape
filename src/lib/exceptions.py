from lib.Publication import Publication


class EmptyScheduleException(Exception):
    pass


class NoDetailsFoundException(Exception):
    pass


class PublicationNotFoundException(Exception):
    pass

class SubsectionUnavailableException(Exception):
    pass


class PublicationUnavailableException(Exception):

    def __init__(self, publication: Publication) -> None:
        self.publication = publication
        self.message = f"Unable to download PDFs for {publication.description}"
        super().__init__(self.message)
