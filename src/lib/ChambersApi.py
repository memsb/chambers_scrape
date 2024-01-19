import requests
from json.decoder import JSONDecodeError
from typing import List
from lib.Location import Location
from lib.PracticeArea import PracticeArea
from lib.Subsection import Subsection

from lib.exceptions import EmptyScheduleException, NoDetailsFoundException, PublicationUnavailableException, SubsectionUnavailableException

from lib.Publication import Publication
from lib.PublicationAssets import PublicationAssets
from lib.PublicationResearch import PublicationResearch
from lib.Research import Research
from lib.ResearchDetails import ResearchDetails
from lib.Schedule import Schedule
from lib.Lawyer import Lawyer
from lib.Ranking import Ranking


class ChambersApi:

    def get_publication_assets(self, publication: Publication) -> PublicationAssets:
        url = f"https://api.chambers.com/api/guides/{publication.id}"
        response = requests.get(url)
        if response.status_code != 200:
            raise PublicationUnavailableException(publication)

        return PublicationAssets(**response.json())

    def get_researching_guides(self):
        url = "https://research-schedule-api.chambers.com/api/publications/types"
        response = requests.get(url)

        return response.json()

    def get_publications(self) -> List[Publication]:
        url = "https://api.chambers.com/api/publications"
        response = requests.get(url)

        return [Publication(**data) for data in response.json()]

    def get_locations(self, pub: Publication) -> List[Location]:
        url = f"https://api.chambers.com/api/publications/{pub.publicationTypeId}/locations"
        response = requests.get(url)

        return [Location(**data) for data in response.json()]

    def get_practice_areas(self, pub: Publication, location: Location) -> List[PracticeArea]:
        url = f"https://api.chambers.com/api/publications/{pub.publicationTypeId}/locations/{location.id}/practiceareas"
        response = requests.get(url)

        return [PracticeArea(**data) for data in response.json()]

    def get_subsections(self, pub: Publication, location: Location, area: PracticeArea) -> Subsection:
        url = f"https://api.chambers.com/api/publications/{pub.publicationTypeId}/practiceareas/{area.id}/locations/{location.id}/subsectiontypes/{area.subsectionTypeId}/subsections"
        response = requests.get(url)
        try:
            json = response.json()
            data = json["subsection"]

            return Subsection(**data)
        except JSONDecodeError:
            raise SubsectionUnavailableException()

    def get_individual_rankings(self, sub: Subsection):
        url = f"https://api.chambers.com/api/subsections/{sub.id}/individual-rankings"
        response = requests.get(url)

        rankings = response.json()['individualRankings']
        if not rankings:
            return []

        return rankings[0]['categories']

    def get_organisation_rankings(self, sub: Subsection):
        url = f"https://api.chambers.com/api/subsections/{sub.id}/organisation-rankings"
        response = requests.get(url)

        return response.json()['categories']

    def get_reviews(self, pub: Publication, location: Location, area: PracticeArea, org_id):
        params = {
            "publicationTypeGroupId": pub.publicationTypeGroupId,
            "practiceAreaId": area.id,
            "subsectionTypeId": area.subsectionTypeId,
            "locationId": location.id
        }

        url = f"https://api.chambers.com/api/departments/{org_id}/chambers-review"
        response = requests.get(url, params)

        try:
            return response.json()
        except JSONDecodeError:
            return []

    def get_publication_research_by_guide(self, guide_id: int) -> PublicationResearch:
        url = "https://research-schedule-api.chambers.com/api/research-schedules/search"
        search_object = {
            "guideTypes": [int(guide_id)],
            "practiceAreas": [],
            "locations": [],
            "statuses": [],
            "submissionDeadlines": [],
            "take": 30,
            "skip": 0
        }

        response = requests.post(url, json=search_object)
        results = response.json()

        if "data" not in results:
            raise EmptyScheduleException()

        item = results["data"][0]

        return PublicationResearch(
            id=guide_id,
            guideYear=item["guideYear"],
            guideType=item["guideType"]
        )

    def get_schedule(self, pub: PublicationResearch) -> Schedule:
        schedule = self.get_research_schedule(pub)
        for item in schedule:
            try:
                details = self.get_research_item_details(item)
                item.add_details(details)
            except NoDetailsFoundException:
                continue

        return schedule

    def get_research_schedule(self, pub: PublicationResearch) -> Schedule:
        items = []
        url = "https://research-schedule-api.chambers.com/api/research-schedules/search"
        page_size = 30
        result_count = 1
        search_object = {
            "guideTypes": [int(pub.id)],
            "practiceAreas": [],
            "locations": [],
            "statuses": [],
            "submissionDeadlines": [],
            "take": page_size,
            "skip": 0
        }

        while len(items) < result_count:
            response = requests.post(url, json=search_object)
            results = response.json()

            if "data" not in results:
                break

            result_count = results["resultCount"]
            items += results["data"]
            search_object["skip"] = len(items)

        return Schedule([Research(**item) for item in items])

    def get_research_item_details(self, research: Research) -> ResearchDetails:
        url = f"https://research-schedule-api.chambers.com/api/research-schedules/{research.id}/details"
        response = requests.get(url)
        try:
            return ResearchDetails(**response.json())
        except TypeError as t:
            raise NoDetailsFoundException()

    def get_lawyers(self, publication: Publication) -> List[Lawyer]:
        lawyers = []
        lawyer_items = self.get_lawyer_list(publication)

        for lawyer_item in lawyer_items:
            try:
                rankings = self.get_rankings(
                    lawyer_item["id"],
                    publication.publicationTypeGroupId
                )

                lawyers.append(Lawyer(
                    name=lawyer_item["n"],
                    firm=rankings[0].firm,
                    rankings=rankings
                ))
            except JSONDecodeError:
                pass

        return lawyers

    def get_lawyer_list(self, publication: Publication) -> List:
        url = f"https://chamberssitemap.blob.core.windows.net/site-json/individuals/ranked/publicationTypeGroupId/{publication.publicationTypeGroupId}"
        response = requests.get(url)

        return response.json()

    def get_rankings(self, lawyer_id: int, publicationTypeGroupId: int) -> List[Ranking]:
        rankings = []
        reviews = self.get_lawyer_reviews(lawyer_id, publicationTypeGroupId)

        for department in ["departments", "foreignExpertiseDepartments", "expertiseBasedAbroadDepartments"]:
            rankings += self.get_department_rankings(reviews[department])

        return rankings

    def get_department_rankings(self, department: List) -> List[Ranking]:
        return [
            Ranking(
                level=ranking["rankingDescription"],
                firm=ranking["organisationName"],
                location=ranking["locationDescription"],
                area=ranking["practiceAreaDescription"]
            ) for ranking in department
        ]

    def get_lawyer_reviews(self, lawyer_id: int, guide_id: int) -> dict:
        url = f"https://api.chambers.com/api/individuals/{lawyer_id}/chambers-reviews?publicationTypeGroupId={guide_id}"
        response = requests.get(url)

        return response.json()[0]
