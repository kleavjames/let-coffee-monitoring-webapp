"use client"

import * as React from "react"
import { Plus, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
  FieldGroup,
  FieldLabel,
  FieldSeparator,
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
import {
  computeMarginPercent,
  computeProductCost,
  computeRecipeItemCost,
  formatCurrency,
} from "@/lib/costing"
import { useIngredients } from "@/lib/data-provider"
import type {
  Product,
  ProductStatus,
  RecipeDisplayUnit,
  RecipeItem,
} from "@/lib/types"
import {
  formatRecipeQuantity,
  getDefaultRecipeUnit,
  getRecipeUnitOptions,
} from "@/lib/units"

export type ProductFormValues = Omit<Product, "id">

const emptyValues: ProductFormValues = {
  name: "",
  category: "",
  price: 0,
  status: "active",
  recipe: [],
}

const statusItems: { label: string; value: ProductStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

const recipeUnitLabels: Record<RecipeDisplayUnit, string> = {
  g: "g",
  ml: "ml",
  oz: "oz",
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSubmit: (values: ProductFormValues) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <ProductForm
          key={`${open}-${product?.id ?? "new"}`}
          product={product}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

function ProductForm({
  product,
  onOpenChange,
  onSubmit,
}: {
  product?: Product | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ProductFormValues) => void
}) {
  const { items: ingredients } = useIngredients()
  const [values, setValues] = React.useState<ProductFormValues>(() =>
    product
      ? {
          name: product.name,
          category: product.category,
          price: product.price,
          status: product.status,
          recipe: product.recipe,
        }
      : emptyValues
  )
  const [pickerIngredientId, setPickerIngredientId] = React.useState<
    string | null
  >(null)
  const [pickerQuantity, setPickerQuantity] = React.useState(0)
  const [pickerUnit, setPickerUnit] = React.useState<RecipeDisplayUnit>("g")

  const isEditing = Boolean(product)

  const pickerIngredient = ingredients.find(
    (ingredient) => ingredient.id === pickerIngredientId
  )
  const pickerUnitOptions = pickerIngredient
    ? getRecipeUnitOptions(pickerIngredient.unit)
    : (["g", "ml", "oz"] as RecipeDisplayUnit[])

  const pickerUnitItems = pickerUnitOptions.map((unit) => ({
    label: recipeUnitLabels[unit],
    value: unit,
  }))

  const availableIngredients = ingredients.filter(
    (ingredient) =>
      !values.recipe.some((item) => item.ingredientId === ingredient.id)
  )

  const ingredientPickerItems = [
    { label: "Select ingredient", value: null as string | null },
    ...availableIngredients.map((ingredient) => ({
      label: `${ingredient.name} (${ingredient.unit})`,
      value: ingredient.id,
    })),
  ]

  const totalCost = computeProductCost(values, ingredients)
  const marginPercent = computeMarginPercent(values, ingredients)

  function handleAddRecipeItem() {
    if (!pickerIngredientId || pickerQuantity <= 0 || !pickerIngredient) return
    const newItem: RecipeItem = {
      ingredientId: pickerIngredientId,
      quantity: pickerQuantity,
      ...(pickerIngredient.unit !== "pcs" && { unit: pickerUnit }),
    }
    setValues((v) => ({ ...v, recipe: [...v.recipe, newItem] }))
    setPickerIngredientId(null)
    setPickerQuantity(0)
    setPickerUnit("g")
  }

  function handlePickerIngredientChange(ingredientId: string | null) {
    setPickerIngredientId(ingredientId)
    if (!ingredientId) return

    const ingredient = ingredients.find((item) => item.id === ingredientId)
    if (!ingredient) return

    const defaultUnit = getDefaultRecipeUnit(ingredient.unit)
    if (defaultUnit) setPickerUnit(defaultUnit)
  }

  function handleRemoveRecipeItem(ingredientId: string) {
    setValues((v) => ({
      ...v,
      recipe: v.recipe.filter((item) => item.ingredientId !== ingredientId),
    }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!values.name.trim() || !values.category.trim()) return
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update the product, its price, and its recipe."
            : "Add a new product to sell, along with its recipe."}
        </DialogDescription>
      </DialogHeader>
      <FieldGroup className="py-4">
        <Field>
          <FieldLabel htmlFor="product-name">Name</FieldLabel>
          <Input
            id="product-name"
            value={values.name}
            onChange={(e) =>
              setValues((v) => ({ ...v, name: e.target.value }))
            }
            placeholder="e.g. Cafe Latte"
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="product-category">Category</FieldLabel>
            <Input
              id="product-category"
              value={values.category}
              onChange={(e) =>
                setValues((v) => ({ ...v, category: e.target.value }))
              }
              placeholder="e.g. Hot Coffee"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="product-price">Price</FieldLabel>
            <Input
              id="product-price"
              type="number"
              min={0}
              step="0.01"
              value={values.price}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  price: Number(e.target.value),
                }))
              }
              required
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="product-status">Status</FieldLabel>
          <Select
            items={statusItems}
            value={values.status}
            onValueChange={(value) =>
              setValues((v) => ({
                ...v,
                status: value as ProductStatus,
              }))
            }
          >
            <SelectTrigger id="product-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {statusItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <FieldSeparator>Recipe</FieldSeparator>

        <Field>
          <FieldLabel>Ingredients</FieldLabel>
          {values.recipe.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No ingredients added yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {values.recipe.map((item) => {
                const ingredient = ingredients.find(
                  (i) => i.id === item.ingredientId
                )
                if (!ingredient) return null
                return (
                  <div
                    key={item.ingredientId}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm"
                  >
                    <span className="font-medium">{ingredient.name}</span>
                    <span className="text-muted-foreground">
                      {formatRecipeQuantity(item, ingredient.unit)} ·{" "}
                      {formatCurrency(computeRecipeItemCost(item, ingredient))}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        handleRemoveRecipeItem(item.ingredientId)
                      }
                    >
                      <X />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-2 flex items-end gap-2">
            <div className="flex-1">
              <Select
                items={ingredientPickerItems}
                value={pickerIngredientId}
                onValueChange={(value) =>
                  handlePickerIngredientChange(value as string | null)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select ingredient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ingredientPickerItems.map((item) => (
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
            </div>
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="Qty"
              className="w-20"
              value={pickerQuantity || ""}
              onChange={(e) => setPickerQuantity(Number(e.target.value))}
            />
            {pickerUnitOptions.length > 0 && (
              <Select
                items={pickerUnitItems}
                value={pickerUnit}
                onValueChange={(value) =>
                  setPickerUnit(value as RecipeDisplayUnit)
                }
              >
                <SelectTrigger className="w-18">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {pickerUnitItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!pickerIngredientId || pickerQuantity <= 0}
              onClick={handleAddRecipeItem}
            >
              <Plus />
              <span className="sr-only">Add ingredient</span>
            </Button>
          </div>
        </Field>

        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Est. cost</span>
          <span className="font-medium">{formatCurrency(totalCost)}</span>
          <span className="text-muted-foreground">Margin</span>
          <Badge variant={marginPercent >= 0 ? "secondary" : "destructive"}>
            {marginPercent.toFixed(0)}%
          </Badge>
        </div>
      </FieldGroup>
      <DialogFooter>
        <Button type="submit">
          {isEditing ? "Save changes" : "Add product"}
        </Button>
      </DialogFooter>
    </form>
  )
}
