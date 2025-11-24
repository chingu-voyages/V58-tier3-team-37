import { create } from "zustand";

interface FilterActions {
  setCountryName: (countryName: string) => void;
  setGender: (gender: string) => void;
  setRole: (role: string) => void;
  setSoloProjectTier: (soloProjectTier: string) => void;
  setVoyage: (voyage: string) => void;
  setVoyageTier: (voyageTier: string) => void;
  setYearJoined: (yearJoined: string) => void;
  resetFilters: () => void;
}

type FilterState = {
  countryName: string;
  gender: string;
  role: string;
  soloProjectTier: string;
  voyage: string;
  voyageTier: string;
  yearJoined: string;
  actions: FilterActions;
};

const useFilterStore = create<FilterState>((set) => ({
  countryName: "",
  gender: "",
  role: "",
  soloProjectTier: "",
  voyage: "",
  voyageTier: "",
  yearJoined: "",
  actions: {
    setCountryName: (countryName: string) => set({ countryName }),
    setGender: (gender: string) => set({ gender }),
    setRole: (role: string) => set({ role }),
    setSoloProjectTier: (soloProjectTier: string) => set({ soloProjectTier }),
    setVoyage: (voyage: string) => set({ voyage }),
    setVoyageTier: (voyageTier: string) => set({ voyageTier }),
    setYearJoined: (yearJoined: string) => set({ yearJoined }),
    resetFilters: () =>
      set({
        countryName: "",
        gender: "",
        role: "",
        soloProjectTier: "",
        voyage: "",
        voyageTier: "",
        yearJoined: "",
      }),
  },
}));

export const useFilterActions = () => useFilterStore((state) => state.actions);

export const useCountryName = () =>
  useFilterStore((state) => state.countryName);

export const useGender = () => useFilterStore((state) => state.gender);

export const useRole = () => useFilterStore((state) => state.role);

export const useSoloProjectTier = () =>
  useFilterStore((state) => state.soloProjectTier);

export const useVoyage = () => useFilterStore((state) => state.voyage);

export const useVoyageTier = () => useFilterStore((state) => state.voyageTier);

export const useYearJoined = () => useFilterStore((state) => state.yearJoined);

export const useHasFilters = () => {
  const {
    countryName,
    gender,
    role,
    soloProjectTier,
    voyage,
    voyageTier,
    yearJoined,
  } = useFilterStore((state) => state);

  const hasFilters = Object.values({
    countryName,
    gender,
    role,
    soloProjectTier,
    voyage,
    voyageTier,
    yearJoined,
  }).some((value) => value !== "");

  return hasFilters;
};

export default useFilterStore;
