import type { Member } from "../types/member";

const mapper = (raw: any): Member => {
  return {
    id: raw.id,
    countryCode: raw.Country_Code,
    countryName: raw.Country_Name,
    gender: raw.Gender,
    goal: raw.Goal,
    goalOther: raw.Goal_Other,
    role: raw.Role,
    soloProjectTier: raw.Solo_Project_Tier,
    source: raw.Source,
    sourceOther: raw.Source_Other,
    timestamp: raw.Timestamp,
    voyageSignupIds: raw.Voyage_Signup_ids,
    voyageTiers: raw.Voyage_Tiers,
  };
};

export default mapper;
