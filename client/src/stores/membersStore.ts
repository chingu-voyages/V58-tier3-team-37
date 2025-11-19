import { create } from "zustand";
import { getAllMembers } from "../services/membersService";
import type { Member } from "../types/member";
import mapper from "../utils/mapper";

interface MembersActions {
  setMembers: (members: Member[]) => void;
  fetchMembers: () => Promise<void>;
}

type MembersState = {
  members: Member[];
  actions: MembersActions;
};

const useMembersStore = create<MembersState>((set) => ({
  members: [],
  actions: {
    setMembers: (members: Member[]) => set({ members }),
    fetchMembers: async () => {
      try {
        const result = await getAllMembers();
        const members: Member[] = result.map(mapper);
        set((state) => ({
          members,
          actions: state.actions,
        }));
      } catch (error) {
        console.error("Failed to fetch members:", error);
        throw error;
      }
    },
  },
}));

export const useMembersActions = () =>
  useMembersStore((state) => state.actions);

export const useMembers = () => useMembersStore((state) => state.members);

export default useMembersStore;
