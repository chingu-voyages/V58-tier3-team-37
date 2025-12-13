#!/usr/bin/env python
# coding: utf-8

# # Chingu Member Data Cleaning v58

# # Project Overview
# This project's ultimate aim is to create an app that visualizes demographics for Chingu Members. Further project requirements and specifications set by the Chingu Organization can be found on github here: https://github.com/chingu-voyages/voyage-project-chingu-map
# # Our Team: 
# - Formed for Voyage 58, we are team 37
# - Michael, Shruti, Jessica, Henry, Gisele
# - Our github repo containing the solution to the requirements: [V58-tier3-team-37](https://github.com/chingu-voyages/V58-tier3-team-37)
# # This Notebook's Goal
# - Prepare the raw data so that it's usable for demographic visualizations per the requirements
# 	- become familar with the data
# 	- remove illogical data
# 	- remove duplicate data
# 	- separate or normalize the data into logical tables
# 	- report information on data that was removed
# - This notebook contains the steps needed are to clean up the raw data and the reasoning behind them.
# # Data Source
# The json document was provided on github in the project details here: 
# https://github.com/chingu-voyages/voyage-project-chingu-map/blob/main/src/assets/chingu_info.json

# # Downloading, Inspecting & Planning
# 1. Download the data
# 2. inspect the input format
# 3. decide on a strategy to flatten the data into tables

# In[838]:


import pandas as pd
import requests
import json
from os import path

from os import makedirs
makedirs('data', exist_ok=True)

raw_url = 'https://raw.githubusercontent.com/chingu-voyages/voyage-project-chingu-map/main/src/assets/chingu_info.json'
saved_filepath = "./data/chingu_members.json"

if not path.exists(saved_filepath):
    print("Downloaded data.")

    response = requests.get(raw_url)
    if response.status_code == 200:
        chingu_info = response.json()
        print(json.dumps(chingu_info[:50], indent=2))
        with open("./data/chingu_members.json", 'w') as f:
            json.dump(chingu_info, f, indent=2)
    else:
        raise Exception(f"Failed to fetch JSON: {response.status_code}")

with open("./data/chingu_members.json") as f:
    data = json.load(f)
    print(json.dumps(data, indent=4))


# # First impressions
# This appears to be a standard users dataset.
# There are some special characters in column names that need to be removed and some types that need validation.
# Before cleaning I'll get statistics and the unique values for each column to better understand the data.

# In[839]:


import pandas as pd
df = pd.read_json("data/chingu_members.json")
df.info()


# In[840]:


# display a short list of the unique values in each column
for column in df.columns:
    unique_values = df[column].unique()
    print(f"Column: {column}")
    print(f"Unique values ({len(unique_values)}): {unique_values[:10]}")


# 
# # Inferred Column Descriptions
# 
# | Column | Type | Description |
# |---|---|---|
# | **Timestamp** | datetime | Signup date for the member submission time (format "YYYY-MM-DD HH:MM") |
# | **Gender** | categorical | Gender the chingu selected in their signup form. 'MALE' 'FEMALE' 'PREFER NOT TO SAY' 'NON-BINARY' 'TRANS' |
# | **Country Code** | ISO alpha-2-ish | Short country codes for a chingu's country of origin (e.g. US, IN, GB) |
# | **Timezone** | categorical | Timezone for which the chingu resides. ("GMT-4", "GMT-5". Input seems to be messy with location sometimes included |
# | **Goal** | categorical | Standardized responses for a user wants out of Chingu (GAIN EXPERIENCE, ACCELERATE LEARNING, ...) |
# | **Goal-Other** | free text | Supplied elaboration when Goal = OTHER. |
# | **Source** | categorical | Standardized responses for how users found Chingu (PERSONAL NETWORK, GOOGLE SEARCH, etc.). |
# | **Source-Other** | free text | Additional source detail when Source = OTHER. |
# | **Country name (from Country)** | categorical | Verbose country name that's redundant with Country Code. |
# | **Solo Project Tier** | categorical | Tier of project a chingu completed and associated description with that tier |
# | **Role Type** | categorical | Type of developer a chingu member is |
# | **Voyage Role** | categorical | Role the chingu takes in a Voyage: Developer, Scrum Master, Product Owner, UI/UX Designer. |
# | **Voyage (from Voyage Signups)** | semi-structured | List of voyages a chingu has participated in |
# | **Voyage Tier** | semi-structured | List of skill levels for the team assigned to in the voyage signup. |
# 

