PROJECT_ID=v58-tier3-team-37
REGION=us-central1
SERVICE=chingu-members-api-v2
IMAGE=gcr.io/$PROJECT_ID/$SERVICE:latest
SERVICE_ACCOUNT=bq-queryer-service@v58-tier3-team-37.iam.gserviceaccount.com

# Builds and pushes the image:
#   gcloud builds submit — sends the current directory to Cloud Build
#   Cloud Build runs the Docker build using your Dockerfile
#   Tags the built image as gcr.io/$PROJECT_ID/$SERVICE:latest
#   Pushes the image to Container Registry under your project
gcloud builds submit --tag $IMAGE --project $PROJECT_ID


# Deploy to Cloud Run (public, HTTP)
#   gcloud run deploy — creates/updates the Cloud Run service named $SERVICE
#   Uses the built image URI
#   Deploys in the specified region and project
#   Assigns the service account for runtime permissions (e.g., BigQuery access)
#   Allows unauthenticated HTTP access (public endpoint)
gcloud run deploy $SERVICE \
  --image $IMAGE \
  --region $REGION \
  --project $PROJECT_ID \
  --service-account $SERVICE_ACCOUNT \
  --allow-unauthenticated