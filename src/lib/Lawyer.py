from dataclasses import dataclass
from typing import List
from lib.Ranking import Ranking


@dataclass
class Lawyer:
    name: str
    firm: str
    rankings: List[Ranking]