# # Cleaning Plan Overview
# - replace special characters in the column names with '_'
# - convert empty strings are converted to `NULL` / `None`
# 
# - `Goal-Other`, `Source-Other`: Trim whitespace
# - `Goal-Other`, `Source-Other`: empty strings are converted to `None`/`NULL`
# 
# - add a Serially incrementing `id` column for the primary key 
# 
# - `Timestamp`: Convert to UTC - Parse to pandas datetime (coerce errors)
# 
# - `Timezone`: messy, coerce into categorical values
# - `Timezone`: extract UTC offset tokens (e.g., GMT±n) into a numeric offset column
# 
# - `Country name`: some don't match `Country Code`. Use a ISO-3166 alpha-2 mapping to create a new verbose country name col. Report rows that aren't just empty but mismatch between the new and the old verbose `Country name`
# 
# - prepare members filterable by `Voyage Signups` & `Voyage Tier` 
# 	- analyze what data is in `Voyage Signups` & `Voyage Tiers`
# 		- extract those values to sets
# 	- clean and extract values to numerical lists in each row
# 	- upload the new dataset to `...extra_clean` BQ dataset
# 
# - Export the new tables to NDJSON (newline-delimited JSON) for BigQuery ingestion
# 
# - (Potential Future Plans) Add arrayed values (`Voyage Signups`,`Voyage Tier`) into separate table: `Voyage_Signups`
# - rows in `Voyage_Signups` will be key linked to chingu member row from which they were taken from
# 
# - TODO: create another jupyternb for clearning the `Voyage_Signups` table

# # Investigating & Cleaning `Solo Project Tier`

# In[841]:


# Solo Project Tier is the only column name with spaces instead of underscores
# renaming for consistency
before_renaming = df.columns
df.rename(columns={"Solo Project Tier":"Solo_Project_Tier"}, inplace=True)


# In[842]:


df['Solo_Project_Tier'].value_counts()


# In[843]:


# There appears to be no errors in solo project tier so I'll simply extract the Tier
df['Solo_Project_Tier_cleaned'] = pd.to_numeric(
    df['Solo_Project_Tier'].str.extract(r"^Tier\s+(\d).*", expand=False),
    errors='coerce'
).astype('Int64')

before = 'Solo_Project_Tier'
after = 'Solo_Project_Tier_cleaned'
df[[before, after]].drop_duplicates()


# In[844]:


print(df.columns)
df.columns = df.columns.str.replace(pat='Country name (from Country)', repl='Country_name')
df.columns = df.columns.str.replace(pat=r'[^A-Za-z0-9]+', repl='_', regex=True)
df.columns = df.columns.str.strip('_')
print(df.columns)


# In[845]:


df.info()


# In[846]:


df.replace('', None, inplace=True)
df.info()


# In[847]:


# Timestamp: Convert to UTC - Parse to pandas datetime (coerce errors)
df['Timestamp_cleaned'] = pd.to_datetime(df['Timestamp'], errors='coerce').dt.tz_localize('UTC')
df.head()


# In[848]:


rough_timezones = df['Timezone'].unique()
print(rough_timezones)


# # Cleaning `Timezone`
# To clean the `Timezone` column I will.
# - coerce dash characters into 1 type
# - convert values greater than 12 or lower than -11 into appropriately offset values
# - coerce all other values into `None`/`null`
# - create a new numeric column with just the GMT offset value

