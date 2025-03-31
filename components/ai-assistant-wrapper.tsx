"use client"

import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Bot } from "lucide-react"

// Importar o AIAssistant com carregamento dinâmico para evitar problemas de hidratação
const AIAssistant = dynamic(() => import("./ai-assistant").then((mod) => mod.AIAssistant), {
  ssr: false,
  loading: () => (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Assistente de Gestão de Processos
        </CardTitle>
        <CardDescription>Carregando assistente...</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </CardContent>
    </Card>
  ),
})

export function AIAssistantWrapper() {
  return <AIAssistant />
}

