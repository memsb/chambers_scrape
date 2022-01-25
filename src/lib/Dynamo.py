from dataclasses import asdict
from lib.PublicationAssets import PublicationAssets
from lib.exceptions import PublicationNotFoundException
from lib.Schedule import Schedule
from lib.Subscriber import Subscriber
from lib.Research import Research
from typing import List
import boto3
from boto3.dynamodb.conditions import Attr, Key

from lib.Guide import Guide
from lib.Publication import Publication
from lib.Subscription import Subscription
from lib.PublicationResearch import PublicationResearch


class Dynamo:

    def get_pdfs_table(self):
        dynamodb = boto3.resource('dynamodb')
        return dynamodb.Table("chambers_pdfs")

    def get_guides_table(self):
        dynamodb = boto3.resource('dynamodb')
        return dynamodb.Table("chambers_guides")

    def get_publications_table(self):
        dynamodb = boto3.resource('dynamodb')
        return dynamodb.Table("chambers_publications")

    def get_subscriptions_table(self):
        dynamodb = boto3.resource('dynamodb')
        return dynamodb.Table("research_subscriptions")

    def get_research_table(self):
        dynamodb = boto3.resource('dynamodb')
        return dynamodb.Table("chambers_research")

    def get_publication_research_table(self):
        dynamodb = boto3.resource('dynamodb')
        return dynamodb.Table("chambers_publication_research")

    def get_pdf(self, pub: Publication) -> PublicationAssets:
        table = self.get_pdfs_table()
        response = table.get_item(
            Key={
                "id": int(pub.id)
            }
        )

        if "Item" not in response:
            raise LookupError("Pdf not found")

        return PublicationAssets(**response["Item"])

    def has_pdf(self, pub: Publication) -> bool:
        table = self.get_pdfs_table()
        response = table.get_item(
            Key={
                "id": int(pub.id)
            }
        )

        return "Item" in response

    def add_publication_assets(self, pub: PublicationAssets) -> None:
        table = self.get_pdfs_table()

        table.put_item(
            Item=asdict(pub)
        )

    def get_all_publication_assets(self) -> List[PublicationAssets]:
        pdfs = []
        table = self.get_pdfs_table()
        scan_kwargs = {}

        done = False
        start_key = None
        while not done:
            if start_key:
                scan_kwargs['ExclusiveStartKey'] = start_key
            response = table.scan(**scan_kwargs)
            pdfs += response.get('Items', [])
            start_key = response.get('LastEvaluatedKey', None)
            done = start_key is None

        return [PublicationAssets(**data) for data in pdfs]

    def get_publications(self, scan_kwargs={}) -> List[Publication]:
        publications = []
        table = self.get_publications_table()

        done = False
        start_key = None
        while not done:
            if start_key:
                scan_kwargs['ExclusiveStartKey'] = start_key
            response = table.scan(**scan_kwargs)
            publications += response.get('Items', [])
            start_key = response.get('LastEvaluatedKey', None)
            done = start_key is None

        return [Publication(**data) for data in publications]

    def get_publication(self, publication: Publication) -> Publication:
        return self.get_publication_by_id(publication.id)

    def get_publication_by_id(self, id: int) -> Publication:
        table = self.get_publications_table()
        response = table.get_item(
            Key={
                "id": id
            }
        )

        if not 'Item' in response:
            raise PublicationNotFoundException()

        return Publication(**response["Item"])

    def has_guide(self, guide: Guide) -> bool:
        table = self.get_guides_table()
        response = table.get_item(
            Key={
                "publicationTypeId": guide.publicationTypeId
            }
        )

        return 'Item' in response

    def has_publication(self, publication: Publication) -> bool:
        table = self.get_publications_table()
        response = table.get_item(
            Key={
                "id": publication.id
            }
        )

        return 'Item' in response

    def add_guide(self, guide: Guide) -> None:
        table = self.get_guides_table()
        table.put_item(
            Item=asdict(guide)
        )

    def get_guides(self, scan_kwargs={}) -> List[Guide]:
        guides = []
        table = self.get_guides_table()

        done = False
        start_key = None
        while not done:
            if start_key:
                scan_kwargs['ExclusiveStartKey'] = start_key
            response = table.scan(**scan_kwargs)
            guides += response.get('Items', [])
            start_key = response.get('LastEvaluatedKey', None)
            done = start_key is None

        return [Guide(**data) for data in guides]

    def get_publication_research(self, pub: PublicationResearch) -> PublicationResearch:
        table = self.get_publication_research_table()
        response = table.query(
            KeyConditionExpression=Key('id').eq(
                pub.id) & Key('guideYear').eq(pub.guideYear)
        )
        pub = response['Items'][0]

        return PublicationResearch(**pub)

    def has_publication_research(self, pub: PublicationResearch) -> bool:
        table = self.get_publication_research_table()
        response = table.query(
            KeyConditionExpression=Key('id').eq(
                pub.id) & Key('guideYear').eq(pub.guideYear)
        )

        return len(response['Items']) != 0

    def add_publication_research(self, pub: PublicationResearch):
        table = self.get_publication_research_table()
        table.put_item(
            Item=asdict(pub)
        )

    def add_publication(self, publication: Publication) -> None:
        table = self.get_publications_table()
        table.put_item(
            Item=asdict(publication)
        )

    def set_publication_lawyers_scraped(self, publication: Publication):
        table = self.get_publications_table()
        table.update_item(
            Key={
                'id': publication.id
            },
            UpdateExpression="set lawyers_scraped=:s",
            ExpressionAttributeValues={
                ':s': True
            }
        )

    def set_publication_feedback_scraped(self, publication: Publication):
        table = self.get_publications_table()
        table.update_item(
            Key={
                'id': publication.id
            },
            UpdateExpression="set feedback_scraped=:s",
            ExpressionAttributeValues={
                ':s': True
            }
        )

    def get_publications_with_scraped_lawyers(self) -> List[Publication]:
        return self.get_publications({
            'FilterExpression': Attr('lawyers_scraped').eq(True)
        })

    def get_publications_with_scraped_feedback(self) -> List[Publication]:
        return self.get_publications({
            'FilterExpression': Attr('feedback_scraped').eq(True)
        })

    def get_guide_subscribers(self, guide_id: int) -> List[Subscriber]:
        table = self.get_subscriptions_table()
        response = table.get_item(
            Key={
                "guide_id": guide_id
            }
        )

        if "Item" not in response:
            return []

        return [Subscriber(email=email) for email in response["Item"]["emails"]]

    def get_subscriptions(self) -> List[Subscription]:
        subscriptions = []
        table = self.get_subscriptions_table()
        scan_kwargs = {}

        done = False
        start_key = None
        while not done:
            if start_key:
                scan_kwargs['ExclusiveStartKey'] = start_key
            response = table.scan(**scan_kwargs)
            subscriptions += response.get('Items', [])
            start_key = response.get('LastEvaluatedKey', None)
            done = start_key is None

        return [Subscription(**subscription) for subscription in subscriptions]

    def get_unassigned_research_items(self, guide: Guide) -> List[Research]:
        return self.get_research({
            'FilterExpression': Attr('guideType').eq(guide.publicationTypeDescription) & Attr('researcherFullName').not_exists()

        })

    def get_schedule(self, pub: PublicationResearch) -> Schedule:
        return self.get_research_schedule({
            'FilterExpression': Attr('guideType').eq(pub.guideType) & Attr('guideYear').eq(pub.guideYear)
        })

    def get_research_schedule(self, scan_kwargs={}) -> Schedule:
        research = []
        table = self.get_research_table()

        done = False
        start_key = None
        while not done:
            if start_key:
                scan_kwargs['ExclusiveStartKey'] = start_key
            response = table.scan(**scan_kwargs)
            research += response.get('Items', [])
            start_key = response.get('LastEvaluatedKey', None)
            done = start_key is None

        return Schedule([Research(**data) for data in research])

    def update_researcher_assignments(self, assigned: List[Research]) -> None:
        for assignment in assigned:
            self.store_assigned_researcher(assignment)

    def get_research_item(self, research: Research) -> Research:
        table = self.get_research_table()
        response = table.get_item(
            Key={
                "id": research.id
            }
        )

        if "Item" not in response:
            raise LookupError("Item not found")

        return Research(**response["Item"])

    def add_research_item(self, research: Research) -> None:
        table = self.get_research_table()

        return table.put_item(
            Item=asdict(research)
        )

    def completed_publication_research(self, pub: PublicationResearch) -> None:
        table = self.get_publication_research_table()

        table.update_item(
            Key={
                'id': int(pub.id),
                'guideYear': int(pub.guideYear)
            },
            UpdateExpression="set research_complete=:s",
            ExpressionAttributeValues={
                ':s': True
            }
        )

    def update_schedule(self, schedule: Schedule) -> None:
        table = self.get_research_table()
        for research in schedule:
            table.put_item(
                Item=asdict(research)
            )

    def get_researched_publications(self) -> List[PublicationResearch]:
        pubs = []
        table = self.get_publication_research_table()
        scan_kwargs = {}
        done = False
        start_key = None
        while not done:
            if start_key:
                scan_kwargs['ExclusiveStartKey'] = start_key
            response = table.scan(**scan_kwargs)
            pubs += response.get('Items', [])
            start_key = response.get('LastEvaluatedKey', None)
            done = start_key is None

        return [PublicationResearch(**data) for data in pubs]