# In[849]:


# coerce values into the range of 12 to -11. Account of too high/low levels
def coerce_gmt_offset(offset: int):
    offset = offset%24
    if offset > 12:
        offset -= 24
    elif offset < -11:
        offset += 24

    return offset

offsets =  [25, 24, 23, 13, 12, 11, 5, 1, 0, -1, -5, -11, -12, -13, -20, -23, -24, -25]
expected = [1,  0, -1, -11, 12, 11, 5, 1, 0, -1, -5, -11,  12,  11,   4,   1,   0, -1]

for offset, answer in zip(offsets, expected):
    processed_offset = coerce_gmt_offset(offset)
    assert processed_offset==answer


# In[850]:


# coerce dash characters into 1 type
# replace empty `GMT` into `GMT+0`
# convert values greater than 12 or lower than -11 into appropriately offset values
# coerce all other values into None

import re

def normalize_gmt(tz):
    if tz is None or tz == "":
        return None

    # normalize dash types
    tz = re.sub(r"−", "-", tz)

    m = re.match(r"GMT\s*([+-]?\d+)", tz, re.IGNORECASE)
    if not m:
        return None

    offset = int(m.group(1))
    offset = coerce_gmt_offset(offset)
    result = (f"GMT+{offset}" if offset >= 0 else f"GMT{offset}")
    return result

rough_timezones = [None, 'GMT-5 (New York)', 'GMT−5', 'GMT−8', 'GMT+1', 'GMT-5', 'GMT-8', 'GMT+3',
 'GMT+5', 'GMT+10', 'GMT-12', 'GMT+6', 'GMT-6', 'GMT+2', 'GMT+8', 'GMT-0', 'GMT-7',
 'GMT-4', 'GMT+7', 'GMT+9', 'GMT-2', 'GMT-3', 'GMT+4', 'GMT+0', 'GMT+12', 'GMT−7',
 'GMT−6', 'GMT−3', 'GMT−1', 'GMT−10', 'GMT−4', 'GMT+22', '#N/A', 'GMT+)']


expected_timezones = [None,'GMT-5','GMT-5', 'GMT-8', 'GMT+1', 'GMT-5', 'GMT-8', 'GMT+3',
 'GMT+5', 'GMT+10', 'GMT+12', 'GMT+6', 'GMT-6', 'GMT+2', 'GMT+8', 'GMT+0', 'GMT-7',
 'GMT-4', 'GMT+7', 'GMT+9', 'GMT-2', 'GMT-3', 'GMT+4', 'GMT+0', 'GMT+12', 'GMT-7',
 'GMT-6', 'GMT-3', 'GMT-1', 'GMT-10', 'GMT-4', 'GMT-2', None, None]
for rough_tz, answer_tz  in zip(rough_timezones, expected_timezones):
    processed_tz = normalize_gmt(rough_tz)
    assert processed_offset==answer
    # print(rough_tz, processed_tz, answer_tz, processed_tz==answer_tz)


# In[851]:


# confirming Timezones are cleaned correctly
before = 'Timezone'
after = 'Timezone_cleaned'

df['Timezone_cleaned'] = df['Timezone'].map(normalize_gmt)

changed_mask = (df[before] != df[after])
df.loc[changed_mask, [before, after]].value_counts()


# In[852]:


# create a numerical column for easier filtering in the future
# prefer expand=False to get a Series; coerce non-numeric to NaN, then use nullable Int64
df['GMT_Offset'] = pd.to_numeric(
    df['Timezone_cleaned'].str.extract(r"GMT\s*([+-]?\d+)", expand=False),
    errors='coerce'
).astype('Int64')

before = 'Timezone_cleaned'
after = 'GMT_Offset'
changed_mask = (df[before] != df[after])
df.loc[changed_mask, [before, after]].drop_duplicates()


