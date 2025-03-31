"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Bidding } from "@/types/bidding"
import { sampleBiddings } from "@/data/sample-biddings"

interface BiddingStore {
  biddings: Bidding[]
  fetchBiddings: () => Promise<void>
  addBidding: (bidding: Bidding) => Promise<void>
  updateBidding: (bidding: Bidding) => Promise<void>
  deleteBidding: (id: string) => Promise<void>
  setBiddings: (biddings: Bidding[]) => void
}

export const useBiddingStore = create<BiddingStore>()(
  persist(
    (set) => ({
      biddings: [],
      fetchBiddings: async () => {
        // Em uma aplicação real, isso buscaria de uma API
        // Para fins de demonstração, usaremos dados de exemplo
        set({ biddings: sampleBiddings })
      },
      addBidding: async (bidding) => {
        set((state) => ({
          biddings: [...state.biddings, bidding],
        }))
      },
      updateBidding: async (updatedBidding) => {
        set((state) => ({
          biddings: state.biddings.map((bidding) => (bidding.id === updatedBidding.id ? updatedBidding : bidding)),
        }))
      },
      deleteBidding: async (id) => {
        set((state) => ({
          biddings: state.biddings.filter((bidding) => bidding.id !== id),
        }))
      },
      setBiddings: (biddings) => {
        set({ biddings })
      },
    }),
    {
      name: "bidding-storage",
    },
  ),
)

