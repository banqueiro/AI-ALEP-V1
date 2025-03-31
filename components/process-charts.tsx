"use client"

import type { Process } from "@/types/process"
import type { Bidding } from "@/types/bidding"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface ProcessChartsProps {
  processes: Process[]
  biddings: Bidding[]
  completed: Process[]
}

export function ProcessCharts({ processes, biddings, completed }: ProcessChartsProps) {
  // Dados para o gráfico de tipos de processos
  const processTypes = processes.reduce(
    (acc, process) => {
      const type = process.type
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const typeData = Object.entries(processTypes).map(([name, value]) => ({
    name: name.replace(/^\d+\./, ""), // Remove o número do início para melhor visualização
    value,
  }))

  // Dados para o gráfico de modalidades
  const processModals = [...processes, ...completed].reduce(
    (acc, process) => {
      const modal = process.modal || "Não definido"
      acc[modal] = (acc[modal] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const modalData = Object.entries(processModals).map(([name, value]) => ({
    name,
    value,
  }))

  // Cores para os gráficos
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Análise de Processos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-[200px]">
          <h3 className="text-sm font-medium mb-2">Distribuição por Tipo de Processo</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={typeData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-[200px]">
          <h3 className="text-sm font-medium mb-2">Distribuição por Modalidade</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={modalData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {modalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

