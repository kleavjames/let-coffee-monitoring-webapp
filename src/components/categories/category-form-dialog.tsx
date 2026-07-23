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
import type { ProductCategory } from "@/lib/types"

export type CategoryFormValues = Omit<ProductCategory, "id">

const emptyValues: CategoryFormValues = {
  name: "",
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: ProductCategory | null
  onSubmit: (values: CategoryFormValues) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <CategoryForm
          key={`${open}-${category?.id ?? "new"}`}
          category={category}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

function CategoryForm({
  category,
  onOpenChange,
  onSubmit,
}: {
  category?: ProductCategory | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CategoryFormValues) => void
}) {
  const [values, setValues] = React.useState<CategoryFormValues>(() =>
    category ? { name: category.name } : emptyValues
  )

  const isEditing = Boolean(category)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!values.name.trim()) return
    onSubmit({ name: values.name.trim() })
    onOpenChange(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Category" : "Add Category"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update the category name."
            : "Create a category to organize your products."}
        </DialogDescription>
      </DialogHeader>
      <FieldGroup className="py-4">
        <Field>
          <FieldLabel htmlFor="category-name">Name</FieldLabel>
          <Input
            id="category-name"
            value={values.name}
            onChange={(e) =>
              setValues((current) => ({ ...current, name: e.target.value }))
            }
            placeholder="e.g. Hot Coffee"
            required
          />
        </Field>
      </FieldGroup>
      <DialogFooter>
        <Button type="submit">
          {isEditing ? "Save changes" : "Add category"}
        </Button>
      </DialogFooter>
    </form>
  )
}