# # Investigating `Country_Code` and `Country_name`

# In[853]:


# Finding miss matches between `Country_Code` to `Country_name`
df_filtered = df[['Country_Code', 'Country_name']].drop_duplicates().groupby('Country_Code').filter(func=lambda x: len(x) > 1, dropna=True)

df_filtered.sort_values('Country_Code')


# In[854]:


# Finding miss matches between `Country_Code` to `Country_name`
# Find `Country_Code` mapping to NOT ONLY None values but multiple `Country_name`
empty_country_name_filter = df['Country_name'].isnull()
df_filtered = df[empty_country_name_filter != True]
df_filtered = df_filtered[['Country_Code', 'Country_name']].drop_duplicates().groupby('Country_Code').filter(func=lambda x: len(x) > 1, dropna=True)

df_filtered.sort_values('Country_Code')


# # Cleaning `Country_Code` and `Country_name`
# The previous 2 cells demonstrate that `Country_Code` not only maps to `None` values but also incorrect values. Earlier when we removed empty string values from all of the data, it showed that the `Country_Code` column was 99% complete. I think it's reasonable to assume it's validity over the `Country_name` column entirely and remake `Country_name` column using `Country_Code`.

# In[855]:


import country_converter as coco
cc = coco.CountryConverter()


# In[856]:


# coerce country Codes to acceptable names

# NOTE: null/None `Country_Code` are set to the STRING 'None' and require cleaning later
df['Country_Name_cleaned'] = cc.convert(
    df['Country_Code'],
    to='name_short',
    not_found=None
)


# In[857]:


df['Country_Code'].unique()


# In[858]:


No_Code = df['Country_Code']==None
PH_filter = df['Country_Code']=='Philippines (PH)'
UT_filter = df['Country_Code']=='UT'
country_filter = PH_filter | UT_filter | No_Code
print(df[country_filter][['Country_Code', 'Country_name', 'Country_Name_cleaned']])


# In[859]:


# errors in 'Country_name' and 'Country_Name_cleaned' are so few now, we can clean them manually
df['Country_Code_cleaned'] = df['Country_Code'].replace({'Philippines (PH)':'PH', 'UT': None})
df['Country_Name_cleaned'] = df['Country_Name_cleaned'].replace({'UT': None, 'None': None})

No_Code = df['Country_Code']==None
No_Code = df['Country_Name_cleaned']==None
PH_filter = df['Country_Code']=='Philippines (PH)'
UT_filter = df['Country_Code']=='UT'
country_filter = PH_filter | UT_filter | No_Code

print(df[country_filter][['Country_Code', 'Country_name', 'Country_Code_cleaned', 'Country_Name_cleaned']])
print(df[df['Country_Code_cleaned'].isnull()][['Country_Code', 'Country_name', 'Country_Code_cleaned', 'Country_Name_cleaned']])


# In[860]:


before = 'Country_name'
after = 'Country_Name_cleaned'

changed_mask = (df[before] != df[after]) & ~(df[before].isna() & df[after].isna())
df.loc[changed_mask, ['Country_Code_cleaned', before, after]].drop_duplicates()


# In[861]:


# Confirming `Role_Type` is just a subrole of `Voyage_Role`
df_grouped = df.groupby(['Voyage_Role', 'Role_Type'], dropna=False).size()
print(df_grouped)


# # Understanding `Role_Type` and Consolidating with `Voyage_Role`
# I'm unsure why this is the case and requires investigation in the future. For now they will be simpley marked as `Developer` under their `Role`.

# In[862]:


# combine `Role_Type` & `Voyage_Role` into `Role`

# df['Role_agg'] = df[['Role_Type', 'Voyage_Role']].agg(lambda x: ' '.join(x.dropna()), axis='columns') # Alternate code to do this 
df['Role'] = df['Role_Type'].str.cat(df['Voyage_Role'], sep=' ', na_rep='').str.strip()
df['Role'] = df['Role'].replace(to_replace='', value=None)
df['Role'].value_counts(dropna=False)


