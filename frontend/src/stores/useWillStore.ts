import { create } from "zustand";
import type { WillInfo, WillStatus } from "@/types";

interface WillState {
  willInfo: WillInfo | null;
  status: WillStatus;
  vaultSTT: string;
  loading: boolean;
  error: string | null;
  setWillInfo: (info: WillInfo | null) => void;
  setStatus: (status: WillStatus) => void;
  setVaultSTT: (amount: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useWillStore = create<WillState>((set) => ({
  willInfo: null,
  status: "Inactive",
  vaultSTT: "0",
  loading: false,
  error: null,
  setWillInfo: (info) => set({ willInfo: info }),
  setStatus: (status) => set({ status }),
  setVaultSTT: (amount) => set({ vaultSTT: amount }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      willInfo: null,
      status: "Inactive",
      vaultSTT: "0",
      loading: false,
      error: null,
    }),
}));
