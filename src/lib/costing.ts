import type { Ingredient, IngredientUnit, Product, RecipeItem } from "@/lib/types"
import {
  getResolvedRecipeUnit,
  isCountUnit,
  toBaseRecipeQuantity,
} from "@/lib/units"

export function getIngredientCostPerUnit(
  ingredient: Pick<Ingredient, "purchasePrice" | "packageQuantity">
): number {
  if (ingredient.packageQuantity <= 0) return 0
  return ingredient.purchasePrice / ingredient.packageQuantity
}

export function getIngredientCostDisplay(
  ingredient: Pick<Ingredient, "purchasePrice" | "packageQuantity" | "unit">
): { cost: number; unit: IngredientUnit } {
  const costPerUnit = getIngredientCostPerUnit(ingredient)

  if (ingredient.unit === "kg") {
    return { cost: costPerUnit / 1000, unit: "g" }
  }
  if (ingredient.unit === "l") {
    return { cost: costPerUnit / 1000, unit: "ml" }
  }

  return { cost: costPerUnit, unit: ingredient.unit }
}

export function computeRecipeItemCost(
  item: RecipeItem,
  ingredient: Ingredient
): number {
  const resolvedUnit = getResolvedRecipeUnit(item, ingredient.unit)
  const { cost } = getIngredientCostDisplay(ingredient)
  const { amount } = toBaseRecipeQuantity(
    item.quantity,
    resolvedUnit,
    ingredient.unit
  )
  return cost * amount
}

export function formatRecipeItemCostBreakdown(
  item: RecipeItem,
  ingredient: Ingredient
): string | null {
  if (isCountUnit(ingredient.unit)) {
    const cost = getIngredientCostPerUnit(ingredient)
    return `${item.quantity} ${ingredient.unit} × ${formatCurrency(cost)}`
  }

  const resolvedUnit = getResolvedRecipeUnit(item, ingredient.unit)
  const { cost, unit: costUnit } = getIngredientCostDisplay(ingredient)
  const { amount, unit: amountUnit } = toBaseRecipeQuantity(
    item.quantity,
    resolvedUnit,
    ingredient.unit
  )

  if (amount <= 0) return null

  const formattedAmount = Number.isInteger(amount)
    ? amount.toLocaleString()
    : amount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })

  if (resolvedUnit && resolvedUnit !== amountUnit) {
    return `${item.quantity} ${resolvedUnit} (${formattedAmount} ${amountUnit}) × ${formatCurrency(cost)}/${costUnit}`
  }

  return `${formattedAmount} ${amountUnit} × ${formatCurrency(cost)}/${costUnit}`
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
