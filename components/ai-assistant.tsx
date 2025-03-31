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
import type { Process } from "@/types/process"
import type { Bidding } from "@/types/bidding"
import { formatDate, getDaysElapsed } from "@/lib/utils"

type Message = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function AIAssistant() {
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
      const response = generateResponse(input, processes, biddings, completed)

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

// Função para gerar respostas baseadas na entrada do usuário e nos dados
function generateResponse(input: string, processes: Process[], biddings: Bidding[], completed: Process[]): string {
  const query = input.toLowerCase()

  // Verificar se a pergunta é sobre um processo específico
  if (query.includes("sei") || query.includes("processo") || query.includes("número")) {
    // Extrair possíveis números de SEI da pergunta
    const seiMatches = input.match(/\d+-\d+\.\d+/g) || []

    if (seiMatches.length > 0) {
      const sei = seiMatches[0]

      // Procurar o processo com o SEI correspondente
      const process = [...processes, ...completed].find((p) => p.sei.includes(sei))
      const bidding = biddings.find((b) => b.sei.includes(sei))

      if (process) {
        return formatProcessInfo(process)
      } else if (bidding) {
        return formatBiddingInfo(bidding)
      } else {
        return `Não encontrei nenhum processo com o SEI ${sei}. Verifique se o número está correto ou tente outra consulta.`
      }
    }
  }

  // Verificar se a pergunta é sobre processos de um responsável específico
  if (query.includes("responsável") || query.includes("responsavel")) {
    const responsibleNames = [
      "DIEGO",
      "GUDRIAN",
      "KOHL",
      "THAYS",
      "ALESSANDRA",
      "ISABELA",
      "JOELSON",
      "KAREN",
      "MICHELI",
      "EDUARDO",
      "EDUARDA",
    ]

    const foundName = responsibleNames.find((name) => query.includes(name.toLowerCase()))

    if (foundName) {
      return formatResponsibleInfo(foundName, processes, biddings)
    }
  }

  // Verificar se a pergunta é sobre processos atrasados ou críticos
  if (
    query.includes("atrasado") ||
    query.includes("crítico") ||
    query.includes("critico") ||
    query.includes("pendente")
  ) {
    return formatDelayedProcessesInfo(processes)
  }

  // Verificar se a pergunta é sobre pregões
  if (
    query.includes("pregão") ||
    query.includes("pregao") ||
    query.includes("licitação") ||
    query.includes("licitacao")
  ) {
    return formatBiddingsInfo(biddings)
  }

  // Verificar se a pergunta é sobre processos concluídos
  if (
    query.includes("concluído") ||
    query.includes("concluido") ||
    query.includes("finalizado") ||
    query.includes("completo")
  ) {
    return formatCompletedProcessesInfo(completed)
  }

  // Verificar se a pergunta é sobre resumo ou situação geral
  if (
    query.includes("resumo") ||
    query.includes("situação") ||
    query.includes("situacao") ||
    query.includes("geral") ||
    query.includes("status")
  ) {
    return formatGeneralSummary(processes, biddings, completed)
  }

  // Resposta padrão para perguntas não reconhecidas
  return `Não consegui entender completamente sua pergunta. Você pode perguntar sobre:
  
- Um processo específico (informe o número SEI)
- Processos de um responsável específico
- Processos atrasados ou críticos
- Pregões em andamento
- Processos concluídos
- Resumo geral da situação

Como posso ajudar você?`
}

// Formatar informações de um processo específico
function formatProcessInfo(process: Process): string {
  const daysElapsed = process.exitDate
    ? getDaysElapsed(process.arrivalDate, process.exitDate)
    : getDaysElapsed(process.arrivalDate)

  let status = ""
  if (process.exitDate) {
    status = "✅ Concluído"
  } else if (daysElapsed > 45) {
    status = "🔴 Crítico"
  } else if (daysElapsed > 30) {
    status = "🟠 Atrasado"
  } else {
    status = "🟢 Em andamento"
  }

  return `📋 **Processo SEI ${process.sei}**

**Objeto:** ${process.name}
**Responsável:** ${process.responsible}
**Tipo:** ${process.type}
**Modalidade:** ${process.modal || "Não especificada"}
**Data de Chegada:** ${formatDate(process.arrivalDate)}
${process.exitDate ? `**Data de Saída:** ${formatDate(process.exitDate)}` : ""}
**Dias Decorridos:** ${daysElapsed} dias
**Status:** ${status}
${process.observations ? `**Observações:** ${process.observations}` : ""}

${getProcessRecommendation(process)}`
}

// Formatar informações de um pregão específico
function formatBiddingInfo(bidding: Bidding): string {
  return `🔖 **Pregão SEI ${bidding.sei}**

**Sequência:** ${bidding.seq}
**Descrição:** ${bidding.description}
**Elaboração:** ${bidding.preparation || "Não definido"}
**Revisão:** ${bidding.review || "Não definido"}
**Sistema:** ${bidding.system || "Não definido"}
**Status:** ${bidding.status ? `✅ ${bidding.status}` : "⏳ Pendente"}
${bidding.notes ? `**Observações:** ${bidding.notes}` : ""}

${getBiddingRecommendation(bidding)}`
}

// Formatar informações sobre processos de um responsável específico
function formatResponsibleInfo(responsible: string, processes: Process[], biddings: Bidding[]): string {
  const responsibleProcesses = processes.filter((p) => p.responsible.toUpperCase().includes(responsible))

  const responsibleBiddings = biddings.filter(
    (b) =>
      (b.preparation && b.preparation.toUpperCase().includes(responsible)) ||
      (b.review && b.review.toUpperCase().includes(responsible)) ||
      (b.system && b.system.toUpperCase().includes(responsible)),
  )

  const delayedProcesses = responsibleProcesses.filter((p) => {
    if (p.exitDate) return false
    const daysElapsed = getDaysElapsed(p.arrivalDate)
    return daysElapsed > 30
  })

  const criticalProcesses = responsibleProcesses.filter((p) => {
    if (p.exitDate) return false
    const daysElapsed = getDaysElapsed(p.arrivalDate)
    return daysElapsed > 45
  })

  let response = `👤 **Processos de ${responsible}**

**Total de Processos:** ${responsibleProcesses.length}
**Total de Pregões:** ${responsibleBiddings.length}
**Processos Atrasados:** ${delayedProcesses.length}
**Processos Críticos:** ${criticalProcesses.length}

`

  if (criticalProcesses.length > 0) {
    response += `⚠️ **Processos Críticos:**\n`
    criticalProcesses.forEach((p) => {
      response += `- ${p.sei} - ${p.name} (${getDaysElapsed(p.arrivalDate)} dias)\n`
    })
    response += "\n"
  }

  if (delayedProcesses.length > 0 && delayedProcesses.length !== criticalProcesses.length) {
    response += `⏰ **Processos Atrasados:**\n`
    delayedProcesses
      .filter((p) => getDaysElapsed(p.arrivalDate) <= 45)
      .forEach((p) => {
        response += `- ${p.sei} - ${p.name} (${getDaysElapsed(p.arrivalDate)} dias)\n`
      })
    response += "\n"
  }

  if (responsibleBiddings.length > 0) {
    response += `📋 **Pregões:**\n`
    responsibleBiddings.forEach((b) => {
      response += `- ${b.sei} - ${b.description} (${b.status || "Pendente"})\n`
    })
  }

  return response
}

// Formatar informações sobre processos atrasados ou críticos
function formatDelayedProcessesInfo(processes: Process[]): string {
  const delayedProcesses = processes.filter((p) => {
    if (p.exitDate) return false
    const daysElapsed = getDaysElapsed(p.arrivalDate)
    return daysElapsed > 30
  })

  const criticalProcesses = delayedProcesses.filter((p) => {
    const daysElapsed = getDaysElapsed(p.arrivalDate)
    return daysElapsed > 45
  })

  const normalDelayedProcesses = delayedProcesses.filter((p) => {
    const daysElapsed = getDaysElapsed(p.arrivalDate)
    return daysElapsed <= 45
  })

  if (delayedProcesses.length === 0) {
    return "✅ Não há processos atrasados ou críticos no momento. Todos os processos estão dentro do prazo esperado."
  }

  let response = `⚠️ **Processos Atrasados e Críticos**

**Total de Processos Atrasados:** ${delayedProcesses.length}
**Processos Críticos (>45 dias):** ${criticalProcesses.length}
**Processos Atrasados (30-45 dias):** ${normalDelayedProcesses.length}

`

  if (criticalProcesses.length > 0) {
    response += `🔴 **Processos Críticos:**\n`
    criticalProcesses
      .sort((a, b) => getDaysElapsed(b.arrivalDate) - getDaysElapsed(a.arrivalDate))
      .forEach((p) => {
        response += `- ${p.sei} - ${p.name} - ${p.responsible} (${getDaysElapsed(p.arrivalDate)} dias)\n`
      })
    response += "\n"
  }

  if (normalDelayedProcesses.length > 0) {
    response += `🟠 **Processos Atrasados:**\n`
    normalDelayedProcesses
      .sort((a, b) => getDaysElapsed(b.arrivalDate) - getDaysElapsed(a.arrivalDate))
      .forEach((p) => {
        response += `- ${p.sei} - ${p.name} - ${p.responsible} (${getDaysElapsed(p.arrivalDate)} dias)\n`
      })
  }

  return response
}

// Formatar informações sobre pregões
function formatBiddingsInfo(biddings: Bidding[]): string {
  const authorizedBiddings = biddings.filter((b) => b.status && b.status.toLowerCase().includes("autorizado"))

  const pendingBiddings = biddings.filter((b) => !b.status || !b.status.toLowerCase().includes("autorizado"))

  let response = `🔖 **Pregões**

**Total de Pregões:** ${biddings.length}
**Pregões Autorizados:** ${authorizedBiddings.length}
**Pregões Pendentes:** ${pendingBiddings.length}

`

  if (authorizedBiddings.length > 0) {
    response += `✅ **Pregões Autorizados:**\n`
    authorizedBiddings.forEach((b) => {
      response += `- ${b.sei} - ${b.description} - Elaboração: ${b.preparation || "N/A"}\n`
    })
    response += "\n"
  }

  if (pendingBiddings.length > 0) {
    response += `⏳ **Pregões Pendentes:**\n`
    pendingBiddings.forEach((b) => {
      response += `- ${b.sei} - ${b.description} - Elaboração: ${b.preparation || "N/A"}\n`
    })
  }

  return response
}

// Formatar informações sobre processos concluídos
function formatCompletedProcessesInfo(completed: Process[]): string {
  if (completed.length === 0) {
    return "Não há processos concluídos registrados no sistema."
  }

  // Calcular tempo médio de conclusão
  const avgCompletionTime =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, p) => {
            if (!p.exitDate) return sum
            return sum + getDaysElapsed(p.arrivalDate, p.exitDate)
          }, 0) / completed.length,
        )
      : 0

  // Processos concluídos nos últimos 30 dias
  const today = new Date()
  const recentlyCompleted = completed.filter((p) => {
    if (!p.exitDate) return false
    const exitDate = new Date(p.exitDate)
    const daysElapsed = Math.floor((today.getTime() - exitDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysElapsed <= 30
  })

  let response = `✅ **Processos Concluídos**

**Total de Processos Concluídos:** ${completed.length}
**Concluídos nos Últimos 30 Dias:** ${recentlyCompleted.length}
**Tempo Médio de Conclusão:** ${avgCompletionTime} dias

`

  if (recentlyCompleted.length > 0) {
    response += `🆕 **Recentemente Concluídos:**\n`
    recentlyCompleted
      .sort((a, b) => new Date(b.exitDate!).getTime() - new Date(a.exitDate!).getTime())
      .slice(0, 5)
      .forEach((p) => {
        const completionTime = getDaysElapsed(p.arrivalDate, p.exitDate!)
        response += `- ${p.sei} - ${p.name} - ${p.responsible} (${completionTime} dias)\n`
      })
  }

  return response
}

// Formatar resumo geral da situação
function formatGeneralSummary(processes: Process[], biddings: Bidding[], completed: Process[]): string {
  const activeProcesses = processes.filter((p) => !p.exitDate)

  const delayedProcesses = activeProcesses.filter((p) => {
    const daysElapsed = getDaysElapsed(p.arrivalDate)
    return daysElapsed > 30
  })

  const criticalProcesses = activeProcesses.filter((p) => {
    const daysElapsed = getDaysElapsed(p.arrivalDate)
    return daysElapsed > 45
  })

  const authorizedBiddings = biddings.filter((b) => b.status && b.status.toLowerCase().includes("autorizado"))

  // Calcular tempo médio de conclusão
  const avgCompletionTime =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, p) => {
            if (!p.exitDate) return sum
            return sum + getDaysElapsed(p.arrivalDate, p.exitDate)
          }, 0) / completed.length,
        )
      : 0

  // Processos concluídos nos últimos 30 dias
  const today = new Date()
  const recentlyCompleted = completed.filter((p) => {
    if (!p.exitDate) return false
    const exitDate = new Date(p.exitDate)
    const daysElapsed = Math.floor((today.getTime() - exitDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysElapsed <= 30
  })

  // Responsáveis com mais processos
  const responsibleCounts: Record<string, number> = {}
  activeProcesses.forEach((p) => {
    responsibleCounts[p.responsible] = (responsibleCounts[p.responsible] || 0) + 1
  })

  const topResponsibles = Object.entries(responsibleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  let response = `📊 **Resumo Geral da Situação**

**Processos Ativos:** ${activeProcesses.length}
**Pregões:** ${biddings.length}
**Processos Concluídos:** ${completed.length}

**Processos Atrasados:** ${delayedProcesses.length} (${((delayedProcesses.length / activeProcesses.length) * 100).toFixed(1)}% dos ativos)
**Processos Críticos:** ${criticalProcesses.length} (${((criticalProcesses.length / activeProcesses.length) * 100).toFixed(1)}% dos ativos)
**Pregões Autorizados:** ${authorizedBiddings.length} (${((authorizedBiddings.length / biddings.length) * 100).toFixed(1)}% dos pregões)

**Tempo Médio de Conclusão:** ${avgCompletionTime} dias
**Concluídos nos Últimos 30 Dias:** ${recentlyCompleted.length}

`

  if (topResponsibles.length > 0) {
    response += `👥 **Responsáveis com Mais Processos:**\n`
    topResponsibles.forEach(([name, count]) => {
      response += `- ${name}: ${count} processos\n`
    })
    response += "\n"
  }

  if (criticalProcesses.length > 0) {
    response += `⚠️ **Atenção! Processos Críticos Prioritários:**\n`
    criticalProcesses
      .sort((a, b) => getDaysElapsed(b.arrivalDate) - getDaysElapsed(a.arrivalDate))
      .slice(0, 3)
      .forEach((p) => {
        response += `- ${p.sei} - ${p.name} - ${p.responsible} (${getDaysElapsed(p.arrivalDate)} dias)\n`
      })
  }

  return response
}

// Gerar recomendações para um processo específico
function getProcessRecommendation(process: Process): string {
  if (process.exitDate) {
    const completionTime = getDaysElapsed(process.arrivalDate, process.exitDate)
    if (completionTime <= 15) {
      return "✅ Este processo foi concluído rapidamente, em menos de 15 dias. Excelente eficiência!"
    } else if (completionTime <= 30) {
      return "✅ Este processo foi concluído dentro do prazo normal."
    } else if (completionTime <= 45) {
      return "⚠️ Este processo demorou mais que o ideal para ser concluído. Considere revisar o fluxo para identificar possíveis melhorias."
    } else {
      return "🔴 Este processo demorou significativamente mais que o esperado para ser concluído. Recomendo uma análise detalhada para identificar gargalos no processo."
    }
  } else {
    const daysElapsed = getDaysElapsed(process.arrivalDate)
    if (daysElapsed <= 15) {
      return "🟢 Este processo está dentro do prazo esperado."
    } else if (daysElapsed <= 30) {
      return "🟢 Este processo ainda está dentro do prazo, mas está se aproximando do limite. Recomendo acompanhamento."
    } else if (daysElapsed <= 45) {
      return "🟠 ATENÇÃO: Este processo está atrasado. Recomendo priorização para evitar que se torne crítico."
    } else {
      return "🔴 URGENTE: Este processo está em estado crítico e requer atenção imediata. Recomendo verificar os motivos do atraso e definir um plano de ação para sua conclusão."
    }
  }
}

// Gerar recomendações para um pregão específico
function getBiddingRecommendation(bidding: Bidding): string {
  if (bidding.status && bidding.status.toLowerCase().includes("autorizado")) {
    return "✅ Este pregão está autorizado. Nenhuma ação adicional é necessária no momento."
  } else if (!bidding.preparation) {
    return "⚠️ Este pregão não tem um responsável pela elaboração definido. Recomendo designar um responsável o quanto antes."
  } else if (!bidding.review) {
    return "⚠️ Este pregão não tem um responsável pela revisão definido. Recomendo designar um revisor para garantir a qualidade do processo."
  } else if (!bidding.system) {
    return "⚠️ Este pregão não tem um responsável pelo sistema definido. Recomendo designar um responsável para o sistema."
  } else {
    return "⏳ Este pregão está em andamento com todos os responsáveis designados. Continue acompanhando seu progresso."
  }
}

