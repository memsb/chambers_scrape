from lib.s3 import S3
from lib.Emailer import Emailer
from lib.Dynamo import Dynamo
from lib.ScheduleScraper import ScheduleScraper
import argparse

parser = argparse.ArgumentParser(
    description='Scrape publication research schedule')

parser.add_argument(
    "-g", "--guide",
    dest='guide_id',
    help="The id of the guide to scrape",
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
    help="Force re-scraping of guide"
)


def main():
    db = Dynamo()
    s3 = S3("lcmillsconsulting.com")
    emailer = Emailer()

    args = parser.parse_args()
    scraper = ScheduleScraper(db, s3, emailer)

    if args.index:
        print("Updating schedule index page")
        scraper.update_index_page()
        return

    if args.guide_id:
        print(f"Scraping schedule for guide id: {args.guide_id}")
        scraper.scrape_guide(args.guide_id, args.force)
        return

    print("Scraping schedules")
    scraper.scrape_guides(args.force)


if __name__ == "__main__":
    main()
