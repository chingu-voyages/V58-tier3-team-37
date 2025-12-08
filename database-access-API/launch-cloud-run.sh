# Set your project and region
PROJECT_ID=v58-tier3-team-37
REGION=us-central1
SERVICE=chingu-members-api-v2
IMAGE=gcr.io/$PROJECT_ID/$SERVICE:latest
SERVICE_ACCOUNT=bq-queryer-service@v58-tier3-team-37.iam.gserviceaccount.com

# Build and push the container image
gcloud builds submit --tag $IMAGE --project $PROJECT_ID

# Deploy to Cloud Run (public, HTTP)
gcloud run deploy $SERVICE \
  --image $IMAGE \
  --region $REGION \
  --project $PROJECT_ID \
  --service-account $SERVICE_ACCOUNT \
  --allow-unauthenticated