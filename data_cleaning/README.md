
# Overview
This is a script to download, clean & prepare chingu_member data for analysis.

# Optional: read the exploration & cleaning rational
You may read the exploration & cleaning rational in the jupyternotebook at `/data_cleaning/cleaning_chingu_demographics.ipynb`

# Running the Cleaning Script

## Linux
1. install the requirements
```bash
pip install -r requirements.txt
```

2. run the script
```bash
python3 cleaning_chingu_demographics.py > /dev/null
```

# How to Upload to Google BigQuery
1. go to https://console.cloud.google.com/bigquery?project=PROJECT_NAME
	- Fill in `PROJECT_NAME` with your own project name
2. in the `Explorer` panel (on middle-left) click on `Add Data`
3. `Local File`
4. Fill in the appropriate `Source` and `Destination`
	- the notebook outputs `data_cleaning/data/chingu_members_cleaned.json`
5. under `Schema` use...
```json
[
  { "name": "Gender",            "type": "STRING",   "mode": "NULLABLE" },
  { "name": "Goal",              "type": "STRING",   "mode": "NULLABLE" },
  { "name": "Goal_Other",        "type": "STRING",   "mode": "NULLABLE" },
  { "name": "Source",            "type": "STRING",   "mode": "NULLABLE" },
  { "name": "Source_Other",      "type": "STRING",   "mode": "NULLABLE" },
  { "name": "Solo_Project_Tier", "type": "INTEGER",  "mode": "NULLABLE" },
  { "name": "Timestamp",         "type": "TIMESTAMP","mode": "NULLABLE" },
  { "name": "Timezone",          "type": "STRING",   "mode": "NULLABLE" },
  { "name": "GMT_Offset",        "type": "INTEGER",  "mode": "NULLABLE" },
  { "name": "Country_Name",      "type": "STRING",   "mode": "NULLABLE" },
  { "name": "Country_Code",      "type": "STRING",   "mode": "NULLABLE" },
  { "name": "Role",              "type": "STRING",   "mode": "NULLABLE" },
  { "name": "id",                "type": "INTEGER",  "mode": "REQUIRED" },
  { "name": "Voyage_Signup_ids", "type": "INTEGER",  "mode": "REPEATED" },
  { "name": "Voyage_Tiers",      "type": "STRING",   "mode": "REPEATED" }
]
```
NOTE: This is the same as `data_cleaning/bigquery_schema.json`

# Connect the Data to the API
Add BigQuery `PROJECT_NAME`, `DATASET` and `TABLE` to the environment varables for the API in `/database-access-API/app/.env`
