import type { RecipeItem } from "@/lib/types"

export function isProductRecipeItem(
  item: RecipeItem
): item is RecipeItem & { productId: string } {
  return Boolean(item.productId)
}

export function isIngredientRecipeItem(
  item: RecipeItem
): item is RecipeItem & { ingredientId: string } {
  return Boolean(item.ingredientId)
}

export function getRecipeItemKey(item: RecipeItem): string {
  if (item.productId) return `product:${item.productId}`
  if (item.ingredientId) return `ingredient:${item.ingredientId}`
  return `recipe-item:${item.quantity}`
}

export type RecipePickerValue = `ing:${string}` | `prod:${string}`

export function toRecipePickerValue(
  item: Pick<RecipeItem, "ingredientId" | "productId">
): RecipePickerValue | null {
  if (item.productId) return `prod:${item.productId}`
  if (item.ingredientId) return `ing:${item.ingredientId}`
  return null
}

export function parseRecipePickerValue(
  value: RecipePickerValue | null
): Pick<RecipeItem, "ingredientId" | "productId"> | null {
  if (!value) return null
  if (value.startsWith("prod:")) {
    return { productId: value.slice(5) }
  }
  if (value.startsWith("ing:")) {
    return { ingredientId: value.slice(4) }
  }
  return null
}

export function formatProductRecipeQuantity(quantity: number): string {
  const label = quantity === 1 ? "serving" : "servings"
  return `${formatQuantity(quantity)} ${label}`
}

function formatQuantity(value: number): string {
  if (Number.isInteger(value)) return value.toLocaleString()
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}
