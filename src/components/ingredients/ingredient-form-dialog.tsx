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
import type { Ingredient, IngredientUnit } from "@/lib/types"

const unitItems: { label: string; value: IngredientUnit }[] = [
  { label: "Grams (g)", value: "g" },
  { label: "Kilograms (kg)", value: "kg" },
  { label: "Milliliters (ml)", value: "ml" },
  { label: "Liters (l)", value: "l" },
  { label: "Pieces (pcs)", value: "pcs" },
]

export type IngredientFormValues = Omit<Ingredient, "id">

const emptyValues: IngredientFormValues = {
  name: "",
  unit: "g",
  costPerUnit: 0,
  stockQuantity: 0,
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
          costPerUnit: ingredient.costPerUnit,
          stockQuantity: ingredient.stockQuantity,
        }
      : emptyValues
  )

  const isEditing = Boolean(ingredient)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!values.name.trim()) return
    onSubmit(values)
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
            ? "Update the ingredient details below."
            : "Add a new ingredient to use in product recipes."}
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
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="ingredient-unit">Unit</FieldLabel>
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
          </Field>
          <Field>
            <FieldLabel htmlFor="ingredient-cost">Cost per unit</FieldLabel>
            <Input
              id="ingredient-cost"
              type="number"
              min={0}
              step="0.01"
              value={values.costPerUnit}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  costPerUnit: Number(e.target.value),
                }))
              }
              required
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="ingredient-stock">Stock quantity</FieldLabel>
          <Input
            id="ingredient-stock"
            type="number"
            min={0}
            step="1"
            value={values.stockQuantity}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                stockQuantity: Number(e.target.value),
              }))
            }
            required
          />
          <FieldDescription>
            Current quantity on hand, in the unit selected above.
          </FieldDescription>
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
