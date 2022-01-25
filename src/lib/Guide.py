from dataclasses import dataclass
from datetime import datetime


@dataclass
class Guide:
    publicationTypeId: int
    publicationTypeGroupId: int
    publicationTypeDescription: str
    created_at: str = datetime.utcnow().replace(microsecond=0).isoformat()
