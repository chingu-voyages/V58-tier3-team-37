export default function buildFilters(
  gender: string,
  countryName: string,
  role: string,
  soloProjectTier: string,
) {
  const filters: Record<string, any> = {};

  if (gender.trim() !== "") {
    filters.Gender = [gender.toUpperCase()];
  }

  if (countryName.trim() !== "") {
    filters.Country_name_from_Country = [countryName];
  }

  if (role.trim() !== "") {
    const lowered = role.toLowerCase();

    filters.Role = [lowered.includes("developer") ? "Developer" : role];

    const roleType = lowered.includes("web")
      ? "Web"
      : lowered.includes("python")
        ? "Python"
        : "";

    if (roleType !== "") {
      filters.Role_Type = [roleType];
    }
  }

  if (soloProjectTier.trim() !== "") {
    const tierText = soloProjectTier.includes("1")
      ? "Tier 1 - HTML - Basic Javascript - Basic Algorithms (LANDING PAGES)"
      : soloProjectTier.includes("2")
        ? "Tier 2  - Intermediate Algorithms - Front-end Projects (FRONT-END)"
        : soloProjectTier.includes("3")
          ? "Tier 3 - Advanced Projects - Apps having both Front-end and Back-end components (FULL STACK)"
          : "";

    if (tierText !== "") {
      filters.Solo_Project_Tier = [tierText];
    }
  }

  return filters;
}
