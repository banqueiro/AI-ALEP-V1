"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import type { Process } from "@/types/process"
import { useProcessStore } from "@/hooks/use-process-store"

const processSchema = z.object({
  name: z.string().min(2, { message: "Nome do objeto é obrigatório" }),
  sei: z.string().min(2, { message: "Número SEI é obrigatório" }),
  responsible: z.string().min(2, { message: "Responsável é obrigatório" }),
  type: z.string().min(1, { message: "Tipo de processo é obrigatório" }),
  modal: z.string().optional(),
  arrivalDate: z.date({ required_error: "Data de chegada é obrigatória" }),
  exitDate: z.date().optional().nullable(),
  observations: z.string().optional(),
  authorized: z.string().optional(),
})

type ProcessFormValues = z.infer<typeof processSchema>

interface ProcessFormProps {
  process?: Process
  onSuccess?: () => void
  completeMode?: boolean
}

export function ProcessForm({ process, onSuccess, completeMode = false }: ProcessFormProps) {
  const { addProcess, updateProcess } = useProcessStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: Partial<ProcessFormValues> = {
    name: process?.name || "",
    sei: process?.sei || "",
    responsible: process?.responsible || "",
    type: process?.type || "",
    modal: process?.modal || "",
    arrivalDate: process?.arrivalDate ? new Date(process.arrivalDate) : new Date(),
    exitDate: process?.exitDate ? new Date(process.exitDate) : null,
    observations: process?.observations || "",
    authorized: process?.authorized || "",
  }

  const form = useForm<ProcessFormValues>({
    resolver: zodResolver(processSchema),
    defaultValues,
  })

  async function onSubmit(data: ProcessFormValues) {
    setIsSubmitting(true)
    try {
      if (process?.id) {
        await updateProcess({
          ...process,
          ...data,
          arrivalDate: data.arrivalDate.toISOString(),
          exitDate: data.exitDate ? data.exitDate.toISOString() : null,
        })
      } else {
        await addProcess({
          id: Date.now().toString(),
          ...data,
          arrivalDate: data.arrivalDate.toISOString(),
          exitDate: data.exitDate ? data.exitDate.toISOString() : null,
        })
      }
      onSuccess?.()
    } catch (error) {
      console.error("Erro ao salvar processo:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        {completeMode ? (
          <>
            <FormField
              control={form.control}
              name="exitDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Conclusão</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? formatDate(field.value) : <span>Selecione a data</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(process?.arrivalDate || "") || date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações de Conclusão</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione observações sobre a conclusão do processo"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objeto</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome/objeto do processo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sei"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número SEI</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de referência SEI" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="responsible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <FormControl>
                      <Input placeholder="Pessoa responsável" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Processo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de processo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1.CÁLCULO">1.CÁLCULO</SelectItem>
                        <SelectItem value="2.COTAÇÃO">2.COTAÇÃO</SelectItem>
                        <SelectItem value="3.AGENTE - FASE INTERNA">3.AGENTE - FASE INTERNA</SelectItem>
                        <SelectItem value="4.PREGOEIRO">4.PREGOEIRO</SelectItem>
                        <SelectItem value="5.PREGOEIRO - LICITADO">5.PREGOEIRO - LICITADO</SelectItem>
                        <SelectItem value="6.TRAMITAÇÃO EXTERNA">6.TRAMITAÇÃO EXTERNA</SelectItem>
                        <SelectItem value="7.AUTORIZADO">7.AUTORIZADO</SelectItem>
                        <SelectItem value="8.PNCP">8.PNCP</SelectItem>
                        <SelectItem value="X.AUTORIZADO">X.AUTORIZADO</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="modal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalidade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a modalidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADITIVO">ADITIVO</SelectItem>
                        <SelectItem value="DISP/INEX">DISP/INEX</SelectItem>
                        <SelectItem value="LICITAR">LICITAR</SelectItem>
                        <SelectItem value="OUT">OUT</SelectItem>
                        <SelectItem value="CARONA">CARONA</SelectItem>
                        <SelectItem value="ADM">ADM</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="arrivalDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Chegada</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? formatDate(field.value) : <span>Selecione a data</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observações adicionais" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authorized"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autorizado Por</FormLabel>
                  <FormControl>
                    <Input placeholder="Quem autorizou este processo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!process?.id && (
              <FormField
                control={form.control}
                name="exitDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Saída (se concluído)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? formatDate(field.value) : <span>Selecione a data (opcional)</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : process?.id ? "Atualizar Processo" : "Adicionar Processo"}
        </Button>
      </form>
    </Form>
  )
}

