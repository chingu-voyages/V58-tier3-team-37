import { create } from "zustand";
import { getAllMembers } from "../services/membersService";
import type { Member } from "../types/member";
import mapper from "../utils/mapper";

interface MembersActions {
  setMembers: (members: Member[]) => void;
  fetchMembers: (filters: {}) => Promise<void>;
  fetchAllMembers: (filters: {}) => Promise<void>;
  resetMembers: () => void;
  resetOffset: () => void;
}

type MembersState = {
  members: Member[];
  isLoading: boolean;
  actions: MembersActions;
  offset: number;
  limit: number;
};

const setLoading = (value: boolean) =>
  useMembersStore.setState({ isLoading: value });

const useMembersStore = create<MembersState>((set) => ({
  members: [],
  isLoading: false,
  actions: {
    setMembers: (members: Member[]) => set({ members }),
    fetchMembers: async (filters = {}) => {
      setLoading(true);
      try {
        const state = useMembersStore.getState();
        const result = await getAllMembers(state.offset, filters);
        const members: Member[] = result.map(mapper);
        set((state) => ({
          members: [...state.members, ...members],
          actions: state.actions,
          offset: state.offset + state.limit,
          limit: state.limit,
        }));
      } catch (error) {
        console.error("Failed to fetch members:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    fetchAllMembers: async (filters = {}) => {
      try {
        setLoading(true);
        const MAX_MEMBERS = 1000;
        let totalLoaded = 0;
        let hasMore = true;
        let batchCount = 0;
        const temp: Member[] = [];

        while (hasMore) {
          const state = useMembersStore.getState();
          const result = await getAllMembers(state.offset, filters);
          const newMembers = result.map(mapper);

          if (newMembers.length === 0) {
            hasMore = false;
            break;
          }

          totalLoaded += newMembers.length;
          temp.push(...newMembers);
          batchCount += 1;

          if (totalLoaded >= MAX_MEMBERS) {
            hasMore = false;
          }

          if (batchCount >= 3 || totalLoaded >= MAX_MEMBERS) {
            set((state) => ({
              members: [...state.members, ...temp],
              offset: state.offset + state.limit * batchCount,
            }));
            temp.length = 0;
            batchCount = 0;
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        }

        if (temp.length > 0) {
          set((state) => ({
            members: [...state.members, ...temp],
            offset: state.offset + temp.length,
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    resetMembers: () => set({ members: [] }),
    resetOffset: () => set({ offset: 0 }),
  },
  offset: 0,
  limit: 100,
}));

export const useMembersActions = () =>
  useMembersStore((state) => state.actions);

export const useMembers = () => useMembersStore((state) => state.members);

export const useIsLoading = () => useMembersStore((state) => state.isLoading);

export const useOffset = () => useMembersStore((state) => state.offset);
export const useLimit = () => useMembersStore((state) => state.limit);

export default useMembersStore;
