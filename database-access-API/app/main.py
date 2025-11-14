"""FastAPI service exposing read-only, parameterized access to Chingu member data in BigQuery.

Error handling:
- 400 for invalid date usage
- 502 for BigQuery errors
- 500 for unexpected exceptions
"""
import os
from datetime import date
from typing import Any, List, Optional, Dict
from enum import Enum

from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Query

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

# TODO: build endpoint to display available categorical columns
@app.get("/v1/chingu_members/categorical_columns")
async def get_categorical_columns() -> List[str]:
    """List all allowed categorical columns"""
    return [column.value for column in CategoricalColumns]

# ---------------------------------------------------------------


class CategoricalColumns(str, Enum):
    """Enumerates columns permitted in aggregation & distinct-value queries."""
    GENDER = "Gender"
    COUNTRY_CODE = "Country_Code"
    GOAL = "Goal"
    SOURCE = "Source"
    COUNTRY_NAME_FROM_COUNTRY = "Country_name_from_Country"
    SOLO_PROJECT_TIER = "Solo_Project_Tier"
    ROLE_TYPE = "Role_Type"
    ROLE = "Role"

# TODO: build endpoint to get the unique values for a categorical column
@app.get("/v1/chingu_members/{chingu_attribute}/UNIQUE", response_model=List[str])
async def get_unique_values(chingu_attribute: CategoricalColumns) -> List[str]:
    """Return all unique values in {chingu_attribute}."""
    query = f"""SELECT DISTINCT {chingu_attribute.value} FROM `{GCP_PROJECT_ID}.{DATASET}.{TABLE}`"""
    
    query_result = bigquery_client.query(query).result()
    unique_values = [row[chingu_attribute.value] for row in query_result if row[chingu_attribute.value] is not None]

    return unique_values

# ---------------------------------------------------------------

class CountBucket(BaseModel):
    chingu_attribute: str
    count: int

class CountResponse(BaseModel):
    row_count: int
    response_schema: List[str]
    day_count: Optional[int] = None
    response: List[CountBucket]


@app.get(
        "/chingu_members/{chingu_attribute}/COUNT/",
        response_model=CountResponse,
        response_model_exclude_none=True
    )
async def get_unique_count(
    chingu_attribute: CategoricalColumns,
    start_date: Optional[date] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[date] = Query(None, description="End date in YYYY-MM-DD format")
) -> Dict[str, Any]:
    """Returns the number of rows for each unique value in {chingu_attribute}.
    """

    query_sql = f"""SELECT {chingu_attribute.value} as chingu_attribute, Count(*) as count
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


    query_sql += f""" GROUP BY {chingu_attribute.value};"""
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

# TODO: put length restrictions on the List parameter
class FilterRequest(BaseModel):
    include: Optional[Dict[CategoricalColumns, List[str]]] = Field(default_factory=dict, description="Inclusion filters for categorical columns")
    exclude: Optional[Dict[CategoricalColumns, List[str]]] = Field(default_factory=dict, description="Exclusion filters for categorical columns")
    offset: Optional[int] = Field(None, description="Start the result from a particular row")
    limit: Optional[int] = Field(200, description="Limit the result of the ouput", ge=0)

class FilteredTableResponse(BaseModel):
    row_count: int
    response_schema: List[str]
    # We don't know full table schema here; keep it flexible.
    response: List[Dict[str, Any]]

@app.post(
        "/v1/chingu_members/filtered_table",
        response_model=FilteredTableResponse
    )
async def query_filtered_table(filters: FilterRequest) -> Dict[str, Any]:
    """Returns rows from the Chingu members table filtered by inclusion/exclusion criteria."""
    query_sql = f"""SELECT * FROM `{GCP_PROJECT_ID}.{DATASET}.{TABLE}` WHERE 1=1"""

    job_config = bigquery.QueryJobConfig(
        dry_run=False,
        use_query_cache=True,
    )

    # NOTE: if ever relaxed, append _include/_exclude to ScalarQueryParameters for the predicates
    if set(filters.exclude.keys()) & set(filters.include.keys()):
        raise HTTPException(status_code=400, detail="Cannot include and exclude the same column.")

    # Include predicates
    job_params = []
    for col_enum, include_categories in filters.include.items():
        if not include_categories:
            continue
        
        query_sql += f" AND `{col_enum.value}` IN UNNEST(@{col_enum.value})"
        job_params.append(bigquery.ArrayQueryParameter(col_enum.value, "STRING", include_categories))

    # Exclude predicates
    for col_enum, include_categories in filters.exclude.items():
        if not include_categories:
            continue
        
        query_sql += f" AND `{col_enum.value}` NOT IN UNNEST(@{col_enum.value})"
        job_params.append(bigquery.ArrayQueryParameter(col_enum.value, "STRING", include_categories))

    # Pagination window
    query_sql += f" LIMIT @window_limit"
    job_params.append(bigquery.ScalarQueryParameter("window_limit", "INT64", filters.limit))
    
    if filters.offset is not None:
        query_sql += f" OFFSET @window_offset"
        job_params.append(bigquery.ScalarQueryParameter("window_offset", "INT64", filters.offset))

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
        "/v1/chingu_members/Country_Code/COUNT/filtered",
        response_model=CountResponse,
        response_model_exclude_none=True
    )
async def filter_location_count(filters: FilterRequest) -> Dict[str, Any]:
    """Returns rows from the Chingu members table filtered by inclusion/exclusion criteria."""
    query_sql = f"""SELECT `Country_Code` AS chingu_attribute, COUNT(*) as count FROM `{GCP_PROJECT_ID}.{DATASET}.{TABLE}` WHERE 1=1"""

    job_config = bigquery.QueryJobConfig(
        dry_run=False,
        use_query_cache=True,
    )

    # NOTE: if ever relaxed, append _include/_exclude to ScalarQueryParameters for the predicates
    if set(filters.exclude.keys()) & set(filters.include.keys()):
        raise HTTPException(status_code=400, detail="Cannot include and exclude the same column.")

    # Include predicates
    job_params = []
    for col_enum, include_categories in filters.include.items():
        if not include_categories:
            continue
        
        query_sql += f" AND `{col_enum.value}` IN UNNEST(@{col_enum.value})"
        job_params.append(bigquery.ArrayQueryParameter(col_enum.value, "STRING", include_categories))

    # Exclude predicates
    for col_enum, include_categories in filters.exclude.items():
        if not include_categories:
            continue
        
        query_sql += f" AND `{col_enum.value}` NOT IN UNNEST(@{col_enum.value})"
        job_params.append(bigquery.ArrayQueryParameter(col_enum.value, "STRING", include_categories))

    query_sql += " GROUP BY `Country_Code`"

    # Pagination window
    query_sql += f" LIMIT @window_limit"
    job_params.append(bigquery.ScalarQueryParameter("window_limit", "INT64", filters.limit))
    
    if filters.offset is not None:
        query_sql += f" OFFSET @window_offset"
        job_params.append(bigquery.ScalarQueryParameter("window_offset", "INT64", filters.offset))

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
