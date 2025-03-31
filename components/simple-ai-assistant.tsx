"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bot, User, Send, Loader2 } from "lucide-react"
import { useProcesses } from "@/hooks/use-processes"
import { getDaysElapsed } from "@/lib/utils"

type Message = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function SimpleAIAssistant() {
  const { processes, biddings, completed } = useProcesses()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isClientSide, setIsClientSide] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Inicializar mensagens apenas no lado do cliente
  useEffect(() => {
    setIsClientSide(true)
    setMessages([
      {
        role: "assistant",
        content:
          "Olá! Sou o assistente de gestão de processos. Como posso ajudar você hoje? Você pode me perguntar sobre processos específicos, pendências, ou solicitar um resumo da situação atual.",
        timestamp: new Date(),
      },
    ])
  }, [])

  // Rolar para a mensagem mais recente quando novas mensagens são adicionadas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simular processamento da IA
    setTimeout(() => {
      const response = generateSimpleResponse(input, processes, biddings, completed)

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  // Renderizar apenas quando estiver no lado do cliente
  if (!isClientSide) {
    return (
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
    )
  }

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Assistente de Gestão de Processos
        </CardTitle>
        <CardDescription>Pergunte sobre processos, pendências ou solicite análises</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[400px] px-4">
          {messages.map((message, index) => (
            <div key={index} className="mb-4">
              <div className={`flex items-start gap-3 ${message.role === "assistant" ? "" : "flex-row-reverse"}`}>
                <Avatar>
                  {message.role === "assistant" ? (
                    <>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback>
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${
                    message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
                  }`}
                >
                  <div className="whitespace-pre-line">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === "assistant" ? "text-muted-foreground" : "text-primary-foreground/70"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 mb-4">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg p-3 bg-muted flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analisando processos...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>
      <Separator />
      <CardFooter className="pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex w-full gap-2"
        >
          <Input
            placeholder="Digite sua pergunta sobre os processos..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

// Função simplificada para gerar respostas
function generateSimpleResponse(input: string, processes: any[], biddings: any[], completed: any[]): string {
  const query = input.toLowerCase()

  // Estatísticas básicas
  const activeProcesses = processes.filter((p) => !p.exitDate)
  const delayedProcesses = activeProcesses.filter((p) => {
    const daysElapsed = getDaysElapsed(p.arrivalDate)
    return daysElapsed > 30
  })
  const criticalProcesses = activeProcesses.filter((p) => {
    const daysElapsed = getDaysElapsed(p.arrivalDate)
    return daysElapsed > 45
  })

  // Verificar se a pergunta é sobre processos atrasados ou críticos
  if (
    query.includes("atrasado") ||
    query.includes("crítico") ||
    query.includes("critico") ||
    query.includes("pendente")
  ) {
    if (delayedProcesses.length === 0) {
      return "✅ Não há processos atrasados ou críticos no momento. Todos os processos estão dentro do prazo esperado."
    }

    let response = `⚠️ **Processos Atrasados e Críticos**

**Total de Processos Atrasados:** ${delayedProcesses.length}
**Processos Críticos (>45 dias):** ${criticalProcesses.length}
`

    if (criticalProcesses.length > 0) {
      response += `\n🔴 **Processos Críticos:**\n`
      criticalProcesses.slice(0, 3).forEach((p) => {
        response += `- ${p.sei} - ${p.name} - ${p.responsible} (${getDaysElapsed(p.arrivalDate)} dias)\n`
      })
    }

    return response
  }

  // Verificar se a pergunta é sobre pregões
  if (
    query.includes("pregão") ||
    query.includes("pregao") ||
    query.includes("licitação") ||
    query.includes("licitacao")
  ) {
    const authorizedBiddings = biddings.filter((b) => b.status && b.status.toLowerCase().includes("autorizado"))

    return `🔖 **Pregões**

**Total de Pregões:** ${biddings.length}
**Pregões Autorizados:** ${authorizedBiddings.length}
**Pregões Pendentes:** ${biddings.length - authorizedBiddings.length}
`
  }

  // Verificar se a pergunta é sobre processos concluídos
  if (
    query.includes("concluído") ||
    query.includes("concluido") ||
    query.includes("finalizado") ||
    query.includes("completo")
  ) {
    return `✅ **Processos Concluídos**

**Total de Processos Concluídos:** ${completed.length}
**Tempo Médio de Conclusão:** ${
      completed.length > 0
        ? Math.round(
            completed.reduce((sum, p) => sum + (p.exitDate ? getDaysElapsed(p.arrivalDate, p.exitDate) : 0), 0) /
              completed.length,
          )
        : 0
    } dias
`
  }

  // Verificar se a pergunta é sobre resumo ou situação geral
  if (
    query.includes("resumo") ||
    query.includes("situação") ||
    query.includes("situacao") ||
    query.includes("geral") ||
    query.includes("status")
  ) {
    return `📊 **Resumo Geral da Situação**

**Processos Ativos:** ${activeProcesses.length}
**Pregões:** ${biddings.length}
**Processos Concluídos:** ${completed.length}

**Processos Atrasados:** ${delayedProcesses.length} (${activeProcesses.length > 0 ? ((delayedProcesses.length / activeProcesses.length) * 100).toFixed(1) : 0}% dos ativos)
**Processos Críticos:** ${criticalProcesses.length} (${activeProcesses.length > 0 ? ((criticalProcesses.length / activeProcesses.length) * 100).toFixed(1) : 0}% dos ativos)
`
  }

  // Resposta padrão para perguntas não reconhecidas
  return `Não consegui entender completamente sua pergunta. Você pode perguntar sobre:
  
- Processos atrasados ou críticos
- Pregões em andamento
- Processos concluídos
- Resumo geral da situação

Como posso ajudar você?`
}

