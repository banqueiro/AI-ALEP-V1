"use client"

import type { Bidding } from "@/types/bidding"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface BiddingDetailsProps {
  bidding: Bidding
}

export function BiddingDetails({ bidding }: BiddingDetailsProps) {
  const getStatusBadge = () => {
    if (!bidding.status) return <Badge variant="outline">Pendente</Badge>

    if (bidding.status.toLowerCase().includes("autorizado")) {
      return <Badge className="bg-green-500">Autorizado</Badge>
    } else {
      return <Badge variant="secondary">{bidding.status}</Badge>
    }
  }

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{bidding.description}</h3>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Sequência</p>
          <p>{bidding.seq}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Número SEI</p>
          <p>{bidding.sei}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Elaboração</p>
          <p>{bidding.preparation || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Revisão</p>
          <p>{bidding.review || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Sistema</p>
          <p>{bidding.system || "N/A"}</p>
        </div>
      </div>

      {bidding.notes && (
        <>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Observações</p>
            <p className="whitespace-pre-line">{bidding.notes}</p>
          </div>
        </>
      )}
    </div>
  )
}

