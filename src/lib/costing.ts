import type { Ingredient, Product, RecipeItem } from "@/lib/types"
import { toIngredientQuantity } from "@/lib/units"

export function getIngredientCostPerUnit(
  ingredient: Pick<Ingredient, "purchasePrice" | "packageQuantity">
): number {
  if (ingredient.packageQuantity <= 0) return 0
  return ingredient.purchasePrice / ingredient.packageQuantity
}

export function computeRecipeItemCost(
  item: RecipeItem,
  ingredient: Ingredient
): number {
  const quantityInIngredientUnit = toIngredientQuantity(
    item.quantity,
    item.unit,
    ingredient.unit
  )
  return getIngredientCostPerUnit(ingredient) * quantityInIngredientUnit
}

export function computeProductCost(
  product: Pick<Product, "recipe">,
  ingredients: Ingredient[]
): number {
  return product.recipe.reduce((total, item) => {
    const ingredient = ingredients.find((i) => i.id === item.ingredientId)
    if (!ingredient) return total
    return total + computeRecipeItemCost(item, ingredient)
  }, 0)
}

export function computeProductMargin(
  product: Pick<Product, "recipe" | "price">,
  ingredients: Ingredient[]
): number {
  return product.price - computeProductCost(product, ingredients)
}

export function computeMarginPercent(
  product: Pick<Product, "recipe" | "price">,
  ingredients: Ingredient[]
): number {
  if (product.price <= 0) return 0
  return (computeProductMargin(product, ingredients) / product.price) * 100
}

export type ProjectedPrice = {
  label: string
  description: string
  marginPercent: number
  price: number
}

export function priceAtMarginPercent(
  cost: number,
  marginPercent: number
): number {
  if (cost <= 0) return 0
  if (marginPercent >= 100) return cost
  return cost / (1 - marginPercent / 100)
}

export function roundPrice(value: number): number {
  if (value <= 0) return 0
  return Math.ceil(value / 5) * 5
}

export function computeProjectedPrices(cost: number): ProjectedPrice[] {
  if (cost <= 0) return []

  return [
    {
      label: "Minimum",
      description: "50% margin floor",
      marginPercent: 50,
      price: roundPrice(priceAtMarginPercent(cost, 50)),
    },
    {
      label: "Recommended",
      description: "70% margin target",
      marginPercent: 70,
      price: roundPrice(priceAtMarginPercent(cost, 70)),
    },
    {
      label: "Premium",
      description: "80% margin target",
      marginPercent: 80,
      price: roundPrice(priceAtMarginPercent(cost, 80)),
    },
  ]
}

const CURRENCY_SYMBOL = "₱"

export function formatCurrency(value: number): string {
  return `${CURRENCY_SYMBOL}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
