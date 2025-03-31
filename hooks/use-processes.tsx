"use client"

import { useEffect, useState } from "react"
import type { Process } from "@/types/process"
import { useProcessStore } from "@/hooks/use-process-store"
import { useBiddingStore } from "@/hooks/use-bidding-store"

export function useProcesses() {
  const { processes, fetchProcesses } = useProcessStore()
  const { biddings, fetchBiddings } = useBiddingStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState<Process[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchProcesses(), fetchBiddings()])

        // Separate completed processes
        const completedProcesses = processes.filter((p) => p.exitDate !== null && p.exitDate !== undefined)
        setCompleted(completedProcesses)

        setLoading(false)
      } catch (err) {
        setError("Falha ao carregar dados")
        setLoading(false)
      }
    }

    loadData()
  }, [fetchProcesses, fetchBiddings, processes])

  return {
    processes: processes.filter((p) => !p.exitDate),
    biddings,
    completed,
    loading,
    error,
  }
}

