"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type CompareState = {
  productIds: string[];
  toggle: (id: string) => void;
  clear: () => void;
};

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (id) =>
        set((state) => {
          if (state.productIds.includes(id)) {
            return { productIds: state.productIds.filter((x) => x !== id) };
          }
          if (state.productIds.length >= 5) return state; // max 5
          return { productIds: [...state.productIds, id] };
        }),
      clear: () => set({ productIds: [] }),
    }),
    { name: "digistore-compare" }
  )
);
