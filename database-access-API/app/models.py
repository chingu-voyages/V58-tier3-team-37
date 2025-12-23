from typing import List, Dict, Optional, Any
from enum import Enum

from pydantic import BaseModel, Field

class CategoricalAttribute(str, Enum):
    """Attributes permitted in aggregation & UNIQUE-value queries."""
    GENDER = "Gender"
    COUNTRY_CODE = "Country_Code"
    COUNTRY_NAME = "Country_Name"
    TIMEZONE = "Timezone"
    GMT_OFFSET = "GMT_Offset"
    GOAL = "Goal"
    SOURCE = "Source"
    SOLO_PROJECT_TIER = "Solo_Project_Tier"
    ROLE = "Role"

class AttributeLists(str, Enum):
    """Attributes about the Voyages the relative member signed up for"""
    VOYAGE_SIGNUP_IDS = "Voyage_Signup_ids"
    VOYAGE_TIERS = "Voyage_Tiers"

def make_attribute_enum():
    entries = {e.name: e.value for e in CategoricalAttribute}
    entries.update({e.name: e.value for e in AttributeLists})
    return Enum("Attribute", entries)

Attribute = make_attribute_enum()

class CountResponse(BaseModel):
    row_count: int
    response_schema: List[str]
    day_count: Optional[int] = None
    response: List[Any]

# TODO: put length restrictions on the List parameter
class FilterBody(BaseModel):
    include: Optional[Dict[CategoricalAttribute | AttributeLists, List[str | int]]] = Field(default_factory=dict, description="Whitelisted Chingu Attributes")
    exclude: Optional[Dict[CategoricalAttribute | AttributeLists, List[str | int]]] = Field(default_factory=dict, description="Blacklisted Chingu Attributes")


class FilteredTableResponse(BaseModel):
    row_count: int
    response_schema: List[str]
    # We don't know full table schema here; keep it flexible.
    response: List[Dict[str, Any]]
