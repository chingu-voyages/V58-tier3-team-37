import { create } from "zustand";

interface FilterActions {
  setCountryCode: (countryCode: string) => void;
  setGender: (gender: string) => void;
  setRole: (role: string) => void;
  setSoloProjectTier: (soloProjectTier: number | null) => void;
  setVoyage: (voyage: string) => void;
  setVoyageTier: (voyageTier: string) => void;
  setYearJoined: (yearJoined: string) => void;
  resetFilters: () => void;
}

type FilterState = {
  countryCode: string;
  gender: string;
  role: string;
  soloProjectTier: number | null;
  voyage: string;
  voyageTier: string;
  yearJoined: string;
  actions: FilterActions;
};

const useFilterStore = create<FilterState>((set) => ({
  countryCode: "",
  gender: "",
  role: "",
  soloProjectTier: null,
  voyage: "",
  voyageTier: "",
  yearJoined: "",
  actions: {
    setCountryCode: (countryCode: string) => set({ countryCode }),
    setGender: (gender: string) => set({ gender }),
    setRole: (role: string) => set({ role }),
    setSoloProjectTier: (soloProjectTier: number | null) =>
      set({ soloProjectTier }),
    setVoyage: (voyage: string) => set({ voyage }),
    setVoyageTier: (voyageTier: string) => set({ voyageTier }),
    setYearJoined: (yearJoined: string) => set({ yearJoined }),
    resetFilters: () =>
      set({
        countryCode: "",
        gender: "",
        role: "",
        soloProjectTier: null,
        voyage: "",
        voyageTier: "",
        yearJoined: "",
      }),
  },
}));

export const useFilterActions = () => useFilterStore((state) => state.actions);

export const useCountryCode = () =>
  useFilterStore((state) => state.countryCode);

export const useGender = () => useFilterStore((state) => state.gender);

export const useRole = () => useFilterStore((state) => state.role);

export const useSoloProjectTier = () =>
  useFilterStore((state) => state.soloProjectTier);

export const useVoyage = () => useFilterStore((state) => state.voyage);

export const useVoyageTier = () => useFilterStore((state) => state.voyageTier);

export const useYearJoined = () => useFilterStore((state) => state.yearJoined);

export const useHasFilters = () => {
  const { gender, role, soloProjectTier, voyage, voyageTier, yearJoined } =
    useFilterStore((state) => state);

  const hasFilters = [
    gender,
    role,
    soloProjectTier,
    voyage,
    voyageTier,
    yearJoined,
  ].some((value) => value != null && value !== "");

  return hasFilters;
};

export default useFilterStore;
