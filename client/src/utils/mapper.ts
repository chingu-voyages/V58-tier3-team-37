import type { Member } from "../types/member";

const mapper = (raw: any): Member => {
  return {
    email: raw.Email,
    timestamp: raw.Timestamp,
    gender: raw.Gender,
    countryCode: raw.Country_Code,
    goal: raw.Goal,
    goalOther: raw.Goal_Other,
    source: raw.Source,
    sourceOther: raw.Source_Other,
    countryName: raw.Country_name_from_Country,
    soloProjectTier: raw.Solo_Project_Tier,
    roleType: raw.Role_Type,
    role: raw.Role,
    voyage: raw.Voyage_from_Voyage_Signups,
    voyageTier: raw.Voyage_Tier,
  };
};

export default mapper;
