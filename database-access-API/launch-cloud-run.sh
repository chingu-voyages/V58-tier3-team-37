
# Parse values directly from terraform.tfvars
ENV_FILE=app/.env

GCP_PROJECT_ID=$(grep '^GCP_PROJECT_ID' "$ENV_FILE" | awk -F'=' '{print $2}' | tr -d ' "')
DATASET=$(grep '^DATASET' "$ENV_FILE" | awk -F'=' '{print $2}' | tr -d ' "')
TABLE=$(grep '^TABLE' "$ENV_FILE" | awk -F'=' '{print $2}' | tr -d ' "')
REGION=$(grep '^REGION' "$ENV_FILE" | awk -F'=' '{print $2}' | tr -d ' "')

SERVICE_NAME=$(grep '^SERVICE_NAME' "$ENV_FILE" | awk -F'=' '{print $2}' | tr -d ' "')
SERVICE_ACCOUNT=$(grep '^SERVICE_ACCOUNT' "$ENV_FILE" | awk -F'=' '{print $2}' | tr -d ' "')

IMAGE=gcr.io/$GCP_PROJECT_ID/$SERVICE_NAME:latest

# Builds and pushes the image:
#   gcloud builds submit — sends the current directory to Cloud Build
#   Cloud Build runs the Docker build using your Dockerfile
#   Tags the built image as gcr.io/$GCP_PROJECT_ID/$SERVICE_NAME:latest
#   Pushes the image to Container Registry under your project
gcloud builds submit --tag $IMAGE --project $GCP_PROJECT_ID


# Deploy to Cloud Run (public, HTTP)
#   gcloud run deploy — creates/updates the Cloud Run service named $SERVICE_NAME
#   Uses the built image URI
#   Deploys in the specified region and project
#   Assigns the service account for runtime permissions (e.g., BigQuery access)
#   Allows unauthenticated HTTP access (public endpoint)
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --region $REGION \
  --project $GCP_PROJECT_ID \
  --service-account $SERVICE_ACCOUNT \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID="$GCP_PROJECT_ID" \
  --set-env-vars DATASET="$DATASET" \
  --set-env-vars TABLE="$TABLE" \
  --set-env-vars IS_PRODUCTION=True