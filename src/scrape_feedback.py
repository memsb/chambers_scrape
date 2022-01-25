from lib.ChambersApi import ChambersApi
from lib.Dynamo import Dynamo
from lib.s3 import S3
from lib.Emailer import Emailer
from lib.FeedbackScraper import FeedbackScraper
import argparse

parser = argparse.ArgumentParser(
    description='Scrape publication with client reviews')

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
    scraper = FeedbackScraper(api, db, s3, emailer)

    if args.index:
        print("Updating feedback index page")
        scraper.update_index_page()
        return

    if args.publication_id:
        print("Scraping feedback for guide")
        scraper.scrape_publication(args.publication_id, args.force)
        return

    print("Scraping feedback for guides")
    scraper.scrape_all_publications(args.force)


if __name__ == "__main__":
    main()
