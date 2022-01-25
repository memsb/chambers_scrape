from __future__ import annotations
from typing import List
from lib.Research import Research


class Schedule:

    def __init__(self, research_items: List[Research] = []):
        self.research_items = {}
        for item in research_items:
            self.add_item(item)

    def add_item(self, research: Research):
        self.research_items[research.id] = research

    def is_research_complete(self) -> bool:
        incomplete = [
            item for item in self.research_items.values() if not item.is_complete()]

        return len(incomplete) == 0

    def sort(self) -> List:
        return sorted(
            self.research_items.values(),
            key=lambda r: (r.location, r.practiceArea)
        )

    def __iter__(self) -> iter:
        return iter(self.research_items.values())

    def __len__(self) -> int:
        return len(self.research_items)

    def get_item(self, key) -> Research:
        return self.research_items[key]

    def compare_due_dates(self, old: Schedule) -> List[Research]:
        updated = []
        for key in self.research_items.keys():
            latest = self.get_item(key)
            previous = old.get_item(key)
            if latest.statusDate and latest.statusDate != previous.statusDate:
                updated.append(latest)

        return updated

    def compare_researchers(self, old: Schedule) -> List[Research]:
        updated = []
        for key in self.research_items.keys():
            latest = self.get_item(key)
            previous = old.get_item(key)
            if latest.researcherFullName != previous.researcherFullName:
                updated.append(latest)

        return updated
