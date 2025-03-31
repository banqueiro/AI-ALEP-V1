"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface ProcessFiltersProps {
  filters: {
    name: string
    type: string
    status: string
    modal: string
    responsible: string
  }
  setFilters: React.Dispatch<
    React.SetStateAction<{
      name: string
      type: string
      status: string
      modal: string
      responsible: string
    }>
  >
  activeTab: string
}

export function ProcessFilters({ filters, setFilters, activeTab }: ProcessFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={activeTab === "pregoes" ? "Buscar por descrição..." : "Buscar por objeto..."}
          className="pl-8 w-full sm:w-[200px] md:w-[250px]"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por responsável..."
          className="pl-8 w-full sm:w-[200px] md:w-[250px]"
          value={filters.responsible}
          onChange={(e) => setFilters({ ...filters, responsible: e.target.value })}
        />
      </div>

      {activeTab !== "pregoes" && (
        <>
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters({ ...filters, type: value === "all" ? "" : value })}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Tipo de Processo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="1.CÁLCULO">1.CÁLCULO</SelectItem>
              <SelectItem value="2.COTAÇÃO">2.COTAÇÃO</SelectItem>
              <SelectItem value="3.AGENTE - FASE INTERNA">3.AGENTE - FASE INTERNA</SelectItem>
              <SelectItem value="4.PREGOEIRO">4.PREGOEIRO</SelectItem>
              <SelectItem value="5.PREGOEIRO - LICITADO">5.PREGOEIRO - LICITADO</SelectItem>
              <SelectItem value="6.TRAMITAÇÃO EXTERNA">6.TRAMITAÇÃO EXTERNA</SelectItem>
              <SelectItem value="7.AUTORIZADO">7.AUTORIZADO</SelectItem>
              <SelectItem value="8.PNCP">8.PNCP</SelectItem>
              <SelectItem value="X.AUTORIZADO">X.AUTORIZADO</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.modal}
            onValueChange={(value) => setFilters({ ...filters, modal: value === "all" ? "" : value })}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Modalidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Modalidades</SelectItem>
              <SelectItem value="ADITIVO">ADITIVO</SelectItem>
              <SelectItem value="DISP/INEX">DISP/INEX</SelectItem>
              <SelectItem value="LICITAR">LICITAR</SelectItem>
              <SelectItem value="OUT">OUT</SelectItem>
              <SelectItem value="CARONA">CARONA</SelectItem>
              <SelectItem value="ADM">ADM</SelectItem>
            </SelectContent>
          </Select>
        </>
      )}

      {activeTab === "ativos" && (
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? "" : value })}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="in-progress">Em Andamento</SelectItem>
            <SelectItem value="delayed">Atrasado</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  )
}

