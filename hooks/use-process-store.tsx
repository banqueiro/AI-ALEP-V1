"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Process } from "@/types/process"
import { sampleProcesses } from "@/data/sample-processes"

interface ProcessStore {
  processes: Process[]
  fetchProcesses: () => Promise<void>
  addProcess: (process: Process) => Promise<void>
  updateProcess: (process: Process) => Promise<void>
  deleteProcess: (id: string) => Promise<void>
  setProcesses: (processes: Process[]) => void
}

export const useProcessStore = create<ProcessStore>()(
  persist(
    (set) => ({
      processes: [],
      fetchProcesses: async () => {
        // Em uma aplicação real, isso buscaria de uma API
        // Para fins de demonstração, usaremos dados de exemplo
        set({ processes: sampleProcesses })
      },
      addProcess: async (process) => {
        set((state) => ({
          processes: [...state.processes, process],
        }))
      },
      updateProcess: async (updatedProcess) => {
        set((state) => ({
          processes: state.processes.map((process) => (process.id === updatedProcess.id ? updatedProcess : process)),
        }))
      },
      deleteProcess: async (id) => {
        set((state) => ({
          processes: state.processes.filter((process) => process.id !== id),
        }))
      },
      setProcesses: (processes) => {
        set({ processes })
      },
    }),
    {
      name: "process-storage",
    },
  ),
)

