"use client"

import * as React from "react"
import { Plus, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { cn } from "@/lib/utils"
import {
  computeMarginPercent,
  computeProductCost,
  computeProductMargin,
  computeProjectedPrices,
  computeRecipeItemCost,
  formatCurrency,
} from "@/lib/costing"
import { useIngredients } from "@/lib/data-provider"
import type {
  Ingredient,
  Product,
  ProductStatus,
  RecipeDisplayUnit,
  RecipeItem,
} from "@/lib/types"
import {
  getDefaultRecipeUnit,
  getRecipeUnitOptions,
  isCountUnit,
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
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-4xl">
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
  const margin = computeProductMargin(values, ingredients)
  const marginPercent = computeMarginPercent(values, ingredients)
  const projectedPrices = computeProjectedPrices(totalCost)

  function handleAddRecipeItem() {
    if (!pickerIngredientId || pickerQuantity <= 0 || !pickerIngredient) return
    const newItem: RecipeItem = {
      ingredientId: pickerIngredientId,
      quantity: pickerQuantity,
      ...(!isCountUnit(pickerIngredient.unit) && { unit: pickerUnit }),
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

  function handleUpdateRecipeItem(
    ingredientId: string,
    updates: Partial<Pick<RecipeItem, "quantity" | "unit">>
  ) {
    setValues((v) => ({
      ...v,
      recipe: v.recipe.map((item) =>
        item.ingredientId === ingredientId ? { ...item, ...updates } : item
      ),
    }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!values.name.trim() || !values.category.trim()) return
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update the product, its price, and its recipe."
            : "Add a new product to sell, along with its recipe."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto py-4 lg:grid-cols-[minmax(0,1fr)_17rem] lg:overflow-hidden">
        <FieldGroup className="min-w-0 lg:overflow-y-auto lg:pr-2">
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
                    <RecipeItemRow
                      key={item.ingredientId}
                      item={item}
                      ingredient={ingredient}
                      onUpdate={(updates) =>
                        handleUpdateRecipeItem(item.ingredientId, updates)
                      }
                      onRemove={() =>
                        handleRemoveRecipeItem(item.ingredientId)
                      }
                    />
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
        </FieldGroup>

        <aside className="flex flex-col gap-4 lg:border-l lg:pl-6">
          <ProductPricingSummary
            totalCost={totalCost}
            price={values.price}
            margin={margin}
            marginPercent={marginPercent}
            projectedPrices={projectedPrices}
            onApplyPrice={(price) =>
              setValues((v) => ({ ...v, price }))
            }
          />

          <Button type="submit" className="mt-auto w-full">
            {isEditing ? "Save changes" : "Add product"}
          </Button>
        </aside>
      </div>
    </form>
  )
}

function ProductPricingSummary({
  totalCost,
  price,
  margin,
  marginPercent,
  projectedPrices,
  onApplyPrice,
}: {
  totalCost: number
  price: number
  margin: number
  marginPercent: number
  projectedPrices: ReturnType<typeof computeProjectedPrices>
  onApplyPrice: (price: number) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-medium">Pricing summary</h3>
        <p className="text-xs text-muted-foreground">
          Based on your current recipe
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Est. cost</dt>
          <dd className="text-right font-mono font-medium">
            {formatCurrency(totalCost)}
          </dd>
          <dt className="text-muted-foreground">Your price</dt>
          <dd className="text-right font-mono font-medium">
            {formatCurrency(price)}
          </dd>
          <dt className="text-muted-foreground">Profit</dt>
          <dd
            className={cn(
              "text-right font-mono font-medium",
              margin < 0 && "text-destructive"
            )}
          >
            {formatCurrency(margin)}
          </dd>
          <dt className="text-muted-foreground">Margin</dt>
          <dd className="flex justify-end">
            <Badge variant={marginPercent >= 0 ? "secondary" : "destructive"}>
              {marginPercent.toFixed(0)}%
            </Badge>
          </dd>
        </dl>
      </div>

      {projectedPrices.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium">Suggested prices</h4>
          {projectedPrices.map((projection) => {
            const isActive = price === projection.price
            return (
              <div
                key={projection.label}
                className={cn(
                  "rounded-lg border px-3 py-2.5",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{projection.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {projection.description}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-sm font-medium">
                    {formatCurrency(projection.price)}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {projection.marginPercent}% margin
                  </span>
                  <Button
                    type="button"
                    variant={isActive ? "secondary" : "outline"}
                    size="xs"
                    onClick={() => onApplyPrice(projection.price)}
                  >
                    {isActive ? "Applied" : "Use price"}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RecipeItemRow({
  item,
  ingredient,
  onUpdate,
  onRemove,
}: {
  item: RecipeItem
  ingredient: Ingredient
  onUpdate: (
    updates: Partial<Pick<RecipeItem, "quantity" | "unit">>
  ) => void
  onRemove: () => void
}) {
  const unitOptions = getRecipeUnitOptions(ingredient.unit)
  const unitItems = unitOptions.map((unit) => ({
    label: recipeUnitLabels[unit],
    value: unit,
  }))
  const resolvedUnit =
    item.unit ?? getDefaultRecipeUnit(ingredient.unit) ?? "g"

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm">
      <span className="min-w-0 flex-1 truncate font-medium">
        {ingredient.name}
      </span>
      <Input
        type="number"
        min={0}
        step="0.01"
        aria-label={`${ingredient.name} quantity`}
        className="h-8 w-20"
        value={item.quantity || ""}
        onChange={(e) => {
          const quantity = Number(e.target.value)
          onUpdate({ quantity: Number.isNaN(quantity) ? 0 : quantity })
        }}
      />
      {unitOptions.length > 0 && (
        <Select
          items={unitItems}
          value={resolvedUnit}
          onValueChange={(value) =>
            onUpdate({ unit: value as RecipeDisplayUnit })
          }
        >
          <SelectTrigger
            className="h-8 w-18"
            aria-label={`${ingredient.name} unit`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {unitItems.map((unitItem) => (
                <SelectItem key={unitItem.value} value={unitItem.value}>
                  {unitItem.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
      {isCountUnit(ingredient.unit) && (
        <span className="w-18 shrink-0 text-muted-foreground">
          {ingredient.unit}
        </span>
      )}
      <span className="w-20 shrink-0 text-right font-mono text-muted-foreground">
        {formatCurrency(computeRecipeItemCost(item, ingredient))}
      </span>
      <Button type="button" variant="ghost" size="icon-xs" onClick={onRemove}>
        <X />
        <span className="sr-only">Remove</span>
      </Button>
    </div>
  )
}
