"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Process } from "@/types/process"
import type { Bidding } from "@/types/bidding"
import { ClipboardList, CheckCircle, AlertTriangle, Clock, Users, Calendar, FileText } from "lucide-react"

interface ProcessStatsProps {
  processes: Process[]
  biddings: Bidding[]
  completed: Process[]
}

export function ProcessStats({ processes, biddings, completed }: ProcessStatsProps) {
  const totalProcesses = processes.length
  const totalBiddings = biddings.length
  const totalCompleted = completed.length

  const pendingProcesses = processes.filter((p) => !p.exitDate).length

  const delayedProcesses = processes.filter((p) => {
    if (p.exitDate) return false
    const today = new Date()
    const arrivalDate = new Date(p.arrivalDate)
    const daysElapsed = Math.floor((today.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysElapsed > 30
  }).length

  const criticalProcesses = processes.filter((p) => {
    if (p.exitDate) return false
    const today = new Date()
    const arrivalDate = new Date(p.arrivalDate)
    const daysElapsed = Math.floor((today.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysElapsed > 45
  }).length

  // Processos adicionados nos últimos 30 dias
  const recentProcesses = [...processes, ...completed].filter((p) => {
    const today = new Date()
    const arrivalDate = new Date(p.arrivalDate)
    const daysElapsed = Math.floor((today.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysElapsed <= 30
  }).length

  // Processos concluídos nos últimos 30 dias
  const recentlyCompleted = completed.filter((p) => {
    if (!p.exitDate) return false
    const today = new Date()
    const exitDate = new Date(p.exitDate)
    const daysElapsed = Math.floor((today.getTime() - exitDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysElapsed <= 30
  }).length

  // Get unique responsible people
  const responsiblePeople = [
    ...new Set(
      [
        ...processes.map((p) => p.responsible),
        ...biddings.map((b) => b.preparation?.split(" ")[0]), // Pega apenas o nome, sem o número
        ...biddings.map((b) => b.review?.split(" ")[0]),
        ...biddings.map((b) => b.system?.split(" ")[0]),
      ].filter(Boolean),
    ),
  ].length

  // Calcular tempo médio de conclusão
  const avgCompletionTime =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, p) => {
            if (!p.exitDate) return sum
            const start = new Date(p.arrivalDate)
            const end = new Date(p.exitDate)
            return sum + Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
          }, 0) / completed.length,
        )
      : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Processos</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProcesses + totalBiddings}</div>
          <p className="text-xs text-muted-foreground">
            {pendingProcesses} pendentes, {totalCompleted} concluídos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pregões</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBiddings}</div>
          <p className="text-xs text-muted-foreground">
            {biddings.filter((b) => b.status?.toLowerCase().includes("autorizado")).length} autorizados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{delayedProcesses}</div>
          <p className="text-xs text-muted-foreground">
            {pendingProcesses > 0
              ? `${((delayedProcesses / pendingProcesses) * 100).toFixed(1)}% dos processos pendentes`
              : "0% dos processos pendentes"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Críticos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{criticalProcesses}</div>
          <p className="text-xs text-muted-foreground">Processos com mais de 45 dias</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Responsáveis</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{responsiblePeople}</div>
          <p className="text-xs text-muted-foreground">Membros da equipe ativos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgCompletionTime} dias</div>
          <p className="text-xs text-muted-foreground">Tempo médio de conclusão</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Novos (30 dias)</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentProcesses}</div>
          <p className="text-xs text-muted-foreground">Processos adicionados recentemente</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Concluídos (30 dias)</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentlyCompleted}</div>
          <p className="text-xs text-muted-foreground">Processos finalizados recentemente</p>
        </CardContent>
      </Card>
    </div>
  )
}

