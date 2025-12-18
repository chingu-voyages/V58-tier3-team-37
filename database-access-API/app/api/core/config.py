from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="app/.env",
        env_ignore_empty=True,
        extra="ignore",
    )

    # Chingu Member Table on BigQuery
    GCP_PROJECT_ID: str
    DATASET: str
    TABLE: str

    IS_PRODUCTION: bool

    # Cloud Run Deployment Variables
    REGION: str
    SERVICE_NAME: str
    SERVICE_ACCOUNT: str

    # file path to a json credentials for accessing BigQuery outside of Cloud Run in the same Project
    GOOGLE_APPLICATION_CREDENTIALS: str

settings = Settings()