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
import { useCategories, useProducts } from "@/lib/data-provider"
import type { Product, Sale } from "@/lib/types"
import { cn } from "@/lib/utils"

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

function getCategoryName(
  product: Product,
  categories: { id: string; name: string }[]
) {
  return categories.find((c) => c.id === product.categoryId)?.name ?? "Uncategorized"
}

function SaleProductOption({
  name,
  categoryName,
  price,
  inTrigger = false,
}: {
  name: string
  categoryName: string
  price: number
  inTrigger?: boolean
}) {
  return (
    <span
      className={cn(
        "flex min-w-0 flex-1 items-center",
        inTrigger ? "gap-2" : "gap-3 py-0.5"
      )}
    >
      <span className="truncate font-medium text-foreground">{name}</span>
      <span
        className="shrink-0 text-muted-foreground/35"
        aria-hidden
      >
        •
      </span>
      <span className="shrink-0 text-xs text-muted-foreground">{categoryName}</span>
      <span
        className="shrink-0 text-muted-foreground/35"
        aria-hidden
      >
        •
      </span>
      <span className="shrink-0 font-mono text-xs font-medium tabular-nums text-muted-foreground">
        {formatCurrency(price)}
      </span>
    </span>
  )
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
      <DialogContent className="sm:max-w-lg">
        <SaleForm
          key={String(open)}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
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
  const { items: categories } = useCategories()
  const [values, setValues] = React.useState<SaleFormState>(emptyValues)

  const sellableProducts = products.filter(
    (p) => p.status === "active" && !p.special && p.price != null && p.price > 0
  )
  const selectedProduct = sellableProducts.find((p) => p.id === values.productId)
  const unitPrice = selectedProduct?.price ?? 0
  const total = values.quantity * unitPrice

  const productItems = sellableProducts.map((p) => ({
    value: p.id,
    name: p.name,
    categoryName: getCategoryName(p, categories),
    price: p.price!,
  }))

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedProduct || values.quantity <= 0 || selectedProduct.price == null) return
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
            value={values.productId || null}
            onValueChange={(value) =>
              setValues((v) => ({
                ...v,
                productId: (value as string | null) ?? "",
              }))
            }
          >
            <SelectTrigger
              id="sale-product"
              className="h-auto min-h-10 w-full py-2.5 *:data-[slot=select-value]:line-clamp-none *:data-[slot=select-value]:whitespace-normal"
            >
              <SelectValue placeholder="Select product">
                {selectedProduct ? (
                  <SaleProductOption
                    inTrigger
                    name={selectedProduct.name}
                    categoryName={getCategoryName(selectedProduct, categories)}
                    price={selectedProduct.price!}
                  />
                ) : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent searchable searchPlaceholder="Search products..." className="max-h-72">
              <SelectGroup className="p-1.5">
                {productItems.map((item) => (
                  <SelectItem
                    key={item.value}
                    value={item.value}
                    className="py-2.5 pl-2.5 pr-8"
                    searchValue={`${item.name} ${item.categoryName} ${formatCurrency(item.price)}`}
                  >
                    <SaleProductOption
                      name={item.name}
                      categoryName={item.categoryName}
                      price={item.price}
                    />
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
