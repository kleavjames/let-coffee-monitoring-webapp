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
  const [values, setValues] = React.useState<ExpenseFormValues>(emptyValues)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
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
                setValues((v) => ({
                  ...v,
                  category: value as ExpenseCategory,
                }))
              }
            >
              <SelectTrigger id="expense-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
        <Field>
          <FieldLabel htmlFor="expense-description">Description</FieldLabel>
          <Textarea
            id="expense-description"
            value={values.description}
            onChange={(e) =>
              setValues((v) => ({ ...v, description: e.target.value }))
            }
            placeholder="e.g. Coffee beans restock (5kg)"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="expense-amount">Amount</FieldLabel>
          <Input
            id="expense-amount"
            type="number"
            min={0}
            step="0.01"
            value={values.amount}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                amount: Number(e.target.value),
              }))
            }
            required
          />
        </Field>
      </FieldGroup>
      <DialogFooter>
        <Button type="submit">Add expense</Button>
      </DialogFooter>
    </form>
  )
}
