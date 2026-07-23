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
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency, getIngredientCostPerUnit } from "@/lib/costing"
import { useIngredients } from "@/lib/data-provider"
import type { Expense, ExpenseCategory } from "@/lib/types"

export type ExpenseFormValues = Omit<Expense, "id">

const categoryItems: { label: string; value: ExpenseCategory }[] = [
  { label: "Ingredients", value: "Ingredients" },
  { label: "Rent", value: "Rent" },
  { label: "Utilities", value: "Utilities" },
  { label: "Staff", value: "Staff" },
  { label: "Other", value: "Other" },
]

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function emptyValues(): ExpenseFormValues {
  return {
    date: todayIso(),
    category: "Ingredients",
    description: "",
    amount: 0,
  }
}

function formatIngredientQuantity(value: number): string {
  if (Number.isInteger(value)) return value.toLocaleString()
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ExpenseFormValues) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <ExpenseForm
          key={String(open)}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

function ExpenseForm({
  onOpenChange,
  onSubmit,
}: {
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ExpenseFormValues) => void
}) {
  const { items: ingredients } = useIngredients()
  const [values, setValues] = React.useState<ExpenseFormValues>(emptyValues)
  const [ingredientId, setIngredientId] = React.useState<string | null>(null)
  const [ingredientQuantity, setIngredientQuantity] = React.useState(0)

  const isIngredientsCategory = values.category === "Ingredients"
  const selectedIngredient = ingredients.find(
    (ingredient) => ingredient.id === ingredientId
  )
  const hasIngredientSelected = Boolean(selectedIngredient)
  const computedIngredientAmount =
    selectedIngredient && ingredientQuantity > 0
      ? getIngredientCostPerUnit(selectedIngredient) * ingredientQuantity
      : 0

  const ingredientItems = [
    { label: "Select ingredient (optional)", value: null as string | null },
    ...ingredients.map((ingredient) => ({
      label: `${ingredient.name} (${ingredient.unit})`,
      value: ingredient.id,
    })),
  ]

  function handleCategoryChange(category: ExpenseCategory) {
    setValues((v) => ({ ...v, category }))
    if (category !== "Ingredients") {
      setIngredientId(null)
      setIngredientQuantity(0)
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (isIngredientsCategory && hasIngredientSelected) {
      if (!selectedIngredient || ingredientQuantity <= 0) return
      onSubmit({
        ...values,
        description: `${selectedIngredient.name} restock (${formatIngredientQuantity(ingredientQuantity)} ${selectedIngredient.unit})`,
        amount: computedIngredientAmount,
      })
      onOpenChange(false)
      return
    }

    if (!values.description.trim() || values.amount <= 0) return
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Add Expense</DialogTitle>
        <DialogDescription>
          Record a business expense to track your net profit.
        </DialogDescription>
      </DialogHeader>
      <FieldGroup className="py-4">
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="expense-category">Category</FieldLabel>
            <Select
              items={categoryItems}
              value={values.category}
              onValueChange={(value) =>
                handleCategoryChange(value as ExpenseCategory)
              }
            >
              <SelectTrigger id="expense-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent searchable searchPlaceholder="Search categories...">
                <SelectGroup>
                  {categoryItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="expense-date">Date</FieldLabel>
            <Input
              id="expense-date"
              type="date"
              value={values.date}
              onChange={(e) =>
                setValues((v) => ({ ...v, date: e.target.value }))
              }
              required
            />
          </Field>
        </div>

        {isIngredientsCategory && (
          <>
            <Field>
              <FieldLabel htmlFor="expense-ingredient">Ingredient</FieldLabel>
              <Select
                items={ingredientItems}
                value={ingredientId}
                onValueChange={(value) => {
                  setIngredientId(value as string | null)
                  if (!value) setIngredientQuantity(0)
                }}
              >
                <SelectTrigger id="expense-ingredient" className="w-full">
                  <SelectValue placeholder="Select ingredient (optional)" />
                </SelectTrigger>
                <SelectContent searchable searchPlaceholder="Search ingredients...">
                  <SelectGroup>
                    {ingredientItems.map((item) => (
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
              <FieldLabel htmlFor="expense-ingredient-quantity">
                Quantity
              </FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  id="expense-ingredient-quantity"
                  type="number"
                  min={0}
                  step="0.01"
                  value={ingredientQuantity || ""}
                  onChange={(e) =>
                    setIngredientQuantity(Number(e.target.value))
                  }
                  placeholder="e.g. 5000"
                  disabled={!hasIngredientSelected}
                  className="flex-1"
                />
                <span className="shrink-0 text-sm text-muted-foreground">
                  {selectedIngredient?.unit ?? "—"}
                </span>
              </div>
            </Field>
            {hasIngredientSelected && ingredientQuantity > 0 && (
              <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Amount: </span>
                <span className="font-medium font-mono">
                  {formatCurrency(computedIngredientAmount)}
                </span>
              </div>
            )}
          </>
        )}

        {(!isIngredientsCategory || !hasIngredientSelected) && (
          <>
            <Field>
              <FieldLabel htmlFor="expense-description">Description</FieldLabel>
              <Textarea
                id="expense-description"
                value={values.description}
                onChange={(e) =>
                  setValues((v) => ({ ...v, description: e.target.value }))
                }
                placeholder="e.g. Coffee beans restock (5kg)"
                required={!isIngredientsCategory || !hasIngredientSelected}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="expense-amount">Amount</FieldLabel>
              <Input
                id="expense-amount"
                type="number"
                min={0}
                step="0.01"
                value={values.amount || ""}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    amount: Number(e.target.value),
                  }))
                }
                required={!isIngredientsCategory || !hasIngredientSelected}
              />
            </Field>
          </>
        )}
      </FieldGroup>
      <DialogFooter>
        <Button type="submit">Add expense</Button>
      </DialogFooter>
    </form>
  )
}
