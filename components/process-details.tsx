"use client"

import type { Process } from "@/types/process"
import { formatDate, getDaysElapsed } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ProcessDetailsProps {
  process: Process
}

export function ProcessDetails({ process }: ProcessDetailsProps) {
  const getStatusBadge = () => {
    if (process.exitDate) {
      return <Badge className="bg-green-500">Concluído</Badge>
    }

    const daysElapsed = getDaysElapsed(process.arrivalDate)
    if (daysElapsed > 45) {
      return <Badge variant="destructive">Crítico</Badge>
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

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{process.name}</h3>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Número SEI</p>
          <p>{process.sei}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Responsável</p>
          <p>{process.responsible}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Tipo de Processo</p>
          <p>{process.type}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Modalidade</p>
          <p>{process.modal || "N/A"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Data de Chegada</p>
          <p>{formatDate(process.arrivalDate)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Dias Decorridos</p>
          <p>{getDaysElapsed(process.arrivalDate)}</p>
        </div>
      </div>

      {process.exitDate && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Data de Saída</p>
            <p>{formatDate(process.exitDate)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total de Dias</p>
            <p>{getDaysElapsed(process.arrivalDate, process.exitDate)}</p>
          </div>
        </div>
      )}

      {process.authorized && (
        <div>
          <p className="text-sm font-medium text-muted-foreground">Autorizado Por</p>
          <p>{process.authorized}</p>
        </div>
      )}

      {process.observations && (
        <>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Observações</p>
            <p className="whitespace-pre-line">{process.observations}</p>
          </div>
        </>
      )}
    </div>
  )
}

