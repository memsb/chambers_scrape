from dataclasses import dataclass
from typing import List


@dataclass
class Subscription:
    guide_id: int
    guideType: str
    emails: List[str]
