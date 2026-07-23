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
  computeProductRecipeItemCost,
  computeProjectedPrices,
  computeRecipeItemCost,
  formatCurrency,
  formatProductRecipeItemCostBreakdown,
  formatRecipeItemCostBreakdown,
} from "@/lib/costing"
import { useCategories, useIngredients, useProducts } from "@/lib/data-provider"
import {
  getRecipeItemKey,
  isProductRecipeItem,
  parseRecipePickerValue,
  type RecipePickerValue,
} from "@/lib/recipe"
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
  getResolvedRecipeUnit,
  isCountUnit,
} from "@/lib/units"

export type ProductFormValues = Omit<Product, "id">

const emptyValues: ProductFormValues = {
  name: "",
  status: "active",
  special: false,
  recipe: [],
}

function hasSellablePrice(price: number | undefined): boolean {
  return price != null && price > 0
}

function normalizeFormValues(values: ProductFormValues): ProductFormValues {
  return {
    ...values,
    categoryId: values.categoryId || undefined,
    price: hasSellablePrice(values.price) ? values.price : undefined,
  }
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
  const { items: categories } = useCategories()
  const { items: allProducts } = useProducts()
  const [values, setValues] = React.useState<ProductFormValues>(() =>
    product
      ? {
          name: product.name,
          categoryId: product.categoryId,
          price: product.price,
          status: product.status,
          special: product.special ?? false,
          recipe: product.recipe,
        }
      : emptyValues
  )
  const [pickerValue, setPickerValue] = React.useState<RecipePickerValue | null>(
    null
  )
  const [pickerQuantity, setPickerQuantity] = React.useState(0)
  const [pickerUnit, setPickerUnit] = React.useState<RecipeDisplayUnit>("g")

  const isEditing = Boolean(product)

  const pickerTarget = parseRecipePickerValue(pickerValue)
  const pickerIngredient = pickerTarget?.ingredientId
    ? ingredients.find((ingredient) => ingredient.id === pickerTarget.ingredientId)
    : undefined
  const pickerSpecialProduct = pickerTarget?.productId
    ? allProducts.find((item) => item.id === pickerTarget.productId)
    : undefined
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

  const availableSpecialProducts = allProducts.filter(
    (item) =>
      item.special &&
      item.id !== product?.id &&
      !values.recipe.some((recipeItem) => recipeItem.productId === item.id)
  )

  const recipePickerItems = [
    { label: "Select ingredient or special product", value: null as RecipePickerValue | null },
    ...availableIngredients.map((ingredient) => ({
      label: `${ingredient.name} (${ingredient.unit})`,
      value: `ing:${ingredient.id}` as RecipePickerValue,
    })),
    ...availableSpecialProducts.map((item) => ({
      label: `${item.name} (special)`,
      value: `prod:${item.id}` as RecipePickerValue,
    })),
  ]

  const categoryItems = [
    { label: "Select category", value: null as string | null },
    ...categories.map((category) => ({
      label: category.name,
      value: category.id,
    })),
  ]

  const productsForCosting = React.useMemo(() => {
    if (!product) return allProducts
    return allProducts.map((item) =>
      item.id === product.id ? { ...item, ...values, id: product.id } : item
    )
  }, [allProducts, product, values])

  const costingProduct = product
    ? { ...values, id: product.id }
    : { ...values, id: "draft-product" }

  const totalCost = computeProductCost(
    costingProduct,
    ingredients,
    productsForCosting
  )
  const margin = computeProductMargin(
    { ...costingProduct, price: values.price },
    ingredients,
    productsForCosting
  )
  const marginPercent = computeMarginPercent(
    { ...costingProduct, price: values.price },
    ingredients,
    productsForCosting
  )
  const projectedPrices = computeProjectedPrices(totalCost)
  const showPricingDetails = !values.special || hasSellablePrice(values.price)

  function handleAddRecipeItem() {
    if (!pickerTarget || pickerQuantity <= 0) return

    if (pickerTarget.productId) {
      const newItem: RecipeItem = {
        productId: pickerTarget.productId,
        quantity: pickerQuantity,
      }
      setValues((v) => ({ ...v, recipe: [...v.recipe, newItem] }))
    } else if (pickerTarget.ingredientId && pickerIngredient) {
      const newItem: RecipeItem = {
        ingredientId: pickerTarget.ingredientId,
        quantity: pickerQuantity,
        ...(!isCountUnit(pickerIngredient.unit) && { unit: pickerUnit }),
      }
      setValues((v) => ({ ...v, recipe: [...v.recipe, newItem] }))
    } else {
      return
    }

    setPickerValue(null)
    setPickerQuantity(0)
    setPickerUnit("g")
  }

  function handlePickerChange(value: RecipePickerValue | null) {
    setPickerValue(value)
    if (!value) return

    const target = parseRecipePickerValue(value)
    if (!target?.ingredientId) return

    const ingredient = ingredients.find((item) => item.id === target.ingredientId)
    if (!ingredient) return

    const defaultUnit = getDefaultRecipeUnit(ingredient.unit)
    if (defaultUnit) setPickerUnit(defaultUnit)
  }

  function handleRemoveRecipeItem(itemKey: string) {
    setValues((v) => ({
      ...v,
      recipe: v.recipe.filter((item) => getRecipeItemKey(item) !== itemKey),
    }))
  }

  function handleUpdateRecipeItem(
    itemKey: string,
    updates: Partial<Pick<RecipeItem, "quantity" | "unit">>
  ) {
    setValues((v) => ({
      ...v,
      recipe: v.recipe.map((item) =>
        getRecipeItemKey(item) === itemKey ? { ...item, ...updates } : item
      ),
    }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!values.name.trim()) return
    if (!values.special && !values.categoryId) return
    if (!values.special && !hasSellablePrice(values.price)) return
    onSubmit(normalizeFormValues(values))
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
          <Field>
            <div className="flex items-start gap-3">
              <input
                id="product-special"
                type="checkbox"
                checked={values.special ?? false}
                onChange={(e) =>
                  setValues((v) => ({ ...v, special: e.target.checked }))
                }
                className="mt-0.5 size-4 rounded border border-input accent-primary"
              />
              <div className="space-y-1">
                <FieldLabel htmlFor="product-special" className="font-normal">
                  Special
                </FieldLabel>
                <p className="text-xs text-muted-foreground">
                  Special products can be added to other products&apos; recipes.
                  Their recipe cost is included automatically. Category and price
                  are optional.
                </p>
              </div>
            </div>
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="product-category">
                Category{values.special ? " (optional)" : ""}
              </FieldLabel>
              <Select
                items={categoryItems}
                value={values.categoryId || null}
                onValueChange={(value) =>
                  setValues((v) => ({
                    ...v,
                    categoryId: (value as string | null) ?? undefined,
                  }))
                }
              >
                <SelectTrigger id="product-category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {categoryItems.map((item) => (
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
              <FieldLabel htmlFor="product-price">
                Price{values.special ? " (optional)" : ""}
              </FieldLabel>
              <Input
                id="product-price"
                type="number"
                min={0}
                step="0.01"
                value={values.price ?? ""}
                onChange={(e) => {
                  const next = e.target.value
                  setValues((v) => ({
                    ...v,
                    price: next === "" ? undefined : Number(next),
                  }))
                }}
                required={!values.special}
              />
            </Field>
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
          </div>

          <FieldSeparator>Recipe</FieldSeparator>

          <Field>
            <FieldLabel>Recipe items</FieldLabel>
            {values.recipe.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recipe items added yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {values.recipe.map((item) => {
                  const itemKey = getRecipeItemKey(item)

                  if (isProductRecipeItem(item)) {
                    const specialProduct = productsForCosting.find(
                      (p) => p.id === item.productId
                    )
                    if (!specialProduct) return null
                    return (
                      <SpecialRecipeItemRow
                        key={itemKey}
                        item={item}
                        specialProduct={specialProduct}
                        ingredients={ingredients}
                        products={productsForCosting}
                        onUpdate={(updates) =>
                          handleUpdateRecipeItem(itemKey, updates)
                        }
                        onRemove={() => handleRemoveRecipeItem(itemKey)}
                      />
                    )
                  }

                  const ingredient = ingredients.find(
                    (i) => i.id === item.ingredientId
                  )
                  if (!ingredient) return null
                  return (
                    <RecipeItemRow
                      key={itemKey}
                      item={item}
                      ingredient={ingredient}
                      onUpdate={(updates) =>
                        handleUpdateRecipeItem(itemKey, updates)
                      }
                      onRemove={() => handleRemoveRecipeItem(itemKey)}
                    />
                  )
                })}
              </div>
            )}

            <div className="mt-2 flex items-end gap-2">
              <div className="flex-1">
                <Select
                  items={recipePickerItems}
                  value={pickerValue}
                  onValueChange={(value) =>
                    handlePickerChange(value as RecipePickerValue | null)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select ingredient or special product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {recipePickerItems.map((item) => (
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
                placeholder={pickerSpecialProduct ? "Servings" : "Qty"}
                className="w-20"
                value={pickerQuantity || ""}
                onChange={(e) => setPickerQuantity(Number(e.target.value))}
              />
              {pickerIngredient && pickerUnitOptions.length > 0 && (
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
              {pickerSpecialProduct && (
                <span className="w-18 shrink-0 text-sm text-muted-foreground">
                  serving{pickerQuantity === 1 ? "" : "s"}
                </span>
              )}
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={
                  !pickerValue ||
                  pickerQuantity <= 0 ||
                  (!pickerIngredient && !pickerSpecialProduct)
                }
                onClick={handleAddRecipeItem}
              >
                <Plus />
                <span className="sr-only">Add recipe item</span>
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
            showPricingDetails={showPricingDetails}
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
  showPricingDetails,
  onApplyPrice,
}: {
  totalCost: number
  price?: number
  margin: number
  marginPercent: number
  projectedPrices: ReturnType<typeof computeProjectedPrices>
  showPricingDetails: boolean
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
          {showPricingDetails ? (
            <>
              <dt className="text-muted-foreground">Your price</dt>
              <dd className="text-right font-mono font-medium">
                {formatCurrency(price ?? 0)}
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
            </>
          ) : (
            <dd className="col-span-2 text-xs text-muted-foreground">
              Add a price to see profit, margin, and suggested prices.
            </dd>
          )}
        </dl>
      </div>

      {showPricingDetails && projectedPrices.length > 0 && (
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

function SpecialRecipeItemRow({
  item,
  specialProduct,
  ingredients,
  products,
  onUpdate,
  onRemove,
}: {
  item: RecipeItem
  specialProduct: Product
  ingredients: Ingredient[]
  products: Product[]
  onUpdate: (updates: Partial<Pick<RecipeItem, "quantity">>) => void
  onRemove: () => void
}) {
  const costBreakdown = formatProductRecipeItemCostBreakdown(
    item,
    specialProduct,
    ingredients,
    products
  )
  const lineCost = computeProductRecipeItemCost(
    item,
    specialProduct,
    ingredients,
    products
  )

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{specialProduct.name}</p>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            Special
          </Badge>
        </div>
        {costBreakdown && (
          <p className="truncate text-[11px] text-muted-foreground">
            {costBreakdown}
          </p>
        )}
      </div>
      <Input
        type="number"
        min={0}
        step="0.01"
        aria-label={`${specialProduct.name} servings`}
        className="h-8 w-20"
        value={item.quantity || ""}
        onChange={(e) => {
          const quantity = Number(e.target.value)
          onUpdate({ quantity: Number.isNaN(quantity) ? 0 : quantity })
        }}
      />
      <span className="w-18 shrink-0 text-muted-foreground">
        serving{item.quantity === 1 ? "" : "s"}
      </span>
      <span className="w-20 shrink-0 text-right font-mono text-muted-foreground">
        {formatCurrency(lineCost)}
      </span>
      <Button type="button" variant="ghost" size="icon-xs" onClick={onRemove}>
        <X />
        <span className="sr-only">Remove</span>
      </Button>
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
  const resolvedUnit = getResolvedRecipeUnit(item, ingredient.unit)
  const recipeItemForCost =
    resolvedUnit && !isCountUnit(ingredient.unit)
      ? { ...item, unit: resolvedUnit }
      : item
  const costBreakdown = formatRecipeItemCostBreakdown(
    recipeItemForCost,
    ingredient
  )

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{ingredient.name}</p>
        {costBreakdown && (
          <p className="truncate text-[11px] text-muted-foreground">
            {costBreakdown}
          </p>
        )}
      </div>
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
          value={resolvedUnit ?? "g"}
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
        {formatCurrency(computeRecipeItemCost(recipeItemForCost, ingredient))}
      </span>
      <Button type="button" variant="ghost" size="icon-xs" onClick={onRemove}>
        <X />
        <span className="sr-only">Remove</span>
      </Button>
    </div>
  )
}
