export default function buildFilters(
  gender: string,
  countryCode: string,
  role: string,
  soloProjectTier: number | null,
) {
  const filters: Record<string, any> = {};

  if (gender.trim() !== "") {
    filters.Gender = [gender.toUpperCase()];
  }

  if (countryCode.trim() !== "") {
    filters.Country_Code = [countryCode];
  }

  if (role.trim() !== "") {
    filters.Role = [role];
  }

  if (soloProjectTier !== null) {
    filters.Solo_Project_Tier = [soloProjectTier];
  }

  return filters;
}
