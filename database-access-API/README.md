# Introduction
This is a lightweight API that reads from BigQuery and exposes parameterized endpoints for querying Chingu member demographics. It is designed for secure, read-only access with filtering, counting, and basic pagination features.

# Goals
- Provide a simple, secure interface for querying cleaned Chingu member data
	- WHY: enable dashboards and services to reuse standardized queries without duplicating SQL
	- Example Use Cases:
		- get unique values for categorical attributes (e.g., Gender, Country_Code)
		- filter members by multiple attributes and list results
		- get counts grouped by an attribute, optionally filtered
- Practice building cloud-native services with clear deployment and IAM patterns
	1. define a minimal schema contract via enums and response models
	2. parameterize queries to avoid SQL injection and improve caching
	3. deploy with Cloud Run using a dedicated service account for BigQuery access

# Results - Overview
FastAPI Endpoints (BigQuery-backed):
1. GET / — returns the active BigQuery table being queried
2. GET /chingu_members/chingu_attributes — lists allowed categorical attributes
3. GET /chingu_members/{attribute}/UNIQUE — distinct values for an attribute
4. GET /chingu_members/{attribute}/COUNT — counts per attribute, optional date range
5. POST /chingu_members/table/filtered — filtered rows with LIMIT/OFFSET pagination
7. POST /chingu_members/Country_Code/COUNT/filtered — shortcut for Country_Code counts

# Technologies Used
- Python + FastAPI to expose read-only endpoints and validate inputs
- Google BigQuery to execute parameterized, cached queries
- Google Cloud Run to host the API with a service account for runtime access
- Docker to build and package the service
- Pydantic for request/response validation

# Setup and Deploy on Google Cloud
## 1. Requirements
- Google Cloud Project
- Google Cloud CLI
- BigQuery dataset and table with member data
- Container Registry or Artifact Registry enabled

## 2. Environment Configuration
1. Remove "sample" from the name of the `/database-access-API/app/sample.env` file
2. In the new `.env` file, enter details for your BigQuery chingu_member_table: `GCP_PROJECT_ID`, `DATASET`, `TABLE`
3. For the Cloud Run, API deployment fill in `REGION` a `SERVICE_NAME`

## 3. Configure a Service Account
Grant least-privilege roles needed for read access to your BigQuery Database:
- BigQuery Data Viewer
- BigQuery Job User
- Cloud Run Invoker (optional; use —allow-unauthenticated for public access)

To your `/database-access-API/app/.env` file complete the `SERVICE_ACCOUNT` variable with the name of the service account you created
- e.g. `SERVICE_ACCOUNT=bq-queryer-service@GCP_PROJECT_ID.iam.gserviceaccount.com`

## 4. Build & Deploy
Use the helper script to build the Docker image and deploy to Cloud Run:
```bash
bash ./launch-cloud-run.sh
```
- gcloud builds submit — builds and pushes the container image
- gcloud run deploy — deploys the service, assigns the service account, and sets public access

## 5. Test the API
- Visit the Cloud Run URL root (/) to confirm the active BigQuery table
- Add `/docs` to the URL for an interactive Swagger UI

## 6. Shut Down
Delete the Cloud Run service and container image if needed:
```bash
gcloud run services delete SERVICE_NAME --region REGION --project GCP_PROJECT_ID
gcloud container images delete gcr.io/GCP_PROJECT_ID/SERVICE_NAME:latest --force-delete-tags
```

# Special Thanks
Thanks to the Chingu community and [Saverio Mazza](https://github.com/mazzasaverio) for their resources and his examples that helped shape this service.

# Future Goals
- [x] initial Cloud Run deployment
- [ ] CI/CD pipeline with automated tests and staging
- [ ] add rate limiting and auth (API key or OAuth)
