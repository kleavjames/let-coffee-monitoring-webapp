import type { Ingredient, Product } from "@/lib/types"

export function computeProductCost(
  product: Pick<Product, "recipe">,
  ingredients: Ingredient[]
): number {
  return product.recipe.reduce((total, item) => {
    const ingredient = ingredients.find((i) => i.id === item.ingredientId)
    if (!ingredient) return total
    return total + ingredient.costPerUnit * item.quantity
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

const CURRENCY_SYMBOL = "₱"

export function formatCurrency(value: number): string {
  return `${CURRENCY_SYMBOL}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
