"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { formatCurrency, getSaleTotal } from "@/lib/costing"
import { useCategories, useProducts } from "@/lib/data-provider"
import type { Product, Sale } from "@/lib/types"
import { cn } from "@/lib/utils"

export type SaleFormValues = Omit<Sale, "id">

type SaleLineDraft = {
  key: string
  productId: string
  quantity: number
  amount?: number
}

function todayIso() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function createLineDraft(): SaleLineDraft {
  return {
    key: crypto.randomUUID(),
    productId: "",
    quantity: 1,
  }
}

function getCategoryName(
  product: Product,
  categories: { id: string; name: string }[]
) {
  return categories.find((c) => c.id === product.categoryId)?.name ?? "Uncategorized"
}

function getLineTotal(
  line: SaleLineDraft,
  unitPrice: number
): number {
  if (line.amount !== undefined && line.amount > 0) {
    return line.amount
  }
  return line.quantity * unitPrice
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
  onSubmit: (values: SaleFormValues[]) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,800px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
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
  onSubmit: (values: SaleFormValues[]) => void
}) {
  const { items: products } = useProducts()
  const { items: categories } = useCategories()
  const [date, setDate] = React.useState(todayIso)
  const [lines, setLines] = React.useState<SaleLineDraft[]>(() => [
    createLineDraft(),
  ])

  const sellableProducts = products.filter(
    (p) => p.status === "active" && !p.special && p.price != null && p.price > 0
  )

  const productItems = sellableProducts.map((p) => ({
    value: p.id,
    name: p.name,
    categoryName: getCategoryName(p, categories),
    price: p.price!,
  }))

  const validLines = lines.flatMap((line) => {
    const product = sellableProducts.find((item) => item.id === line.productId)
    if (!product || line.quantity <= 0 || product.price == null) {
      return []
    }

    return [
      {
        date,
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: product.price,
        ...(line.amount !== undefined && line.amount > 0
          ? { amount: line.amount }
          : {}),
      } satisfies SaleFormValues,
    ]
  })

  const grandTotal = validLines.reduce((sum, sale) => sum + getSaleTotal(sale), 0)

  function updateLine(key: string, patch: Partial<SaleLineDraft>) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line))
    )
  }

  function addLine() {
    setLines((current) => [...current, createLineDraft()])
  }

  function removeLine(key: string) {
    setLines((current) => {
      if (current.length === 1) {
        return [createLineDraft()]
      }
      return current.filter((line) => line.key !== key)
    })
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (validLines.length === 0) return
    onSubmit(validLines)
    onOpenChange(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <DialogHeader className="shrink-0 px-4 pt-4">
        <DialogTitle>Log a Sale</DialogTitle>
        <DialogDescription>
          Add one or more products for the same day. Price comes from each
          product unless you override the amount.
        </DialogDescription>
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
        <FieldGroup className="py-4">
        <Field>
          <FieldLabel htmlFor="sale-date">Date</FieldLabel>
          <Input
            id="sale-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Field>

        <div className="flex flex-col gap-3">
          {lines.map((line, index) => {
            const selectedProduct = sellableProducts.find(
              (product) => product.id === line.productId
            )
            const unitPrice = selectedProduct?.price ?? 0
            const computedTotal = line.quantity * unitPrice
            const lineTotal = getLineTotal(line, unitPrice)

            return (
              <div
                key={line.key}
                className="rounded-lg border border-border/70 p-3"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Product {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeLine(line.key)}
                    aria-label={`Remove product ${index + 1}`}
                  >
                    <Trash2 />
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor={`sale-product-${line.key}`}>
                      Product
                    </FieldLabel>
                    <Select
                      value={line.productId || null}
                      onValueChange={(value) =>
                        updateLine(line.key, {
                          productId: (value as string | null) ?? "",
                          amount: undefined,
                        })
                      }
                    >
                      <SelectTrigger
                        id={`sale-product-${line.key}`}
                        className="h-auto min-h-10 w-full py-2.5 *:data-[slot=select-value]:line-clamp-none *:data-[slot=select-value]:whitespace-normal"
                      >
                        <SelectValue placeholder="Select product">
                          {selectedProduct ? (
                            <SaleProductOption
                              inTrigger
                              name={selectedProduct.name}
                              categoryName={getCategoryName(
                                selectedProduct,
                                categories
                              )}
                              price={selectedProduct.price!}
                            />
                          ) : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent
                        searchable
                        searchPlaceholder="Search products..."
                      >
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
                    <FieldLabel htmlFor={`sale-quantity-${line.key}`}>
                      Quantity
                    </FieldLabel>
                    <Input
                      id={`sale-quantity-${line.key}`}
                      type="number"
                      min={1}
                      step="1"
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(line.key, {
                          quantity: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor={`sale-amount-${line.key}`}>
                      Amount (optional)
                    </FieldLabel>
                    <Input
                      id={`sale-amount-${line.key}`}
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.amount ?? ""}
                      onChange={(e) => {
                        const next = e.target.value
                        updateLine(line.key, {
                          amount: next === "" ? undefined : Number(next),
                        })
                      }}
                      placeholder={
                        selectedProduct
                          ? `Calculated: ${formatCurrency(computedTotal)}`
                          : "Override line amount"
                      }
                    />
                  </Field>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    {selectedProduct
                      ? line.amount !== undefined && line.amount > 0
                        ? "Custom amount"
                        : `${formatCurrency(unitPrice)} × ${line.quantity}`
                      : "Line total"}
                  </span>
                  <span className="font-medium font-mono">
                    {formatCurrency(lineTotal)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addLine}
        >
          <Plus data-icon="inline-start" />
          Add product
        </Button>
        </FieldGroup>
      </div>
      <div className="shrink-0 border-t bg-popover px-4 py-4">
        <div className="mb-3 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
          <span className="text-muted-foreground">
            {validLines.length}{" "}
            {validLines.length === 1 ? "product" : "products"} · Grand total
          </span>
          <span className="font-medium font-mono">
            {formatCurrency(grandTotal)}
          </span>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={validLines.length === 0}>
            Log {validLines.length === 1 ? "sale" : "sales"}
          </Button>
        </div>
      </div>
    </form>
  )
}
