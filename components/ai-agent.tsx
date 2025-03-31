"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bot, User, Send, Loader2, Brain } from "lucide-react"
import { useProcesses } from "@/hooks/use-processes"
import { getDaysElapsed } from "@/lib/utils"
import type { Process } from "@/types/process"
import type { Bidding } from "@/types/bidding"

type Message = {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

export function AIAgent() {
  const { processes, biddings, completed } = useProcesses()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isClientSide, setIsClientSide] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Inicializar mensagens apenas no lado do cliente
  useEffect(() => {
    setIsClientSide(true)
    setMessages([
      {
        role: "system",
        content: "Inicializando agente de IA para gestão de processos...",
        timestamp: new Date(),
      },
      {
        role: "assistant",
        content:
          "Olá! Sou o agente de IA para gestão de processos. Posso analisar dados, identificar tendências e ajudar a resolver problemas complexos. Como posso ajudar você hoje?",
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
    setIsThinking(true)

    // Simular o processo de "pensamento" do agente
    setTimeout(() => {
      const thinkingMessage: Message = {
        role: "system",
        content: generateThinkingProcess(input, processes, biddings, completed),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, thinkingMessage])
      setIsThinking(false)

      // Gerar resposta após o "pensamento"
      setTimeout(() => {
        const response = generateAdvancedResponse(input, processes, biddings, completed)

        const assistantMessage: Message = {
          role: "assistant",
          content: response,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
      }, 1000)
    }, 2000)
  }

  // Renderizar apenas quando estiver no lado do cliente
  if (!isClientSide) {
    return (
      <Card className="w-full h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agente de IA para Gestão de Processos
          </CardTitle>
          <CardDescription>Inicializando sistema de IA...</CardDescription>
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
          Agente de IA para Gestão de Processos
        </CardTitle>
        <CardDescription>
          Análise avançada de processos, identificação de tendências e resolução de problemas
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[400px] px-4">
          {messages.map((message, index) => (
            <div key={index} className="mb-4">
              {message.role === "system" ? (
                <div className="flex items-start gap-3 my-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>
                      <Brain className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 max-w-[90%] bg-slate-100 dark:bg-slate-800 text-sm font-mono">
                    <div className="whitespace-pre-line">{message.content}</div>
                    <div className="text-xs mt-1 text-muted-foreground">Processo de pensamento do agente</div>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 mb-4">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>
                  {isThinking ? <Brain className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg p-3 bg-muted flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isThinking ? "Analisando dados e processando informações..." : "Gerando resposta..."}</span>
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
            placeholder="Faça uma pergunta ou peça uma análise avançada..."
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

// Função para gerar o processo de "pensamento" do agente
function generateThinkingProcess(
  input: string,
  processes: Process[],
  biddings: Bidding[],
  completed: Process[],
): string {
  const query = input.toLowerCase()

  // Análise de processos atrasados
  if (query.includes("atrasado") || query.includes("crítico") || query.includes("critico")) {
    return `Analisando processos atrasados e críticos...

1. Verificando todos os processos ativos: ${processes.length} processos encontrados
2. Filtrando processos sem data de saída: ${processes.filter((p) => !p.exitDate).length} processos em andamento
3. Calculando dias decorridos para cada processo...
4. Identificando processos com mais de 30 dias: ${processes.filter((p) => !p.exitDate && getDaysElapsed(p.arrivalDate) > 30).length} processos atrasados
5. Identificando processos com mais de 45 dias: ${processes.filter((p) => !p.exitDate && getDaysElapsed(p.arrivalDate) > 45).length} processos críticos
6. Ordenando processos por tempo decorrido (decrescente)
7. Analisando responsáveis por processos críticos...
8. Verificando padrões de atraso por tipo de processo...
9. Gerando recomendações baseadas nos dados analisados`
  }

  // Análise de tendências
  if (
    query.includes("tendência") ||
    query.includes("tendencia") ||
    query.includes("padrão") ||
    query.includes("padrao")
  ) {
    return `Analisando tendências e padrões nos processos...

1. Agrupando processos por tipo: ${Array.from(new Set(processes.map((p) => p.type))).length} tipos diferentes
2. Calculando tempo médio de conclusão por tipo de processo...
3. Identificando tipos de processo com maior taxa de atraso...
4. Analisando distribuição de processos por responsável...
5. Verificando correlação entre modalidade e tempo de conclusão...
6. Identificando gargalos no fluxo de processos...
7. Comparando desempenho atual com períodos anteriores...
8. Gerando insights baseados nos padrões identificados`
  }

  // Análise de eficiência por responsável
  if (
    query.includes("responsável") ||
    query.includes("responsavel") ||
    query.includes("eficiência") ||
    query.includes("eficiencia")
  ) {
    return `Analisando eficiência por responsável...

1. Identificando todos os responsáveis: ${Array.from(new Set(processes.map((p) => p.responsible))).length} responsáveis encontrados
2. Contabilizando número de processos por responsável...
3. Calculando tempo médio de conclusão por responsável...
4. Identificando taxa de processos atrasados por responsável...
5. Analisando complexidade dos processos atribuídos (por tipo e modalidade)...
6. Verificando carga de trabalho atual de cada responsável...
7. Comparando eficiência entre responsáveis com tipos similares de processo...
8. Gerando recomendações para otimização de atribuições`
  }

  // Análise geral
  return `Analisando consulta do usuário: "${input}"

1. Identificando palavras-chave na consulta...
2. Verificando dados disponíveis: ${processes.length} processos ativos, ${biddings.length} pregões, ${completed.length} processos concluídos
3. Calculando métricas gerais do sistema...
4. Identificando processos críticos: ${processes.filter((p) => !p.exitDate && getDaysElapsed(p.arrivalDate) > 45).length} encontrados
5. Analisando distribuição de processos por tipo e modalidade...
6. Verificando eficiência do sistema (tempo médio de conclusão)...
7. Identificando possíveis gargalos no fluxo de processos...
8. Gerando resposta baseada nos dados analisados`
}

// Função para gerar respostas avançadas
function generateAdvancedResponse(
  input: string,
  processes: Process[],
  biddings: Bidding[],
  completed: Process[],
): string {
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

  // Análise de processos atrasados ou críticos
  if (
    query.includes("atrasado") ||
    query.includes("crítico") ||
    query.includes("critico") ||
    query.includes("pendente")
  ) {
    if (delayedProcesses.length === 0) {
      return "✅ Análise concluída: Não há processos atrasados ou críticos no momento. Todos os processos estão dentro do prazo esperado. Isso indica uma gestão eficiente do fluxo de trabalho atual."
    }

    // Análise por responsável
    const responsibleCounts: Record<string, { total: number; critical: number }> = {}
    activeProcesses.forEach((p) => {
      if (!responsibleCounts[p.responsible]) {
        responsibleCounts[p.responsible] = { total: 0, critical: 0 }
      }
      responsibleCounts[p.responsible].total += 1

      const daysElapsed = getDaysElapsed(p.arrivalDate)
      if (daysElapsed > 45) {
        responsibleCounts[p.responsible].critical += 1
      }
    })

    // Identificar responsáveis com mais processos críticos
    const responsiblesWithCritical = Object.entries(responsibleCounts)
      .filter(([_, counts]) => counts.critical > 0)
      .sort((a, b) => b[1].critical - a[1].critical)

    let response = `⚠️ **Análise de Processos Atrasados e Críticos**

**Total de Processos Atrasados:** ${delayedProcesses.length} (${((delayedProcesses.length / activeProcesses.length) * 100).toFixed(1)}% dos processos ativos)
**Processos Críticos (>45 dias):** ${criticalProcesses.length} (${((criticalProcesses.length / activeProcesses.length) * 100).toFixed(1)}% dos processos ativos)

**Análise por Responsável:**
${responsiblesWithCritical
  .map(
    ([name, counts]) =>
      `- ${name}: ${counts.critical} críticos de ${counts.total} processos (${((counts.critical / counts.total) * 100).toFixed(1)}%)`,
  )
  .join("\n")}

**Processos Críticos Prioritários:**
`

    // Listar processos críticos mais antigos
    criticalProcesses
      .sort((a, b) => getDaysElapsed(b.arrivalDate) - getDaysElapsed(a.arrivalDate))
      .slice(0, 3)
      .forEach((p) => {
        response += `- ${p.sei} - ${p.name} - ${p.responsible} (${getDaysElapsed(p.arrivalDate)} dias)\n`
      })

    // Adicionar recomendações
    response += `\n**Recomendações:**
1. Priorizar os processos críticos listados acima para resolução imediata
2. Realizar reunião com ${responsiblesWithCritical[0]?.[0] || "responsáveis"} para identificar obstáculos
3. Considerar redistribuição de carga de trabalho entre responsáveis
4. Implementar revisões semanais para processos com mais de 30 dias`

    return response
  }

  // Análise de tendências e padrões
  if (
    query.includes("tendência") ||
    query.includes("tendencia") ||
    query.includes("padrão") ||
    query.includes("padrao")
  ) {
    // Análise por tipo de processo
    const typeAnalysis: Record<string, { count: number; delayed: number; avgDays: number }> = {}
    ;[...processes, ...completed].forEach((p) => {
      if (!typeAnalysis[p.type]) {
        typeAnalysis[p.type] = { count: 0, delayed: 0, avgDays: 0 }
      }

      typeAnalysis[p.type].count += 1

      if (p.exitDate) {
        // Para processos concluídos, calcular tempo de conclusão
        const days = getDaysElapsed(p.arrivalDate, p.exitDate)
        typeAnalysis[p.type].avgDays =
          (typeAnalysis[p.type].avgDays * (typeAnalysis[p.type].count - 1) + days) / typeAnalysis[p.type].count
      } else {
        // Para processos em andamento, verificar se está atrasado
        const days = getDaysElapsed(p.arrivalDate)
        if (days > 30) {
          typeAnalysis[p.type].delayed += 1
        }
      }
    })

    // Ordenar tipos por taxa de atraso
    const typesByDelayRate = Object.entries(typeAnalysis)
      .map(([type, data]) => ({
        type,
        count: data.count,
        delayed: data.delayed,
        delayRate: data.delayed / data.count,
        avgDays: Math.round(data.avgDays),
      }))
      .sort((a, b) => b.delayRate - a.delayRate)

    let response = `📊 **Análise de Tendências e Padrões**

**Tipos de Processo com Maior Taxa de Atraso:**
${typesByDelayRate
  .slice(0, 3)
  .map((t) => `- ${t.type}: ${(t.delayRate * 100).toFixed(1)}% de atraso (${t.delayed} de ${t.count} processos)`)
  .join("\n")}

**Tempo Médio de Conclusão por Tipo:**
${Object.entries(typeAnalysis)
  .filter(([_, data]) => data.avgDays > 0)
  .sort((a, b) => b[1].avgDays - a[1].avgDays)
  .slice(0, 3)
  .map(([type, data]) => `- ${type}: ${Math.round(data.avgDays)} dias`)
  .join("\n")}

**Padrões Identificados:**
`

    // Identificar padrões específicos
    if (typesByDelayRate.length > 0 && typesByDelayRate[0].delayRate > 0.3) {
      response += `- Processos do tipo "${typesByDelayRate[0].type}" apresentam taxa de atraso significativamente alta (${(typesByDelayRate[0].delayRate * 100).toFixed(1)}%)\n`
    }

    // Análise por modalidade
    const modalAnalysis: Record<string, number> = {}
    processes.forEach((p) => {
      if (p.modal) {
        modalAnalysis[p.modal] = (modalAnalysis[p.modal] || 0) + 1
      }
    })

    const topModals = Object.entries(modalAnalysis)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)

    if (topModals.length > 0) {
      response += `- Modalidade "${topModals[0][0]}" é predominante (${topModals[0][1]} processos, ${((topModals[0][1] / processes.length) * 100).toFixed(1)}% do total)\n`
    }

    // Verificar se há concentração de processos em poucos responsáveis
    const responsibleCounts: Record<string, number> = {}
    processes.forEach((p) => {
      responsibleCounts[p.responsible] = (responsibleCounts[p.responsible] || 0) + 1
    })

    const topResponsibles = Object.entries(responsibleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    const topResponsiblesTotal = topResponsibles.reduce((sum, [_, count]) => sum + count, 0)
    const topResponsiblesPercentage = (topResponsiblesTotal / processes.length) * 100

    if (topResponsiblesPercentage > 60) {
      response += `- Alta concentração de processos: ${topResponsibles.length} responsáveis gerenciam ${topResponsiblesPercentage.toFixed(1)}% dos processos\n`
    }

    // Adicionar recomendações
    response += `\n**Recomendações Baseadas em Dados:**
1. Revisar procedimentos para processos do tipo "${typesByDelayRate[0]?.type || "com maior taxa de atraso"}"
2. Implementar pontos de verificação adicionais para modalidade "${topModals[0]?.[0] || "predominante"}"
3. Considerar redistribuição de processos entre responsáveis para equilibrar a carga de trabalho
4. Estabelecer métricas de desempenho baseadas nos tempos médios identificados`

    return response
  }

  // Análise de eficiência por responsável
  if (
    query.includes("responsável") ||
    query.includes("responsavel") ||
    query.includes("eficiência") ||
    query.includes("eficiencia")
  ) {
    // Análise detalhada por responsável
    const responsibleAnalysis: Record<
      string,
      {
        active: number
        completed: number
        delayed: number
        critical: number
        avgCompletionDays: number
        types: Record<string, number>
      }
    > = {}

    // Processar processos ativos
    processes.forEach((p) => {
      if (!responsibleAnalysis[p.responsible]) {
        responsibleAnalysis[p.responsible] = {
          active: 0,
          completed: 0,
          delayed: 0,
          critical: 0,
          avgCompletionDays: 0,
          types: {},
        }
      }

      responsibleAnalysis[p.responsible].active += 1
      responsibleAnalysis[p.responsible].types[p.type] = (responsibleAnalysis[p.responsible].types[p.type] || 0) + 1

      const days = getDaysElapsed(p.arrivalDate)
      if (days > 45) {
        responsibleAnalysis[p.responsible].critical += 1
      } else if (days > 30) {
        responsibleAnalysis[p.responsible].delayed += 1
      }
    })

    // Processar processos concluídos
    completed.forEach((p) => {
      if (!responsibleAnalysis[p.responsible]) {
        responsibleAnalysis[p.responsible] = {
          active: 0,
          completed: 0,
          delayed: 0,
          critical: 0,
          avgCompletionDays: 0,
          types: {},
        }
      }

      responsibleAnalysis[p.responsible].completed += 1

      if (p.exitDate) {
        const days = getDaysElapsed(p.arrivalDate, p.exitDate)
        const prevAvg = responsibleAnalysis[p.responsible].avgCompletionDays
        const prevCount = responsibleAnalysis[p.responsible].completed - 1

        responsibleAnalysis[p.responsible].avgCompletionDays =
          (prevAvg * prevCount + days) / responsibleAnalysis[p.responsible].completed
      }
    })

    // Calcular eficiência (menor tempo médio de conclusão = maior eficiência)
    const responsibleEfficiency = Object.entries(responsibleAnalysis)
      .filter(([_, data]) => data.completed > 0) // Apenas responsáveis com processos concluídos
      .map(([name, data]) => ({
        name,
        active: data.active,
        completed: data.completed,
        total: data.active + data.completed,
        delayed: data.delayed,
        critical: data.critical,
        avgDays: Math.round(data.avgCompletionDays),
        delayRate: (data.delayed + data.critical) / data.active,
        mainType: Object.entries(data.types).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
      }))
      .sort((a, b) => a.avgDays - b.avgDays) // Ordenar por tempo médio (crescente)

    let response = `👥 **Análise de Eficiência por Responsável**

**Responsáveis Mais Eficientes (menor tempo médio):**
${responsibleEfficiency
  .slice(0, 3)
  .map((r) => `- ${r.name}: ${r.avgDays} dias em média (${r.completed} processos concluídos)`)
  .join("\n")}

**Responsáveis com Maior Carga Atual:**
${Object.entries(responsibleAnalysis)
  .sort((a, b) => b[1].active - a[1].active)
  .slice(0, 3)
  .map(([name, data]) => `- ${name}: ${data.active} processos ativos, ${data.delayed + data.critical} atrasados`)
  .join("\n")}

**Análise de Gargalos:**
`

    // Identificar responsáveis com problemas
    const problemResponsibles = Object.entries(responsibleAnalysis)
      .filter(([_, data]) => data.active > 0 && (data.delayed + data.critical) / data.active > 0.3)
      .sort((a, b) => (b[1].delayed + b[1].critical) / b[1].active - (a[1].delayed + a[1].critical) / a[1].active)

    if (problemResponsibles.length > 0) {
      problemResponsibles.slice(0, 2).forEach(([name, data]) => {
        const delayRate = (((data.delayed + data.critical) / data.active) * 100).toFixed(1)
        response += `- ${name}: ${delayRate}% dos processos ativos estão atrasados ou críticos\n`
      })
    } else {
      response += "- Não foram identificados gargalos significativos na distribuição atual\n"
    }

    // Adicionar recomendações personalizadas
    response += `\n**Recomendações para Otimização:**
1. ${
      problemResponsibles.length > 0
        ? `Redistribuir parte dos processos de ${problemResponsibles[0]?.[0] || "responsáveis sobrecarregados"}`
        : "Manter a distribuição atual de processos que está equilibrada"
    }
2. Aplicar práticas de ${responsibleEfficiency[0]?.name || "responsáveis mais eficientes"} como modelo para a equipe
3. Implementar revisão por pares para processos do tipo "${
      Object.entries(
        Object.values(responsibleAnalysis).reduce(
          (acc, data) => {
            Object.entries(data.types).forEach(([type, count]) => {
              acc[type] = (acc[type] || 0) + count
            })
            return acc
          },
          {} as Record<string, number>,
        ),
      ).sort((a, b) => b[1] - a[1])[0]?.[0] || "mais comum"
    }"
4. Estabelecer metas de tempo baseadas nas médias dos responsáveis mais eficientes`

    return response
  }

  // Análise preditiva
  if (
    query.includes("previsão") ||
    query.includes("previsao") ||
    query.includes("prever") ||
    query.includes("futuro")
  ) {
    // Calcular taxa média de conclusão
    const completionRate = completed.length / (completed.length + processes.length)

    // Estimar tempo para concluir processos atuais
    const avgCompletionTime =
      completed.length > 0
        ? completed.reduce((sum, p) => {
            if (!p.exitDate) return sum
            return sum + getDaysElapsed(p.arrivalDate, p.exitDate)
          }, 0) / completed.length
        : 30 // valor padrão se não houver dados

    // Estimar processos que serão concluídos nos próximos 30 dias
    const estimatedCompletions = Math.round(processes.length * (30 / avgCompletionTime) * completionRate)

    // Estimar processos que ficarão críticos nos próximos 30 dias
    const potentialCritical = processes.filter((p) => {
      const days = getDaysElapsed(p.arrivalDate)
      return days > 15 && days <= 45 // Processos que podem se tornar críticos
    }).length

    const response = `🔮 **Análise Preditiva de Processos**

**Estimativas para os Próximos 30 Dias:**
- Processos que devem ser concluídos: ~${estimatedCompletions} (${((estimatedCompletions / processes.length) * 100).toFixed(1)}% dos atuais)
- Processos que podem se tornar críticos: ~${potentialCritical} (${((potentialCritical / processes.length) * 100).toFixed(1)}% dos atuais)
- Tempo médio estimado para conclusão: ${Math.round(avgCompletionTime)} dias

**Análise de Tendências:**
- Taxa histórica de conclusão: ${(completionRate * 100).toFixed(1)}% dos processos
- Processos mais propensos a atrasos: Tipo "${
      Object.entries(
        processes.reduce(
          (acc, p) => {
            const days = getDaysElapsed(p.arrivalDate)
            if (days > 30 && !p.exitDate) {
              acc[p.type] = (acc[p.type] || 0) + 1
            }
            return acc
          },
          {} as Record<string, number>,
        ),
      ).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"
    }"

**Recomendações Proativas:**
1. Priorizar ${Math.min(5, potentialCritical)} processos que estão próximos de se tornarem críticos
2. Planejar capacidade para lidar com aproximadamente ${estimatedCompletions + Math.round(processes.length * 0.1)} processos no próximo mês
3. Implementar alertas antecipados para processos que ultrapassem ${Math.round(avgCompletionTime * 0.7)} dias
4. Revisar processos do tipo "${
      Object.entries(
        processes.reduce(
          (acc, p) => {
            acc[p.type] = (acc[p.type] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ),
      ).sort((a, b) => b[1] - a[1])[0]?.[0] || "mais comum"
    }" para identificar oportunidades de otimização`

    return response
  }

  // Resposta para perguntas gerais ou não reconhecidas
  return `📊 **Análise Completa do Sistema de Processos**

**Visão Geral:**
- Processos Ativos: ${activeProcesses.length}
- Pregões: ${biddings.length}
- Processos Concluídos: ${completed.length}
- Processos Atrasados: ${delayedProcesses.length} (${((delayedProcesses.length / activeProcesses.length) * 100).toFixed(1)}% dos ativos)
- Processos Críticos: ${criticalProcesses.length} (${((criticalProcesses.length / activeProcesses.length) * 100).toFixed(1)}% dos ativos)

**Análise de Desempenho:**
- Tempo Médio de Conclusão: ${
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, p) => sum + (p.exitDate ? getDaysElapsed(p.arrivalDate, p.exitDate) : 0), 0) /
            completed.length,
        )
      : "N/A"
  } dias
- Responsáveis Ativos: ${Array.from(new Set([...processes, ...completed].map((p) => p.responsible))).length}
- Tipos de Processo: ${Array.from(new Set([...processes, ...completed].map((p) => p.type))).length} diferentes

**Insights Identificados:**
- ${
    criticalProcesses.length > 0
      ? `Existem ${criticalProcesses.length} processos críticos que requerem atenção imediata`
      : "Não há processos críticos no momento, indicando boa gestão de prazos"
  }
- ${(() => {
    const responsibleCounts = processes.reduce(
      (acc, p) => {
        acc[p.responsible] = (acc[p.responsible] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const maxResponsible = Object.entries(responsibleCounts).sort((a, b) => b[1] - a[1])[0]
    return maxResponsible
      ? `${maxResponsible[0]} é o responsável com maior número de processos (${maxResponsible[1]})`
      : "A distribuição de processos entre responsáveis está equilibrada"
  })()}
- ${(() => {
    const typeDelays = processes.reduce(
      (acc, p) => {
        if (!p.exitDate && getDaysElapsed(p.arrivalDate) > 30) {
          acc[p.type] = (acc[p.type] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    const maxDelayType = Object.entries(typeDelays).sort((a, b) => b[1] - a[1])[0]
    return maxDelayType
      ? `Processos do tipo "${maxDelayType[0]}" apresentam maior taxa de atraso`
      : "Não há um tipo de processo com taxa de atraso significativamente maior"
  })()}

**Recomendações:**
1. ${
    criticalProcesses.length > 0
      ? `Priorizar a resolução dos ${Math.min(3, criticalProcesses.length)} processos mais críticos`
      : "Manter o sistema atual de priorização que está funcionando bem"
  }
2. Implementar revisões periódicas para processos com mais de 25 dias
3. ${
    delayedProcesses.length > activeProcesses.length * 0.2
      ? "Considerar redistribuição de carga de trabalho entre responsáveis"
      : "Continuar com a atual distribuição de processos que está eficiente"
  }
4. Estabelecer métricas de desempenho baseadas nos tempos médios de conclusão

Posso fornecer análises mais específicas sobre qualquer aspecto do sistema. O que mais gostaria de saber?`
}