# In[863]:


# add a simple enumerated id column for database purposes (fast indexing of a primary key)
df['id'] = range(1, len(df) + 1)
df.head()


# # Investigating `Voyage_from_Voyage_Signups`

# In[864]:


df["Voyage_from_Voyage_Signups"].unique()


# In[865]:


df["Voyage_Signup_ids"] = df["Voyage_from_Voyage_Signups"].str.split(",")

signup_exploded_df = df.explode("Voyage_Signup_ids")
signup_exploded_df["Voyage_Signup_ids"].value_counts(dropna=False)


# # Cleaning Voyage Signup ids
# 

# In[866]:


# extract numerical voyage values from `Voyage_from_Voyage_Signups` and create a list of Voyage_Signup_ids
ex = df['Voyage_from_Voyage_Signups'].astype(str).str.extractall(r"V(\d+)")
ex = ex.rename(columns={0: 'voyage_num'}).reset_index()
ex['voyage_num'] = ex['voyage_num'].astype(int)

groups = ex.groupby('level_0')['voyage_num'].apply(list)
df['Voyage_Signup_ids'] = df.index.map(lambda i: groups[i] if i in groups else [])

# verify results
df[['Voyage_from_Voyage_Signups', 'Voyage_Signup_ids']].drop_duplicates(subset=['Voyage_from_Voyage_Signups'], keep='first')


# # Investigating `Voyage_Tier`

# In[867]:


df["Voyage_Tier"].unique()


# In[868]:


# separating the comma separated list
df["Voyage_Signup_split"] = df["Voyage_Tier"].apply(
    lambda x: [] if pd.isna(x) else x.split(",")
)

signup_exploded_df = df.explode("Voyage_Signup_split")
signup_exploded_df["Voyage_Signup_split"].value_counts(dropna=False)


# # rational for NOT cleaning `Voyage_Tier`
# It is unclear why the voyage tier for some chingu members is set to `Bears`, `Geckos` or `Toucans` but it's clearly intentional and part of the data. I'll be separating it into lists to match `Voyage_Signup_id` but leaving the core of the data as is.

# In[869]:


# verify results
unique_voyage_tier_lists = df[['Voyage_Tier', 'Voyage_Signup_split']].drop_duplicates(subset='Voyage_Tier')
unique_voyage_tier_lists.sort_values('Voyage_Tier').reset_index(drop=True)


# # Choose & Name Output Columns

# In[ ]:


df.info()


# In[877]:


# drop old or irrelevant columns

# old dirty columns
dirty = [
    'Timestamp',
    'Timezone',
    'Country_name',
    'Role_Type',
    'Voyage_Role',
    'Country_Code',
    'Voyage_Tier',
    'Voyage_from_Voyage_Signups',
    'Solo_Project_Tier'
]

cleaned_df = df.drop(columns=dirty)


# In[878]:


# give columns their final names
final_name_map = {
    'Timestamp_cleaned': 'Timestamp',
    'Timezone_cleaned': 'Timezone',
    'Country_Name_cleaned': 'Country_Name',
    'Country_Code_cleaned': 'Country_Code',
    'Voyage_Signup_split': 'Voyage_Tiers',
    'Solo_Project_Tier_cleaned': 'Solo_Project_Tier'
}
renamed_cleaned_df = cleaned_df.rename(columns=final_name_map)


# In[879]:


# count duplicated rows
array_cols = ['Voyage_Signup_ids', 'Voyage_Tiers']
print(renamed_cleaned_df.loc[:, ~renamed_cleaned_df.columns.isin(array_cols)].duplicated().sum())


# In[880]:


renamed_cleaned_df.info()


# In[881]:


renamed_cleaned_df.to_json("data/chingu_members_cleaned.json", orient="records", lines=True, date_format="iso")

