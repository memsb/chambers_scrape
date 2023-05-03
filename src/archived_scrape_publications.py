from lib.Dynamo import Dynamo
from lib.ChambersApi import ChambersApi
from lib.PublicationScraper import PublicationScraper
import argparse

parser = argparse.ArgumentParser(
    description='Scrape publications')

parser.add_argument(
    "-f", "--force",
    action="store_true",
    help="Force re-scraping of publication"
)


def main():
    dynamo = Dynamo()
    api = ChambersApi()

    args = parser.parse_args()
    scraper = PublicationScraper(dynamo, api)

    print("Scraping publications")
    scraper.scrape_publications(args.force)


if __name__ == "__main__":
    main()
