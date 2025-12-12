import { getName } from "country-list";
import getCountries from "../services/getCountries";

export const genders = [
  "",
  "Male",
  "Female",
  "Non-Binary",
  "Transgender",
  "Prefer Not To Say",
];

export const countries = await getCountries().then((codes: string[]) =>
  codes
    .filter((code) => code != null)
    .map((code) => ({
      code,
      name: getName(code) ?? "",
    }))
    .filter((item) => item.name !== "")
    .sort((a, b) => a.name.localeCompare(b.name)),
);

export const countryNameMap = Object.fromEntries(
  countries.map((item) => [item.code, item.name]),
);

export const roles = [
  "",
  "Data Scientist",
  "Product Owner",
  "Python Developer",
  "Scrum Master",
  "Web Developer",
  "UI/UX Designer",
];

export const soloProjectTiers = [null, 1, 2, 3];

export const voyageTiers = ["", "Tier 1", "Tier 2", "Tier 3"];
