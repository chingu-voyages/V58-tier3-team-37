import {
  Field,
  Fieldset,
  Input,
  Label,
  Legend,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  countries,
  countryNameMap,
  genders,
  roles,
  soloProjectTiers,
  voyageTiers,
} from "../constants/filterOptions";
import {
  useCountryCode,
  useFilterActions,
  useGender,
  useRole,
  useSoloProjectTier,
  useVoyageTier,
  useYearJoined,
} from "../stores/filterStore";
import cn from "../utils/cn";

export default function SearchForm() {
  const gender = useGender();
  const countryCode = useCountryCode();
  const yearJoined = useYearJoined();
  const role = useRole();
  const soloProjectTier = useSoloProjectTier();
  const voyageTier = useVoyageTier();
  const {
    setGender,
    setCountryCode,
    setYearJoined,
    setRole,
    setSoloProjectTier,
    setVoyageTier,
    resetFilters,
  } = useFilterActions();

  useEffect(() => {
    if (!gender) {
      setGender(genders[0]);
    }

    if (!countryCode) {
      setCountryCode("");
    }

    if (!yearJoined) {
      setYearJoined("");
    }

    if (!role) {
      setRole(roles[0]);
    }

    if (!soloProjectTier) {
      setSoloProjectTier(soloProjectTiers[0]);
    }

    if (!voyageTier) {
      setVoyageTier(voyageTiers[0]);
    }
  }, [gender, yearJoined, role, soloProjectTier, voyageTier, countryCode]);

  const navigate = useNavigate();

  const location = useLocation();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const redirect = location.state?.redirectedFrom;
    if (redirect && redirect === "/map") {
      navigate("/map");
    } else {
      navigate("/list");
    }
  };

  return (
    <div className="flex justify-center p-4">
      <form onSubmit={(e) => onSubmit(e)} className="w-full max-w-2xl">
        <Fieldset className="space-y-4">
          <Legend className="m-0 flex justify-center text-xl font-bold">
            Find Members
          </Legend>
          <div className="divider divider-white m-0 mb-7" />
          <Field className="flex flex-col gap-2">
            <Label className="block">Gender</Label>
            <Listbox value={gender} onChange={setGender}>
              <ListboxButton
                className={cn(
                  "relative block w-full rounded-lg bg-white/5 py-1.5 pr-8 pl-3 text-left text-sm/6 text-white",
                  "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25",
                )}
              >
                {gender === "" ? "All" : gender}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </ListboxButton>
              <ListboxOptions
                anchor="bottom"
                transition
                className={cn(
                  "bg-background-brand w-(--button-width) rounded-xl border border-white/20 p-1 [--anchor-gap:--spacing(1)] focus:outline-none",
                  "transition duration-100 ease-in data-leave:data-closed:opacity-0",
                )}
              >
                {genders.map((gender) => (
                  <ListboxOption
                    key={gender}
                    value={gender}
                    className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-white/10"
                  >
                    <div className="text-sm/6 text-white">
                      {gender === "" ? "All" : gender}
                    </div>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
          </Field>
          <Field className="flex flex-col gap-2">
            <Label className="block">Country</Label>
            <Listbox value={countryCode} onChange={setCountryCode}>
              <ListboxButton
                className={cn(
                  "relative block w-full rounded-lg bg-white/5 py-1.5 pr-8 pl-3 text-left text-sm/6 text-white",
                  "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25",
                )}
              >
                {countryCode === "" ? "All" : countryNameMap[countryCode]}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </ListboxButton>
              <ListboxOptions
                anchor="bottom"
                transition
                className={cn(
                  "bg-background-brand w-(--button-width) rounded-xl border border-white/20 p-1 [--anchor-gap:--spacing(1)] focus:outline-none",
                  "transition duration-100 ease-in data-leave:data-closed:opacity-0",
                )}
              >
                {countries.map((country) => (
                  <ListboxOption
                    key={country.code}
                    value={country.code}
                    className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-white/10"
                  >
                    <div className="text-sm/6 text-white">
                      {country.code === ""
                        ? "All"
                        : countryNameMap[country.code]}
                    </div>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
          </Field>
          <Field className="flex flex-col gap-2">
            <Label className="block">Year Joined</Label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={yearJoined ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "") {
                  setYearJoined("");
                  return;
                }
                if (/^[0-9]*$/.test(value)) {
                  setYearJoined(value);
                }
              }}
              className={cn(
                "mt-3 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white",
                "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25",
              )}
            />
          </Field>
          <Field className="flex flex-col gap-2">
            <Label className="block">Role</Label>
            <Listbox value={role} onChange={setRole}>
              <ListboxButton
                className={cn(
                  "relative block w-full rounded-lg bg-white/5 py-1.5 pr-8 pl-3 text-left text-sm/6 text-white",
                  "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25",
                )}
              >
                {role === "" ? "All" : role}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </ListboxButton>
              <ListboxOptions
                anchor="bottom"
                transition
                className={cn(
                  "bg-background-brand w-(--button-width) rounded-xl border border-white/20 p-1 [--anchor-gap:--spacing(1)] focus:outline-none",
                  "transition duration-100 ease-in data-leave:data-closed:opacity-0",
                )}
              >
                {roles.map((role) => (
                  <ListboxOption
                    key={role}
                    value={role}
                    className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-white/10"
                  >
                    <div className="text-sm/6 text-white">
                      {role === "" ? "All" : role}
                    </div>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
          </Field>
          <Field className="flex flex-col gap-2">
            <Label className="block">Solo Project Tier</Label>
            <Listbox value={soloProjectTier} onChange={setSoloProjectTier}>
              <ListboxButton
                className={cn(
                  "relative block w-full rounded-lg bg-white/5 py-1.5 pr-8 pl-3 text-left text-sm/6 text-white",
                  "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25",
                )}
              >
                {soloProjectTier === null ? "All" : soloProjectTier}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </ListboxButton>
              <ListboxOptions
                anchor="bottom"
                transition
                className={cn(
                  "bg-background-brand w-(--button-width) rounded-xl border border-white/20 p-1 [--anchor-gap:--spacing(1)] focus:outline-none",
                  "transition duration-100 ease-in data-leave:data-closed:opacity-0",
                )}
              >
                {soloProjectTiers.map((soloProjectTier) => (
                  <ListboxOption
                    key={soloProjectTier}
                    value={soloProjectTier}
                    className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-white/10"
                  >
                    <div className="text-sm/6 text-white">
                      {soloProjectTier === null ? "All" : soloProjectTier}
                    </div>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
          </Field>
          <Field className="flex flex-col gap-2">
            <Label className="block">Voyage Tier</Label>
            <Listbox value={voyageTier} onChange={setVoyageTier}>
              <ListboxButton
                className={cn(
                  "relative block w-full rounded-lg bg-white/5 py-1.5 pr-8 pl-3 text-left text-sm/6 text-white",
                  "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25",
                )}
              >
                {voyageTier === "" ? "All" : voyageTier}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </ListboxButton>
              <ListboxOptions
                anchor="bottom"
                transition
                className={cn(
                  "bg-background-brand w-(--button-width) rounded-xl border border-white/20 p-1 [--anchor-gap:--spacing(1)] focus:outline-none",
                  "transition duration-100 ease-in data-leave:data-closed:opacity-0",
                )}
              >
                {voyageTiers.map((voyageTier) => (
                  <ListboxOption
                    key={voyageTier}
                    value={voyageTier}
                    className="group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none data-focus:bg-white/10"
                  >
                    <div className="text-sm/6 text-white">
                      {voyageTier === "" ? "All" : voyageTier}
                    </div>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
          </Field>
        </Fieldset>
        <div className="text-background-brand mt-10 flex justify-between space-y-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              resetFilters();
            }}
            className="btn bg-primary-brand text-background-brand from-primary-brand to-primary-gradient w-32 hover:bg-linear-to-b"
          >
            Clear Filters
          </button>
          <button className="btn bg-primary-brand text-background-brand from-primary-brand to-primary-gradient w-32 hover:bg-linear-to-b">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
