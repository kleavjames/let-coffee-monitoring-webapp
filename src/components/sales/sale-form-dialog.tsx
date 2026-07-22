"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/costing"
import { useProducts } from "@/lib/data-provider"
import type { Sale } from "@/lib/types"

export type SaleFormValues = Omit<Sale, "id">

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function emptyValues(): SaleFormValues {
  return { date: todayIso(), productId: "", quantity: 1, unitPrice: 0 }
}

export function SaleFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: SaleFormValues) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <SaleForm key={String(open)} onOpenChange={onOpenChange} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  )
}

function SaleForm({
  onOpenChange,
  onSubmit,
}: {
  onOpenChange: (open: boolean) => void
  onSubmit: (values: SaleFormValues) => void
}) {
  const { items: products } = useProducts()
  const [values, setValues] = React.useState<SaleFormValues>(emptyValues)

  const activeProducts = products.filter((p) => p.status === "active")
  const productItems = [
    { label: "Select product", value: null as string | null },
    ...activeProducts.map((p) => ({ label: p.name, value: p.id })),
  ]

  const total = values.quantity * values.unitPrice

  function handleProductChange(productId: string | null) {
    const product = products.find((p) => p.id === productId)
    setValues((v) => ({
      ...v,
      productId: productId ?? "",
      unitPrice: product ? product.price : v.unitPrice,
    }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!values.productId || values.quantity <= 0) return
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Log a Sale</DialogTitle>
        <DialogDescription>
          Record a product sale for a specific day.
        </DialogDescription>
      </DialogHeader>
      <FieldGroup className="py-4">
        <Field>
          <FieldLabel htmlFor="sale-product">Product</FieldLabel>
          <Select
            items={productItems}
            value={values.productId || null}
            onValueChange={(value) =>
              handleProductChange(value as string | null)
            }
          >
            <SelectTrigger id="sale-product" className="w-full">
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {productItems.map((item) => (
                  <SelectItem
                    key={item.value ?? "placeholder"}
                    value={item.value}
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="sale-quantity">Quantity</FieldLabel>
            <Input
              id="sale-quantity"
              type="number"
              min={1}
              step="1"
              value={values.quantity}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  quantity: Number(e.target.value),
                }))
              }
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="sale-unit-price">Unit price</FieldLabel>
            <Input
              id="sale-unit-price"
              type="number"
              min={0}
              step="0.01"
              value={values.unitPrice}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  unitPrice: Number(e.target.value),
                }))
              }
              required
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="sale-date">Date</FieldLabel>
          <Input
            id="sale-date"
            type="date"
            value={values.date}
            onChange={(e) =>
              setValues((v) => ({ ...v, date: e.target.value }))
            }
            required
          />
        </Field>
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-medium">{formatCurrency(total)}</span>
        </div>
      </FieldGroup>
      <DialogFooter>
        <Button type="submit">Log sale</Button>
      </DialogFooter>
    </form>
  )
}
