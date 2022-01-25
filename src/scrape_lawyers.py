from lib.LawyerScraper import LawyerScraper
from lib.Dynamo import Dynamo
from lib.s3 import S3
from lib.Emailer import Emailer
from lib.ChambersApi import ChambersApi
import argparse

parser = argparse.ArgumentParser(
    description='Scrape publication lawyer rankings')

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
    dynamo = Dynamo()
    s3 = S3("lcmillsconsulting.com")
    emailer = Emailer()

    args = parser.parse_args()
    scraper = LawyerScraper(api, dynamo, s3, emailer)

    if args.index:
        print("Updating lawyers index page")
        scraper.update_index_page()
        return

    if args.publication_id:
        print("Scraping lawyers for publication")
        scraper.scrape_lawyers(args.publication_id, args.force)
        return

    print("Scraping lawyers")
    scraper.scrape_all_lawyers(args.force)


if __name__ == "__main__":
    main()
