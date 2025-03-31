"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FileUp, Check } from "lucide-react"
import { useProcessStore } from "@/hooks/use-process-store"
import { useBiddingStore } from "@/hooks/use-bidding-store"
import type { Process } from "@/types/process"
import type { Bidding } from "@/types/bidding"

export function CSVImporter() {
  const { setProcesses } = useProcessStore()
  const { setBiddings } = useBiddingStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const importCSV = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Importar o CSV de processos ativos
      const response = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/01%20-%20Controle%20Processos%28ATIVOS%29-MK3vQgM0StiM4iKWI8EObFKM2DmUOp.csv",
      )
      const csvText = await response.text()

      // Processar o CSV
      const { processes, biddings, completed } = processCSV(csvText)

      // Atualizar os stores
      setProcesses(processes)
      setBiddings(biddings)

      setSuccess(true)
    } catch (err) {
      console.error("Erro ao importar CSV:", err)
      setError("Falha ao importar dados. Verifique o console para mais detalhes.")
    } finally {
      setLoading(false)
    }
  }

  const processCSV = (csvText: string): { processes: Process[]; biddings: Bidding[]; completed: Process[] } => {
    // Dividir o CSV em linhas
    const lines = csvText.split("\n")

    // Verificar se há dados suficientes
    if (lines.length < 2) {
      throw new Error("CSV inválido ou vazio")
    }

    // Obter cabeçalhos (primeira linha)
    const headers = lines[0].split(";").map((h) => h.trim())

    // Mapear índices importantes
    const seiIndex = headers.findIndex((h) => h.includes("SEI"))
    const objectIndex = headers.findIndex((h) => h.includes("OBJETO"))
    const responsibleIndex = headers.findIndex((h) => h.includes("RESPONSÁVEL"))
    const typeIndex = headers.findIndex((h) => h.includes("TIPO"))
    const modalIndex = headers.findIndex((h) => h.includes("MODALIDADE"))
    const arrivalDateIndex = headers.findIndex((h) => h.includes("CHEGADA"))
    const exitDateIndex = headers.findIndex((h) => h.includes("SAÍDA"))
    const observationsIndex = headers.findIndex((h) => h.includes("OBSERVAÇÕES"))

    // Arrays para armazenar os dados processados
    const processes: Process[] = []
    const biddings: Bidding[] = []
    const completed: Process[] = []

    // Processar cada linha (exceto a primeira que são os cabeçalhos)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue // Pular linhas vazias

      const values = line.split(";").map((v) => v.trim())

      // Verificar se é um pregão (tipo específico)
      const isPregao = values[typeIndex]?.includes("PREGÃO") || false

      if (isPregao) {
        // Processar como pregão
        const bidding: Bidding = {
          id: `bid-${i}`,
          seq: values[0] || `${i}`,
          description: values[objectIndex] || "",
          sei: values[seiIndex] || "",
          preparation: values[responsibleIndex] || "",
          review: "",
          system: "",
          status: values[typeIndex]?.includes("AUTORIZADO") ? "AUTORIZADO" : "",
          notes: values[observationsIndex] || "",
        }
        biddings.push(bidding)
      } else {
        // Processar como processo normal
        const process: Process = {
          id: `proc-${i}`,
          name: values[objectIndex] || "",
          sei: values[seiIndex] || "",
          responsible: values[responsibleIndex] || "",
          type: values[typeIndex] || "",
          modal: values[modalIndex] || "",
          arrivalDate: parseDate(values[arrivalDateIndex]),
          exitDate: values[exitDateIndex] ? parseDate(values[exitDateIndex]) : null,
          observations: values[observationsIndex] || "",
          authorized: "",
        }

        // Verificar se é um processo concluído
        if (process.exitDate) {
          completed.push(process)
        } else {
          processes.push(process)
        }
      }
    }

    return { processes, biddings, completed }
  }

  // Função auxiliar para converter datas do formato DD/MM/YYYY para ISO string
  const parseDate = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString()

    const parts = dateStr.split("/")
    if (parts.length !== 3) return new Date().toISOString()

    const day = Number.parseInt(parts[0], 10)
    const month = Number.parseInt(parts[1], 10) - 1 // Meses em JS são 0-indexed
    const year = Number.parseInt(parts[2], 10)

    return new Date(year, month, day).toISOString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Dados</CardTitle>
        <CardDescription>Importe os dados do CSV para atualizar o sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <Check className="h-4 w-4" />
            <AlertTitle>Sucesso</AlertTitle>
            <AlertDescription>Dados importados com sucesso!</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={importCSV} disabled={loading} className="w-full">
          {loading ? (
            "Importando..."
          ) : (
            <>
              <FileUp className="mr-2 h-4 w-4" />
              Importar CSV
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

