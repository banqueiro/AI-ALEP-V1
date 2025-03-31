"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, ArrowUpRight, Clock } from "lucide-react"
import { ProcessDetails } from "@/components/process-details"
import type { Process } from "@/types/process"
import { formatDate, getDaysElapsed } from "@/lib/utils"

interface CompletedTableProps {
  processes: Process[]
}

export function CompletedTable({ processes }: CompletedTableProps) {
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  const getCompletionTimeBadge = (arrivalDate: string, exitDate: string | null) => {
    if (!exitDate) return null

    const days = getDaysElapsed(arrivalDate, exitDate)

    if (days <= 15) {
      return (
        <Badge className="bg-green-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Rápido ({days} dias)</span>
        </Badge>
      )
    } else if (days <= 30) {
      return (
        <Badge className="bg-blue-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Normal ({days} dias)</span>
        </Badge>
      )
    } else if (days <= 60) {
      return (
        <Badge className="bg-orange-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Demorado ({days} dias)</span>
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Muito longo ({days} dias)</span>
        </Badge>
      )
    }
  }

  const getResponsibleCell = (responsible: string) => {
    // Destacar o responsável com cores diferentes
    const colors: Record<string, string> = {
      DIEGO: "bg-blue-100 text-blue-800",
      GUDRIAN: "bg-green-100 text-green-800",
      KOHL: "bg-purple-100 text-purple-800",
      THAYS: "bg-pink-100 text-pink-800",
      ALESSANDRA: "bg-yellow-100 text-yellow-800",
      ISABELA: "bg-indigo-100 text-indigo-800",
      JOELSON: "bg-red-100 text-red-800",
      KAREN: "bg-teal-100 text-teal-800",
      MICHELI: "bg-orange-100 text-orange-800",
      EDUARDO: "bg-cyan-100 text-cyan-800",
      EDUARDA: "bg-lime-100 text-lime-800",
    }

    const colorClass = colors[responsible] || "bg-gray-100 text-gray-800"

    return <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${colorClass}`}>{responsible}</div>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SEI</TableHead>
              <TableHead>Objeto</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Modalidade</TableHead>
              <TableHead>Data Chegada</TableHead>
              <TableHead>Data Saída</TableHead>
              <TableHead>Tempo de Conclusão</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Nenhum processo finalizado encontrado.
                </TableCell>
              </TableRow>
            ) : (
              processes.map((process) => {
                const completionDays = process.exitDate ? getDaysElapsed(process.arrivalDate, process.exitDate) : 0
                return (
                  <TableRow
                    key={process.id}
                    className={completionDays > 60 ? "bg-red-50" : completionDays <= 15 ? "bg-green-50" : ""}
                  >
                    <TableCell className="font-medium">{process.sei}</TableCell>
                    <TableCell>{process.name}</TableCell>
                    <TableCell>{getResponsibleCell(process.responsible)}</TableCell>
                    <TableCell>{process.type}</TableCell>
                    <TableCell>{process.modal}</TableCell>
                    <TableCell>{formatDate(process.arrivalDate)}</TableCell>
                    <TableCell>{process.exitDate ? formatDate(process.exitDate) : "—"}</TableCell>
                    <TableCell>
                      {process.exitDate ? getCompletionTimeBadge(process.arrivalDate, process.exitDate) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProcess(process)
                              setIsViewOpen(true)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              // Implementar lógica para reabrir processo
                            }}
                          >
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Reabrir Processo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Processo Finalizado</DialogTitle>
          </DialogHeader>
          {selectedProcess && <ProcessDetails process={selectedProcess} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

