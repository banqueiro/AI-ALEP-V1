"use client"

import type { Process } from "@/types/process"
import type { Bidding } from "@/types/bidding"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ResponsibleStatsProps {
  processes: Process[]
  biddings: Bidding[]
}

export function ResponsibleStats({ processes, biddings }: ResponsibleStatsProps) {
  // Contagem de processos por responsável
  const responsibleCounts = processes.reduce(
    (acc, process) => {
      const responsible = process.responsible
      acc[responsible] = (acc[responsible] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Contagem de processos atrasados por responsável
  const delayedByResponsible = processes.reduce(
    (acc, process) => {
      if (process.exitDate) return acc

      const daysElapsed = Math.floor(
        (new Date().getTime() - new Date(process.arrivalDate).getTime()) / (1000 * 60 * 60 * 24),
      )
      if (daysElapsed > 30) {
        const responsible = process.responsible
        acc[responsible] = (acc[responsible] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  // Contagem de pregões por responsável (elaboração)
  const biddingsByResponsible = biddings.reduce(
    (acc, bidding) => {
      if (bidding.preparation) {
        const responsible = bidding.preparation.split(" ")[0] // Pega apenas o nome, sem o número
        acc[responsible] = (acc[responsible] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  // Combinar dados para a tabela
  const responsibleData = Object.keys({
    ...responsibleCounts,
    ...delayedByResponsible,
    ...biddingsByResponsible,
  }).map((responsible) => ({
    name: responsible,
    total: responsibleCounts[responsible] || 0,
    delayed: delayedByResponsible[responsible] || 0,
    biddings: biddingsByResponsible[responsible] || 0,
  }))

  // Ordenar por total de processos (decrescente)
  responsibleData.sort((a, b) => b.total - a.total)

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Carga de Trabalho por Responsável</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Responsável</TableHead>
              <TableHead className="text-center">Processos</TableHead>
              <TableHead className="text-center">Atrasados</TableHead>
              <TableHead className="text-center">Pregões</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responsibleData.map((item) => (
              <TableRow key={item.name}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-center">{item.total}</TableCell>
                <TableCell className="text-center">{item.delayed}</TableCell>
                <TableCell className="text-center">{item.biddings}</TableCell>
                <TableCell className="text-center">
                  {item.delayed > 3 ? (
                    <Badge variant="destructive">Sobrecarregado</Badge>
                  ) : item.delayed > 0 ? (
                    <Badge variant="destructive" className="bg-orange-500">
                      Atenção
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-100">
                      Normal
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

