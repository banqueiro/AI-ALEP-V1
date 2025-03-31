"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, CheckCircle, Search, ArrowRight, Loader2 } from "lucide-react"
import type { Process } from "@/types/process"
import type { Bidding } from "@/types/bidding"
import { getDaysElapsed } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProcessDetails } from "@/components/process-details"
import { BiddingDetails } from "@/components/bidding-details"

interface ProcessInsightsProps {
  processes: Process[]
  biddings: Bidding[]
  completed: Process[]
}

export function ProcessInsights({ processes, biddings, completed }: ProcessInsightsProps) {
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null)
  const [selectedBidding, setSelectedBidding] = useState<Bidding | null>(null)
  const [isProcessViewOpen, setIsProcessViewOpen] = useState(false)
  const [isBiddingViewOpen, setIsBiddingViewOpen] = useState(false)
  const [isClientSide, setIsClientSide] = useState(false)

  useEffect(() => {
    setIsClientSide(true)
  }, [])

  // Encontrar processos críticos (mais de 45 dias)
  const criticalProcesses = processes
    .filter((p) => {
      if (p.exitDate) return false
      const daysElapsed = getDaysElapsed(p.arrivalDate)
      return daysElapsed > 45
    })
    .sort((a, b) => getDaysElapsed(b.arrivalDate) - getDaysElapsed(a.arrivalDate))

  // Encontrar processos atrasados (30-45 dias)
  const delayedProcesses = processes
    .filter((p) => {
      if (p.exitDate) return false
      const daysElapsed = getDaysElapsed(p.arrivalDate)
      return daysElapsed > 30 && daysElapsed <= 45
    })
    .sort((a, b) => getDaysElapsed(b.arrivalDate) - getDaysElapsed(a.arrivalDate))

  // Encontrar pregões pendentes de autorização
  const pendingBiddings = biddings.filter((b) => !b.status || !b.status.toLowerCase().includes("autorizado"))

  // Encontrar processos recentemente concluídos (últimos 15 dias)
  const recentlyCompleted = completed
    .filter((p) => {
      if (!p.exitDate) return false
      const today = new Date()
      const exitDate = new Date(p.exitDate)
      const daysElapsed = Math.floor((today.getTime() - exitDate.getTime()) / (1000 * 60 * 60 * 24))
      return daysElapsed <= 15
    })
    .sort((a, b) => new Date(b.exitDate!).getTime() - new Date(a.exitDate!).getTime())

  if (!isClientSide) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </CardTitle>
              <CardDescription>
                <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 flex items-center justify-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Processos Críticos
            </CardTitle>
            <CardDescription>Processos com mais de 45 dias que requerem atenção imediata</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {criticalProcesses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Não há processos críticos no momento.</p>
            ) : (
              <ul className="space-y-2">
                {criticalProcesses.slice(0, 3).map((process) => (
                  <li key={process.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{process.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{process.sei}</span>
                        <span>•</span>
                        <span>{process.responsible}</span>
                      </div>
                    </div>
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{getDaysElapsed(process.arrivalDate)} dias</span>
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          {criticalProcesses.length > 0 && (
            <CardFooter>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSelectedProcess(criticalProcesses[0])
                  setIsProcessViewOpen(true)
                }}
              >
                Ver detalhes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Processos Atrasados
            </CardTitle>
            <CardDescription>Processos entre 30-45 dias que precisam de atenção</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {delayedProcesses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Não há processos atrasados no momento.</p>
            ) : (
              <ul className="space-y-2">
                {delayedProcesses.slice(0, 3).map((process) => (
                  <li key={process.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{process.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{process.sei}</span>
                        <span>•</span>
                        <span>{process.responsible}</span>
                      </div>
                    </div>
                    <Badge variant="destructive" className="bg-orange-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{getDaysElapsed(process.arrivalDate)} dias</span>
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          {delayedProcesses.length > 0 && (
            <CardFooter>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSelectedProcess(delayedProcesses[0])
                  setIsProcessViewOpen(true)
                }}
              >
                Ver detalhes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-500" />
              Pregões Pendentes
            </CardTitle>
            <CardDescription>Pregões que aguardam autorização ou conclusão</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {pendingBiddings.length === 0 ? (
              <p className="text-sm text-muted-foreground">Não há pregões pendentes no momento.</p>
            ) : (
              <ul className="space-y-2">
                {pendingBiddings.slice(0, 3).map((bidding) => (
                  <li key={bidding.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{bidding.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{bidding.sei}</span>
                        <span>•</span>
                        <span>{bidding.preparation || "Sem responsável"}</span>
                      </div>
                    </div>
                    <Badge variant="outline">Pendente</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          {pendingBiddings.length > 0 && (
            <CardFooter>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSelectedBidding(pendingBiddings[0])
                  setIsBiddingViewOpen(true)
                }}
              >
                Ver detalhes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Recentemente Concluídos
            </CardTitle>
            <CardDescription>Processos concluídos nos últimos 15 dias</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {recentlyCompleted.length === 0 ? (
              <p className="text-sm text-muted-foreground">Não há processos concluídos recentemente.</p>
            ) : (
              <ul className="space-y-2">
                {recentlyCompleted.slice(0, 3).map((process) => (
                  <li key={process.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{process.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{process.sei}</span>
                        <span>•</span>
                        <span>{process.responsible}</span>
                      </div>
                    </div>
                    <Badge className="bg-green-500 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>{getDaysElapsed(process.arrivalDate, process.exitDate!)} dias</span>
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          {recentlyCompleted.length > 0 && (
            <CardFooter>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSelectedProcess(recentlyCompleted[0])
                  setIsProcessViewOpen(true)
                }}
              >
                Ver detalhes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {isClientSide && (
        <>
          <Dialog open={isProcessViewOpen} onOpenChange={setIsProcessViewOpen}>
            <DialogContent className="sm:max-w-md md:max-w-lg">
              <DialogHeader>
                <DialogTitle>Detalhes do Processo</DialogTitle>
              </DialogHeader>
              {selectedProcess && <ProcessDetails process={selectedProcess} />}
            </DialogContent>
          </Dialog>

          <Dialog open={isBiddingViewOpen} onOpenChange={setIsBiddingViewOpen}>
            <DialogContent className="sm:max-w-md md:max-w-lg">
              <DialogHeader>
                <DialogTitle>Detalhes do Pregão</DialogTitle>
              </DialogHeader>
              {selectedBidding && <BiddingDetails bidding={selectedBidding} />}
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  )
}

