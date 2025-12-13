# How to Upload to BQ
1. go to https://console.cloud.google.com/bigquery?project=PROJECT_NAME
	- Fill in `PROJECT_NAME` with your own project name
2. in `Explorer` panel on middle-left click on `Add Data`
3. `Local File`
4. Fill in the approprate `Source` and `Destination`
	- the notebook outputs `data_cleaning/data/chingu_members_cleaned.json`
5. under `Schema` add
```json
[
  {"name": "Gender", "type": "STRING", "mode": "NULLABLE"},
  {"name": "Goal", "type": "STRING", "mode": "NULLABLE"},
  {"name": "Goal_Other", "type": "STRING", "mode": "NULLABLE"},
  {"name": "Source", "type": "STRING", "mode": "NULLABLE"},
  {"name": "Source_Other", "type": "STRING", "mode": "NULLABLE"},
  {"name": "Solo_Project_Tier", "type": "STRING", "mode": "NULLABLE"},
  {"name": "Timestamp", "type": "TIMESTAMP", "mode": "NULLABLE"},
  {"name": "Timezone", "type": "STRING", "mode": "NULLABLE"},
  {"name": "GMT_Offset", "type": "INTEGER", "mode": "NULLABLE"},
  {"name": "Country_Name", "type": "STRING", "mode": "NULLABLE"},
  {"name": "Country_Code", "type": "STRING", "mode": "NULLABLE"},
  {"name": "Role", "type": "STRING", "mode": "NULLABLE"},
  {"name": "id", "type": "INTEGER", "mode": "REQUIRED"}
]
```
NOTE: same as `data_cleaning/bigquery_schema.json`
