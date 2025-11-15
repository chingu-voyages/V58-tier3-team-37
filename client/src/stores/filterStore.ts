import { create } from "zustand";

interface FilterActions {
  setGender: (gender: string) => void;
  setCountryCode: (countryCode: string) => void;
  setGoal: (goal: string) => void;
  setSource: (source: string) => void;
  setCountryName: (countryName: string) => void;
  setSoloProjectTier: (soloProjectTier: string) => void;
  setRole: (role: string) => void;
  setRoleType: (roleType: string) => void;
  resetFilters: () => void;
}

type FilterState = {
  gender: string;
  countryCode: string;
  goal: string;
  source: string;
  countryName: string;
  soloProjectTier: string;
  role: string;
  roleType: string;
  actions: FilterActions;
};

const useFilterStore = create<FilterState>((set) => ({
  gender: "",
  countryCode: "",
  goal: "",
  source: "",
  countryName: "",
  soloProjectTier: "",
  role: "",
  roleType: "",
  actions: {
    setGender: (gender: string) => set({ gender }),
    setCountryCode: (countryCode: string) => set({ countryCode }),
    setGoal: (goal: string) => set({ goal }),
    setSource: (source: string) => set({ source }),
    setCountryName: (countryName: string) => set({ countryName }),
    setSoloProjectTier: (soloProjectTier: string) => set({ soloProjectTier }),
    setRole: (role: string) => set({ role }),
    setRoleType: (roleType: string) => set({ roleType }),
    resetFilters: () =>
      set({
        gender: "",
        countryCode: "",
        goal: "",
        source: "",
        countryName: "",
        soloProjectTier: "",
        role: "",
        roleType: "",
      }),
  },
}));

export const useFilterActions = () => useFilterStore((state) => state.actions);

export const useGender = () => useFilterStore((state) => state.gender);
export const useCountryCode = () =>
  useFilterStore((state) => state.countryCode);
export const useGoal = () => useFilterStore((state) => state.goal);
export const useSource = () => useFilterStore((state) => state.source);
export const useCountryName = () =>
  useFilterStore((state) => state.countryName);
export const useSoloProjectTier = () =>
  useFilterStore((state) => state.soloProjectTier);
export const useRole = () => useFilterStore((state) => state.role);
export const useRoleType = () => useFilterStore((state) => state.roleType);
