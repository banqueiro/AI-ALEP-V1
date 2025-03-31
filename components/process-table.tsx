"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Edit, CheckCircle, AlertTriangle } from "lucide-react"
import { ProcessForm } from "@/components/process-form"
import { ProcessDetails } from "@/components/process-details"
import type { Process } from "@/types/process"
import { formatDate, getDaysElapsed } from "@/lib/utils"

interface ProcessTableProps {
  processes: Process[]
}

export function ProcessTable({ processes }: ProcessTableProps) {
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)

  const getStatusBadge = (process: Process) => {
    if (process.exitDate) {
      return <Badge className="bg-green-500">Concluído</Badge>
    }

    const daysElapsed = getDaysElapsed(process.arrivalDate)
    if (daysElapsed > 45) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          <span>Crítico</span>
        </Badge>
      )
    } else if (daysElapsed > 30) {
      return (
        <Badge variant="destructive" className="bg-orange-500">
          Atrasado
        </Badge>
      )
    } else {
      return <Badge variant="outline">Em Andamento</Badge>
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
              <TableHead>Dias</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Nenhum processo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              processes.map((process) => (
                <TableRow key={process.id} className={getDaysElapsed(process.arrivalDate) > 45 ? "bg-red-50" : ""}>
                  <TableCell className="font-medium">{process.sei}</TableCell>
                  <TableCell>{process.name}</TableCell>
                  <TableCell>{getResponsibleCell(process.responsible)}</TableCell>
                  <TableCell>{process.type}</TableCell>
                  <TableCell>{process.modal}</TableCell>
                  <TableCell>{formatDate(process.arrivalDate)}</TableCell>
                  <TableCell className={getDaysElapsed(process.arrivalDate) > 30 ? "font-bold text-red-600" : ""}>
                    {getDaysElapsed(process.arrivalDate)}
                  </TableCell>
                  <TableCell>{getStatusBadge(process)}</TableCell>
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
                            setSelectedProcess(process)
                            setIsEditOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar Processo
                        </DropdownMenuItem>
                        {!process.exitDate && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProcess(process)
                              setIsCompleteOpen(true)
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar como Concluído
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Processo</DialogTitle>
          </DialogHeader>
          {selectedProcess && <ProcessDetails process={selectedProcess} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Processo</DialogTitle>
          </DialogHeader>
          {selectedProcess && <ProcessForm process={selectedProcess} onSuccess={() => setIsEditOpen(false)} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Concluir Processo</DialogTitle>
          </DialogHeader>
          {selectedProcess && (
            <ProcessForm
              process={{ ...selectedProcess, exitDate: new Date().toISOString() }}
              onSuccess={() => setIsCompleteOpen(false)}
              completeMode
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

