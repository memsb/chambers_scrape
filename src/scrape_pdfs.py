from lib.ChambersApi import ChambersApi
from lib.Dynamo import Dynamo
from lib.s3 import S3
from lib.Emailer import Emailer
from lib.PdfScraper import PdfScraper
import argparse

parser = argparse.ArgumentParser(
    description='Scrape publication PDF files')

parser.add_argument(
    "-p", "--publication",
    dest='publication_id',
    help="The id of the publication to scrape",
    type=int
)

parser.add_argument(
    "-i", "--index",
    action="store_true",
    help="Generate the index page"
)

parser.add_argument(
    "-f", "--force",
    action="store_true",
    help="Force re-scraping of publication"
)


def main():
    api = ChambersApi()
    db = Dynamo()
    s3 = S3("lcmillsconsulting.com")
    emailer = Emailer()

    args = parser.parse_args()
    scraper = PdfScraper(api, db, s3, emailer)

    if args.index:
        print("Updating pdfs index page")
        scraper.create_index_page()
        return

    if args.publication_id:
        print("Scraping pdfs for publication")
        scraper.scrape_publication(args.publication_id, args.force)
        return

    print("Scraping pdfs")
    scraper.scrape_publications(args.force)


if __name__ == "__main__":
    main()
