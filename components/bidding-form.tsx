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
import type { Bidding } from "@/types/bidding"
import { useBiddingStore } from "@/hooks/use-bidding-store"

const biddingSchema = z.object({
  seq: z.string().min(1, { message: "Sequência é obrigatória" }),
  description: z.string().min(2, { message: "Descrição é obrigatória" }),
  sei: z.string().min(2, { message: "Número SEI é obrigatório" }),
  preparation: z.string().min(2, { message: "Responsável pela elaboração é obrigatório" }),
  review: z.string().optional(),
  system: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
})

type BiddingFormValues = z.infer<typeof biddingSchema>

interface BiddingFormProps {
  bidding?: Bidding
  onSuccess?: () => void
}

export function BiddingForm({ bidding, onSuccess }: BiddingFormProps) {
  const { addBidding, updateBidding } = useBiddingStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: Partial<BiddingFormValues> = {
    seq: bidding?.seq || "",
    description: bidding?.description || "",
    sei: bidding?.sei || "",
    preparation: bidding?.preparation || "",
    review: bidding?.review || "",
    system: bidding?.system || "",
    status: bidding?.status || "",
    notes: bidding?.notes || "",
  }

  const form = useForm<BiddingFormValues>({
    resolver: zodResolver(biddingSchema),
    defaultValues,
  })

  async function onSubmit(data: BiddingFormValues) {
    setIsSubmitting(true)
    try {
      if (bidding?.id) {
        await updateBidding({
          ...bidding,
          ...data,
        })
      } else {
        await addBidding({
          id: Date.now().toString(),
          ...data,
        })
      }
      onSuccess?.()
    } catch (error) {
      console.error("Erro ao salvar pregão:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="seq"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sequência</FormLabel>
                <FormControl>
                  <Input placeholder="Número de sequência" {...field} />
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

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Descrição do pregão" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="preparation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Elaboração</FormLabel>
                <FormControl>
                  <Input placeholder="Responsável pela elaboração" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="review"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Revisão</FormLabel>
                <FormControl>
                  <Input placeholder="Responsável pela revisão" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="system"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sistema</FormLabel>
                <FormControl>
                  <Input placeholder="Responsável pelo sistema" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="AUTORIZADO">AUTORIZADO</SelectItem>
                  <SelectItem value="EM ANDAMENTO">EM ANDAMENTO</SelectItem>
                  <SelectItem value="SUSPENSO">SUSPENSO</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : bidding?.id ? "Atualizar Pregão" : "Adicionar Pregão"}
        </Button>
      </form>
    </Form>
  )
}

