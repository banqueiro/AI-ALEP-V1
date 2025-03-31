"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Edit, CheckCircle } from "lucide-react"
import { BiddingForm } from "@/components/bidding-form"
import { BiddingDetails } from "@/components/bidding-details"
import type { Bidding } from "@/types/bidding"

interface BiddingTableProps {
  biddings: Bidding[]
}

export function BiddingTable({ biddings }: BiddingTableProps) {
  const [selectedBidding, setSelectedBidding] = useState<Bidding | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Pendente</Badge>

    if (status.toLowerCase().includes("autorizado")) {
      return <Badge className="bg-green-500">Autorizado</Badge>
    } else {
      return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getResponsibleCell = (responsible: string | undefined) => {
    if (!responsible) return <span className="text-gray-400">-</span>

    // Extrair apenas o nome (sem o número)
    const name = responsible.split(" ")[0]

    // Destacar o responsável com cores diferentes
    const colors: Record<string, string> = {
      FERNANDA: "bg-blue-100 text-blue-800",
      JOELSON: "bg-green-100 text-green-800",
      MICHELI: "bg-purple-100 text-purple-800",
      KAREN: "bg-pink-100 text-pink-800",
      EDUARDA: "bg-yellow-100 text-yellow-800",
      GUDRIAN: "bg-indigo-100 text-indigo-800",
    }

    const colorClass = colors[name] || "bg-gray-100 text-gray-800"

    return <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${colorClass}`}>{responsible}</div>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SEQ</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>SEI Nº</TableHead>
              <TableHead>Elaboração</TableHead>
              <TableHead>Revisão</TableHead>
              <TableHead>Sistema</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {biddings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Nenhum pregão encontrado.
                </TableCell>
              </TableRow>
            ) : (
              biddings.map((bidding) => (
                <TableRow
                  key={bidding.id}
                  className={bidding.status?.toLowerCase().includes("autorizado") ? "bg-green-50" : ""}
                >
                  <TableCell className="font-medium">{bidding.seq}</TableCell>
                  <TableCell className="font-medium">{bidding.description}</TableCell>
                  <TableCell>{bidding.sei}</TableCell>
                  <TableCell>{getResponsibleCell(bidding.preparation)}</TableCell>
                  <TableCell>{getResponsibleCell(bidding.review)}</TableCell>
                  <TableCell>{getResponsibleCell(bidding.system)}</TableCell>
                  <TableCell>{getStatusBadge(bidding.status)}</TableCell>
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
                            setSelectedBidding(bidding)
                            setIsViewOpen(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedBidding(bidding)
                            setIsEditOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar Pregão
                        </DropdownMenuItem>
                        {!bidding.status?.toLowerCase().includes("autorizado") && (
                          <DropdownMenuItem
                            onClick={() => {
                              // Implementar lógica para marcar como autorizado
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar como Autorizado
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
            <DialogTitle>Detalhes do Pregão</DialogTitle>
          </DialogHeader>
          {selectedBidding && <BiddingDetails bidding={selectedBidding} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Pregão</DialogTitle>
          </DialogHeader>
          {selectedBidding && <BiddingForm bidding={selectedBidding} onSuccess={() => setIsEditOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

