"""FastAPI service exposing read-only, parameterized access to Chingu member data in BigQuery.

Error handling:
- 400 for invalid date usage
- 502 for BigQuery errors
- 500 for unexpected exceptions
"""
import os
from datetime import date
from typing import Any, List, Optional, Dict, Union
from enum import Enum

from pydantic import BaseModel, Field
from fastapi import Body, FastAPI, HTTPException, Query

from google.cloud import bigquery
from google.cloud.exceptions import GoogleCloudError



# TODO: separate into config module
from dotenv import load_dotenv

load_dotenv()
GCP_PROJECT_ID = os.getenv('GCP_PROJECT_ID') or "v58-tier3-team-37"
DATASET = os.getenv('DATASET') or "chingu_members"
TABLE = os.getenv('TABLE') or "chingu_members_cleaned"
if (os.getenv('IS_PRODUCTION')!='True'):
    # In local/dev explicitly use credentials; Cloud Run uses its service account automatically
    GOOGLE_APPLICATION_CREDENTIALS = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')

app = FastAPI(title="Chingu Member Demographics", version="0.1.0")

bigquery_client = bigquery.Client()


# ---------------------------------------------------------------

@app.get("/")
def return_status() -> str:
    return f"currently querying `{GCP_PROJECT_ID}.{DATASET}.{TABLE}`"

# TODO: build endpoint to display available categorical columns
@app.get("/chingu_members/chingu_attributes")
async def get_categorical_columns() -> List[str]:
    """List all allowed Chingu Attributes"""
    return [attribute.value for attribute in CategoricalAttributes]

# ---------------------------------------------------------------


class CategoricalAttributes(str, Enum):
    """Attributes permitted in aggregation & UNIQUE-value queries."""
    GENDER = "Gender"
    COUNTRY_CODE = "Country_Code"
    COUNTRY_NAME_FROM_COUNTRY = "Country_Name"
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

list_attributes = {"Voyage_Signup_ids", "Voyage_Tiers"}
int_attributes = {"Solo_Project_Tier", "GMT_Offset", "Voyage_Signup_ids"}

@app.get("/chingu_members/{chingu_attribute}/UNIQUE", response_model=List[str | int])
async def get_unique_values(chingu_attribute: CategoricalAttributes) -> List[str | int]:
    """Return all unique values in {chingu_attribute}."""

    # TODO: update this to return distinct attributes in AttributeLists as well
    query = f"""SELECT DISTINCT `{chingu_attribute.value}` FROM `{GCP_PROJECT_ID}.{DATASET}.{TABLE}`"""
    
    query_result = bigquery_client.query(query).result()
    unique_values = [row[chingu_attribute.value] for row in query_result if row[chingu_attribute.value] is not None]

    return unique_values

# ---------------------------------------------------------------

class CountResponse(BaseModel):
    row_count: int
    response_schema: List[str]
    day_count: Optional[int] = None
    response: List[Any]


@app.get(
        "/chingu_members/{chingu_attribute}/COUNT/",
        response_model=CountResponse,
        response_model_exclude_none=True
    )
