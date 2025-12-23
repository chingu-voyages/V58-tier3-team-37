from datetime import date
from typing import Any, List, Optional, Dict

from asyncio import gather
from fastapi import APIRouter, Body, HTTPException, Query

from app.models import CategoricalAttribute, AttributeLists, Attribute, FilterBody, FilteredTableResponse, CountResponse
from app.api.core.config import settings

from google.cloud import bigquery
from google.cloud.exceptions import GoogleCloudError

bigquery_client: bigquery.Client = None

router = APIRouter(prefix="/chingu_members", tags=["chingu"])


# ---------------------------------------------------------------

# TODO: build endpoint to display available categorical columns
@router.get("/chingu_attributes")
async def get_categorical_columns() -> List[str]:
    """List all allowed Chingu Attributes"""
    return [attribute.value for attribute in (Attribute)]

# ---------------------------------------------------------------

def validate_FilterBody(filters: FilterBody):
    # Fast fail if cache is empty (e.g., BigQuery unreachable at startup)
    if not unique_value_cache:
        raise HTTPException(status_code=502, detail="Filter cache unavailable; service failed to warm with BigQuery")
    
    for attr_enum, attributes in filters.include.items():
        invalid_values = set(attributes) - unique_value_cache.get(attr_enum.value, set()) 
        if invalid_values:
            raise HTTPException(status_code=400, detail=f"Invalid include values for {attr_enum.value}: {invalid_values}")
    
    for attr_enum, attributes in filters.exclude.items():
        invalid_values = set(attributes) - unique_value_cache.get(attr_enum.value, set()) 
        if invalid_values:
            raise HTTPException(status_code=400, detail=f"Invalid exclude values for {attr_enum.value}: {invalid_values}")



int_attributes = {"Solo_Project_Tier", "GMT_Offset", "Voyage_Signup_ids"}

unique_value_cache: Dict[str, set[str | int]] = {}

@router.get("/{chingu_attribute}/UNIQUE", response_model=List[str | int | None])
async def get_unique_values(chingu_attribute: Attribute) -> List[str | int]:
    """Return all unique values in {chingu_attribute}."""
    try:
        if chingu_attribute.name in AttributeLists.__members__:
            query = f"""
                SELECT DISTINCT v AS value
                FROM `{settings.GCP_PROJECT_ID}.{settings.DATASET}.{settings.TABLE}`,
                UNNEST(`{chingu_attribute.value}`) AS v
            """
        else:
            query = f"""
                SELECT DISTINCT `{chingu_attribute.value}` AS value
                FROM `{settings.GCP_PROJECT_ID}.{settings.DATASET}.{settings.TABLE}`
            """

        query_result = bigquery_client.query(query).result()
        unique_values = [row["value"] for row in query_result]

        return unique_values
    except GoogleCloudError as e:
        raise HTTPException(status_code=502, detail=f"BigQuery error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------

# prefill a cache of acceptable attributes to speed up queries and avoid SQL injection for filters
@router.on_event("startup")
async def prefill_filter_cache():
    global unique_value_cache, bigquery_client
    try:
        import os
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.GOOGLE_APPLICATION_CREDENTIALS
        bigquery_client = bigquery.Client()
        buffer = {attr.value: get_unique_values(attr) for attr in Attribute}
        results = await gather(*buffer.values())
        unique_value_cache = {attr_val: set(res) for attr_val, res in zip(buffer.keys(), results)}
    except GoogleCloudError as gce:
        print(f"[startup] Unable to reach BigQuery {gce}")
        unique_value_cache = {}
    except Exception as e:
        print(f"[startup] Unexpected error trying to reach BigQuery: {e}")
        print()
        unique_value_cache = {}

# ---------------------------------------------------------------

@router.get(
        "/{chingu_attribute}/COUNT/",
        response_model=CountResponse,
        response_model_exclude_none=True
    )
async def get_unique_count(
    chingu_attribute: CategoricalAttribute,
    start_date: Optional[date] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[date] = Query(None, description="End date in YYYY-MM-DD format")
) -> Dict[str, Any]:
    """Returns the number of rows for each unique value in {chingu_attribute}.
    """

    query_sql = f"""SELECT `{chingu_attribute.value}`,
        Count(*) as count
        FROM `{settings.GCP_PROJECT_ID}.{settings.DATASET}.{settings.TABLE}`
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

@router.post(
        "/table/filtered",
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
        offset: Optional[int] = Query(None, description="Start the result from a particular row", ge=0),
        limit: Optional[int] = Query(200, description="LIMIT the length of the output", ge=0)
    ) -> Dict[str, Any]:
    """Returns rows from the Chingu members table. Result is filtered by given attributes in the request body."""
    
    validate_FilterBody(filters)

    query_sql = f"""SELECT *
        FROM `{settings.GCP_PROJECT_ID}.{settings.DATASET}.{settings.TABLE}`
        WHERE 1=1
    """
    
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
            if isinstance(col_enum, CategoricalAttribute):
                query_sql += f" AND `{col_enum.value}` {MAYBE} IN UNNEST(@{col_enum.value}_filter)"
            else:
                # BigQuery Version
                # query_sql += f" AND {MAYBE} (ARRAY_LENGTH(ARRAY_INTERSECT(`{col_enum.value}`, @{col_enum.value})) > 0)"  
                # job_config.use_legacy_sql = False  # for the BigQuery Version

                # ANSI SQL version
                query_sql += f" AND {MAYBE} EXISTS (SELECT 1 FROM UNNEST(`{col_enum.value}`) v WHERE v IN UNNEST(@{col_enum.value}_filter))"  
            
            job_params.append(bigquery.ArrayQueryParameter(f"{col_enum.value}_filter", BQ_TYPE, attributes))

    # BQ doesn't gurantee a stable output order unless ORDER BY is given
    query_sql += f" ORDER BY `id`"

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

# ---------------------------------------------------------------

@router.post(
        "/Country_Code/COUNT/filtered",
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
async def filter_country_code_count(
        filters: FilterBody = Body()
    ) -> Dict[str, Any]:
    """Returns the COUNT of Chingu members in each Country_Code. Result is filtered by given attributes in the request body."""
    
    validate_FilterBody(filters)

    query_sql = f"""SELECT `{CategoricalAttribute.COUNTRY_CODE.value}`,
        COUNT(*) as count FROM `{settings.GCP_PROJECT_ID}.{settings.DATASET}.{settings.TABLE}`
        WHERE 1=1
    """

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
            if isinstance(col_enum, CategoricalAttribute):
                query_sql += f" AND `{col_enum.value}` {MAYBE} IN UNNEST(@{col_enum.value}_filter)"
            else:
                # BigQuery Version
                # query_sql += f" AND {MAYBE} (ARRAY_LENGTH(ARRAY_INTERSECT(`{col_enum.value}`, @{col_enum.value})) > 0)"  
                # job_config.use_legacy_sql = False  # for the BigQuery Version

                # ANSI SQL version
                query_sql += f" AND {MAYBE} EXISTS (SELECT 1 FROM UNNEST(`{col_enum.value}`) v WHERE v IN UNNEST(@{col_enum.value}_filter))"  
            
            job_params.append(bigquery.ArrayQueryParameter(f"{col_enum.value}_filter", BQ_TYPE, attributes))

    query_sql += f" GROUP BY `{CategoricalAttribute.COUNTRY_CODE.value}`"

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
    