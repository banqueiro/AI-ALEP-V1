"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProcessTable } from "@/components/process-table"
import { BiddingTable } from "@/components/bidding-table"
import { CompletedTable } from "@/components/completed-table"
import { ProcessStats } from "@/components/process-stats"
import { ProcessFilters } from "@/components/process-filters"
import { ProcessForm } from "@/components/process-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useProcesses } from "@/hooks/use-processes"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ProcessCharts } from "@/components/process-charts"
import { ResponsibleStats } from "@/components/responsible-stats"
import { CSVImporter } from "@/components/csv-importer"
import { ProcessInsights } from "@/components/process-insights"
import dynamic from "next/dynamic"

// Importar o AIAgent com carregamento dinâmico para evitar problemas de hidratação
const AIAgentWithNoSSR = dynamic(() => import("./ai-agent").then((mod) => mod.AIAgent), {
  ssr: false,
})

export function ProcessDashboard() {
  const { processes, biddings, completed, loading, error } = useProcesses()
  const [activeTab, setActiveTab] = useState("ativos")
  const [filters, setFilters] = useState({
    name: "",
    type: "",
    status: "",
    modal: "",
    responsible: "",
  })

  const filteredProcesses = processes.filter((process) => {
    const nameMatch = filters.name === "" || process.name.toLowerCase().includes(filters.name.toLowerCase())

    const typeMatch = filters.type === "" || process.type === filters.type

    const modalMatch = filters.modal === "" || process.modal === filters.modal

    const responsibleMatch =
      filters.responsible === "" || process.responsible.toLowerCase().includes(filters.responsible.toLowerCase())

    let statusMatch = true
    if (filters.status !== "") {
      const daysElapsed = Math.floor(
        (new Date().getTime() - new Date(process.arrivalDate).getTime()) / (1000 * 60 * 60 * 24),
      )

      if (filters.status === "completed") {
        statusMatch = process.exitDate !== null
      } else if (filters.status === "in-progress") {
        statusMatch = !process.exitDate && daysElapsed <= 30
      } else if (filters.status === "delayed") {
        statusMatch = !process.exitDate && daysElapsed > 30 && daysElapsed <= 45
      } else if (filters.status === "critical") {
        statusMatch = !process.exitDate && daysElapsed > 45
      }
    }

    return nameMatch && typeMatch && modalMatch && responsibleMatch && statusMatch
  })

  const filteredBiddings = biddings.filter((bidding) => {
    const nameMatch = filters.name === "" || bidding.description.toLowerCase().includes(filters.name.toLowerCase())

    const responsibleMatch =
      filters.responsible === "" ||
      (bidding.preparation && bidding.preparation.toLowerCase().includes(filters.responsible.toLowerCase())) ||
      (bidding.review && bidding.review.toLowerCase().includes(filters.responsible.toLowerCase())) ||
      (bidding.system && bidding.system.toLowerCase().includes(filters.responsible.toLowerCase()))

    return nameMatch && responsibleMatch
  })

  const filteredCompleted = completed.filter((process) => {
    const nameMatch = filters.name === "" || process.name.toLowerCase().includes(filters.name.toLowerCase())

    const typeMatch = filters.type === "" || process.type === filters.type

    const modalMatch = filters.modal === "" || process.modal === filters.modal

    const responsibleMatch =
      filters.responsible === "" || process.responsible.toLowerCase().includes(filters.responsible.toLowerCase())

    return nameMatch && typeMatch && modalMatch && responsibleMatch
  })

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando processos...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">Erro ao carregar processos: {error}</div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sistema de Gestão de Processos</h1>
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Processo
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Adicionar Novo Processo</SheetTitle>
              </SheetHeader>
              <ProcessForm onSuccess={() => {}} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <ProcessStats processes={processes} biddings={biddings} completed={completed} />
        </div>
        <div className="md:col-span-1">
          <CSVImporter />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProcessCharts processes={processes} biddings={biddings} completed={completed} />
        <AIAgentWithNoSSR />
      </div>

      <ProcessInsights processes={processes} biddings={biddings} completed={completed} />

      <ResponsibleStats processes={processes} biddings={biddings} />

      <Tabs defaultValue="ativos" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="ativos">Processos Ativos</TabsTrigger>
            <TabsTrigger value="pregoes">Pregões</TabsTrigger>
            <TabsTrigger value="finalizados">Finalizados</TabsTrigger>
          </TabsList>
          <ProcessFilters filters={filters} setFilters={setFilters} activeTab={activeTab} />
        </div>

        <TabsContent value="ativos" className="mt-0">
          <ProcessTable processes={filteredProcesses} />
        </TabsContent>

        <TabsContent value="pregoes" className="mt-0">
          <BiddingTable biddings={filteredBiddings} />
        </TabsContent>

        <TabsContent value="finalizados" className="mt-0">
          <CompletedTable processes={filteredCompleted} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

