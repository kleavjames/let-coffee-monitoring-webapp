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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency, getIngredientCostPerUnit } from "@/lib/costing"
import type { Ingredient, IngredientUnit } from "@/lib/types"

const unitItems: { label: string; value: IngredientUnit }[] = [
  { label: "Grams (g)", value: "g" },
  { label: "Kilograms (kg)", value: "kg" },
  { label: "Milliliters (ml)", value: "ml" },
  { label: "Liters (l)", value: "l" },
  { label: "Pieces (pcs)", value: "pcs" },
  { label: "Pack", value: "pack" },
]

export type IngredientFormValues = Omit<Ingredient, "id">

const emptyValues: IngredientFormValues = {
  name: "",
  unit: "g",
  purchasePrice: 0,
  packageQuantity: 0,
}

export function IngredientFormDialog({
  open,
  onOpenChange,
  ingredient,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  ingredient?: Ingredient | null
  onSubmit: (values: IngredientFormValues) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <IngredientForm
          key={`${open}-${ingredient?.id ?? "new"}`}
          ingredient={ingredient}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

function IngredientForm({
  ingredient,
  onOpenChange,
  onSubmit,
}: {
  ingredient?: Ingredient | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: IngredientFormValues) => void
}) {
  const [values, setValues] = React.useState<IngredientFormValues>(() =>
    ingredient
      ? {
          name: ingredient.name,
          unit: ingredient.unit,
          purchasePrice: ingredient.purchasePrice,
          packageQuantity: ingredient.packageQuantity,
          stockQuantity: ingredient.stockQuantity,
        }
      : emptyValues
  )
  const [stockInput, setStockInput] = React.useState(() =>
    ingredient?.stockQuantity !== undefined
      ? String(ingredient.stockQuantity)
      : ""
  )

  const isEditing = Boolean(ingredient)

  const costPerUnit =
    values.packageQuantity > 0
      ? getIngredientCostPerUnit(values)
      : null

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!values.name.trim() || values.purchasePrice <= 0) return
    if (values.packageQuantity <= 0) return

    const stockQuantity =
      stockInput.trim() === "" ? undefined : Number(stockInput)

    onSubmit({
      ...values,
      stockQuantity:
        stockQuantity !== undefined && !Number.isNaN(stockQuantity)
          ? stockQuantity
          : undefined,
    })
    onOpenChange(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Ingredient" : "Add Ingredient"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update how you buy this ingredient. Cost per unit is calculated automatically."
            : "Enter what you paid and how much you got. We'll calculate the cost per unit for recipes."}
        </DialogDescription>
      </DialogHeader>
      <FieldGroup className="py-4">
        <Field>
          <FieldLabel htmlFor="ingredient-name">Name</FieldLabel>
          <Input
            id="ingredient-name"
            value={values.name}
            onChange={(e) =>
              setValues((v) => ({ ...v, name: e.target.value }))
            }
            placeholder="e.g. Coffee Beans"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="ingredient-unit">Recipe unit</FieldLabel>
          <Select
            items={unitItems}
            value={values.unit}
            onValueChange={(value) =>
              setValues((v) => ({
                ...v,
                unit: value as IngredientUnit,
              }))
            }
          >
            <SelectTrigger id="ingredient-unit" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {unitItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>
            How this ingredient is measured in product recipes.
          </FieldDescription>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="ingredient-purchase-price">
              Purchase price
            </FieldLabel>
            <Input
              id="ingredient-purchase-price"
              type="number"
              min={0}
              step="0.01"
              value={values.purchasePrice || ""}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  purchasePrice: Number(e.target.value),
                }))
              }
              placeholder="e.g. 850"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="ingredient-package-quantity">
              Package size
            </FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                id="ingredient-package-quantity"
                type="number"
                min={0}
                step="0.01"
                value={values.packageQuantity || ""}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    packageQuantity: Number(e.target.value),
                  }))
                }
                placeholder="e.g. 1000"
                required
                className="flex-1"
              />
              <span className="shrink-0 text-sm text-muted-foreground">
                {values.unit}
              </span>
            </div>
          </Field>
        </div>
        {costPerUnit !== null && (
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Cost: </span>
            <span className="font-medium">
              {formatCurrency(costPerUnit)} / {values.unit}
            </span>
          </div>
        )}
        <Field>
          <FieldLabel htmlFor="ingredient-stock">
            Stock on hand{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </FieldLabel>
          <div className="flex items-center gap-2">
            <Input
              id="ingredient-stock"
              type="number"
              min={0}
              step="1"
              value={stockInput}
              onChange={(e) => setStockInput(e.target.value)}
              placeholder="Leave blank if not tracking"
              className="flex-1"
            />
            <span className="shrink-0 text-sm text-muted-foreground">
              {values.unit}
            </span>
          </div>
        </Field>
      </FieldGroup>
      <DialogFooter>
        <Button type="submit">
          {isEditing ? "Save changes" : "Add ingredient"}
        </Button>
      </DialogFooter>
    </form>
  )
}
