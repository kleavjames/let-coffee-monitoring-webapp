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

type SaleFormState = Omit<SaleFormValues, "unitPrice">

function todayIso() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function emptyValues(): SaleFormState {
  return { date: todayIso(), productId: "", quantity: 1 }
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
        <SaleForm
          key={String(open)}
          open={open}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

function SaleForm({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: SaleFormValues) => void
}) {
  const { items: products } = useProducts()
  const [values, setValues] = React.useState<SaleFormState>(emptyValues)

  React.useEffect(() => {
    if (open) setValues(emptyValues())
  }, [open])

  const activeProducts = products.filter((p) => p.status === "active")
  const selectedProduct = products.find((p) => p.id === values.productId)
  const unitPrice = selectedProduct?.price ?? 0
  const total = values.quantity * unitPrice

  const productItems = [
    { label: "Select product", value: null as string | null },
    ...activeProducts.map((p) => ({
      label: `${p.name} · ${formatCurrency(p.price)}`,
      value: p.id,
    })),
  ]

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedProduct || values.quantity <= 0) return
    onSubmit({
      ...values,
      unitPrice: selectedProduct.price,
    })
    onOpenChange(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Log a Sale</DialogTitle>
        <DialogDescription>
          Record a product sale for a specific day. Price comes from the
          product.
        </DialogDescription>
      </DialogHeader>
      <FieldGroup className="py-4">
        <Field>
          <FieldLabel htmlFor="sale-product">Product</FieldLabel>
          <Select
            items={productItems}
            value={values.productId || null}
            onValueChange={(value) =>
              setValues((v) => ({
                ...v,
                productId: (value as string | null) ?? "",
              }))
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
          <span className="text-muted-foreground">
            {selectedProduct
              ? `${formatCurrency(unitPrice)} × ${values.quantity}`
              : "Total"}
          </span>
          <span className="font-medium">{formatCurrency(total)}</span>
        </div>
      </FieldGroup>
      <DialogFooter>
        <Button type="submit" disabled={!selectedProduct || values.quantity <= 0}>
          Log sale
        </Button>
      </DialogFooter>
    </form>
  )
}