async def get_unique_count(
    chingu_attribute: CategoricalAttributes,
    start_date: Optional[date] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[date] = Query(None, description="End date in YYYY-MM-DD format")
) -> Dict[str, Any]:
    """Returns the number of rows for each unique value in {chingu_attribute}.
    """

    query_sql = f"""SELECT `{chingu_attribute.value}`, Count(*) as count
        FROM `{GCP_PROJECT_ID}.{DATASET}.{TABLE}`
    """
    job_config = bigquery.QueryJobConfig(
        dry_run=False,
        use_query_cache=True,
    )

    
    if start_date and end_date:
        if end_date < start_date:
            raise HTTPException(
                status_code=400,
                detail="end_date must be greater than or equal to start_date"
            )
        query_sql += """ WHERE DATE(Timestamp) BETWEEN @start_date AND @end_date"""
        job_config.query_parameters=[
            bigquery.ScalarQueryParameter("start_date", "DATE", start_date),
            bigquery.ScalarQueryParameter("end_date", "DATE", end_date),
        ]
    elif start_date or end_date:
        raise HTTPException(status_code=400, detail="start_date and end_date must be provided together")


    query_sql += f""" GROUP BY `{chingu_attribute.value}`;"""
    try:
        result = bigquery_client.query(query_sql, job_config=job_config).result()
        result_json: List[Dict[str, Any]] = [dict(row) for row in result]

        response = {
            "row_count": len(result_json),
            "response_schema": [field.name for field in result.schema]
        }

        if start_date and end_date:
            response["day_count"] = (end_date - start_date).days + 1


        response["response"] = result_json
        return response
    except GoogleCloudError as e:
        raise HTTPException(status_code=502, detail=f"BigQuery error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------

example_filter = { 
                    "include": {"Gender": ["FEMALE", "NON-BINARY"]},
                    "exclude": {"Goal": ["GAIN EXPERIENCE"], "Source": ["LinkedIn","OTHER"]}
                }

# TODO: put length restrictions on the List parameter
class FilterBody(BaseModel):
    include: Optional[Dict[Union[CategoricalAttributes, AttributeLists], List[str | int]]] = Field(default_factory=dict, description="Whitelisted Chingu Attributes")
    exclude: Optional[Dict[Union[CategoricalAttributes, AttributeLists], List[str | int]]] = Field(default_factory=dict, description="Blacklisted Chingu Attributes")


class FilteredTableResponse(BaseModel):
    row_count: int
    response_schema: List[str]
    # We don't know full table schema here; keep it flexible.
    response: List[Dict[str, Any]]

@app.post(
        "/chingu_members/table/filtered",
        response_model=FilteredTableResponse,
        openapi_extra={
            "requestBody": {
                "content": {
                    "application/json": {
                        "example": example_filter
                    }
                }
            }
        },
    )
async def query_filtered_table(
        filters: FilterBody = Body(),
        offset: Optional[int] = Query(None, description="Start the result from a particular row"),
        limit: Optional[int] = Query(200, description="LIMIT the length of the output", ge=0)
    ) -> Dict[str, Any]:
    """Returns rows from the Chingu members table filtered by their attributes.
    """
    query_sql = f"""SELECT * FROM `{GCP_PROJECT_ID}.{DATASET}.{TABLE}` WHERE 1=1"""

    job_config = bigquery.QueryJobConfig(
        dry_run=False,
        use_query_cache=True,
    )

    # NOTE: if ever relaxed, append _include/_exclude to ScalarQueryParameters for the predicates
    overlapping_attributes = set(filters.exclude.keys()) & set(filters.include.keys())
    if overlapping_attributes:
        raise HTTPException(status_code=400, detail=f"Cannot include and exclude from the same attributes: {overlapping_attributes}")

    job_params = []

    # WHERE filter
    for excludes_at_one, predicate_map in enumerate([filters.include, filters.exclude]):
        for col_enum, attributes in predicate_map.items():
            BQ_TYPE = "INT64" if col_enum.value in int_attributes else "STRING"
            MAYBE = "NOT" if excludes_at_one == 1 else ""
            if col_enum in CategoricalAttributes:
                query_sql += f" AND `{col_enum.value}` {MAYBE} IN UNNEST(@{col_enum.value})"
            else:
                # query_sql += f" AND {MAYBE} (ARRAY_LENGTH(ARRAY_INTERSECT(`{col_enum.value}`, @{col_enum.value})) > 0)"  # BigQuery Version
                # job_config.use_legacy_sql = False  # for the BigQuery Version
                query_sql += f" AND {MAYBE} EXISTS (SELECT 1 FROM UNNEST(`{col_enum.value}`) v WHERE v IN UNNEST(@{col_enum.value}))"  # ANSI SQL version
            
            job_params.append(bigquery.ArrayQueryParameter(col_enum.value, BQ_TYPE, attributes))

    # Pagination window
    query_sql += f" LIMIT @window_limit"
    job_params.append(bigquery.ScalarQueryParameter("window_limit", "INT64", limit))
    
    if offset is not None:
        query_sql += f" OFFSET @window_offset"
        job_params.append(bigquery.ScalarQueryParameter("window_offset", "INT64", offset))

    job_config.query_parameters = job_params

    query_sql += ";"

    # Execute Query
    try:
        query_result = bigquery_client.query(query_sql, job_config=job_config).result()
        query_result_json: List[Dict[str, Any]] = [dict(row) for row in query_result]
        
        response = {
            "row_count": len(query_result_json),
            "response_schema": [field.name for field in query_result.schema],
            "response": query_result_json
        }
        return response
    except GoogleCloudError as gce:
        raise HTTPException(status_code=502, detail=f"BigQuery error: {gce}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.post(
        "/chingu_members/Country_Code/COUNT/filtered",
        response_model=CountResponse,
        response_model_exclude_none=True,
        openapi_extra={
            "requestBody": {
                "content": {
                    "application/json": {
                        "example": example_filter
                    }
                }
            }
        },
    )
async def filter_location_count(
        filters: FilterBody = Body()
    ) -> Dict[str, Any]:
    """Returns the COUNT of Chingu members in each Country_Code. filtered by their attributes."""
    query_sql = f"""SELECT `{CategoricalAttributes.COUNTRY_CODE.value}`, COUNT(*) as count FROM `{GCP_PROJECT_ID}.{DATASET}.{TABLE}` WHERE 1=1"""

    job_config = bigquery.QueryJobConfig(
        dry_run=False,
        use_query_cache=True,
    )

    # NOTE: if ever relaxed, append _include/_exclude to ScalarQueryParameters for the predicates
    overlapping_attributes = set(filters.exclude.keys()) & set(filters.include.keys())
    if overlapping_attributes:
        raise HTTPException(status_code=400, detail=f"Cannot include and exclude from the same attributes: {overlapping_attributes}")

    job_params = []

    # WHERE filter
    for excludes_at_one, predicate_map in enumerate([filters.include, filters.exclude]):
        for col_enum, attributes in predicate_map.items():
            BQ_TYPE = "INT64" if col_enum.value in int_attributes else "STRING"
            MAYBE = "NOT" if excludes_at_one == 1 else ""
            if col_enum in CategoricalAttributes:
                query_sql += f" AND `{col_enum.value}` {MAYBE} IN UNNEST(@{col_enum.value})"
            else:
                # BigQuery Version
                # query_sql += f" AND {MAYBE} (ARRAY_LENGTH(ARRAY_INTERSECT(`{col_enum.value}`, @{col_enum.value})) > 0)"  
                # job_config.use_legacy_sql = False  # for the BigQuery Version

                # ANSI SQL version
                query_sql += f" AND {MAYBE} EXISTS (SELECT 1 FROM UNNEST(`{col_enum.value}`) v WHERE v IN UNNEST(@{col_enum.value}))"  
            
            job_params.append(bigquery.ArrayQueryParameter(col_enum.value, BQ_TYPE, attributes))

    query_sql += f" GROUP BY `{CategoricalAttributes.COUNTRY_CODE.value}`"

    job_config.query_parameters = job_params


    query_sql += ";"
    # Execute Query
    try:
        query_result = bigquery_client.query(query_sql, job_config=job_config).result()
        query_result_json: List[Dict[str, Any]] = [dict(row) for row in query_result]
        
        response = {
            "row_count": len(query_result_json),
            "response_schema": [field.name for field in query_result.schema],
            "response": query_result_json
        }
        return response
    except GoogleCloudError as gce:
        raise HTTPException(status_code=502, detail=f"BigQuery error: {gce}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
