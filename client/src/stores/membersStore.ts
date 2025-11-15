import { create } from "zustand";
import type { Member } from "../types/member";

interface MembersActions {
  setMembers: (members: Member[]) => void;
}

type MembersState = {
  members: Member[];
  actions: MembersActions;
};

const useMembersStore = create<MembersState>((set) => ({
  members: [],
  actions: {
    setMembers: (members: Member[]) => set({ members }),
  },
}));

export const useMembersActions = () =>
  useMembersStore((state) => state.actions);

export const useMembers = () => useMembersStore((state) => state.members);
