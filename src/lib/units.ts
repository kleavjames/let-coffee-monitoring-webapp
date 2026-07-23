import type { IngredientUnit, RecipeDisplayUnit, RecipeItem } from "@/lib/types"

const GRAMS_PER_OZ = 28.349523125
const ML_PER_FL_OZ = 29.5735295625

const WEIGHT_UNITS = new Set<IngredientUnit>(["g", "kg"])
const VOLUME_UNITS = new Set<IngredientUnit>(["ml", "l"])
const COUNT_UNITS = new Set<IngredientUnit>(["pcs", "pack"])

export function isCountUnit(unit: IngredientUnit): boolean {
  return COUNT_UNITS.has(unit)
}

export const RECIPE_DISPLAY_UNITS: RecipeDisplayUnit[] = ["g", "ml", "oz"]

export function isWeightUnit(unit: IngredientUnit): boolean {
  return WEIGHT_UNITS.has(unit)
}

export function isVolumeUnit(unit: IngredientUnit): boolean {
  return VOLUME_UNITS.has(unit)
}

export function getDefaultRecipeUnit(
  ingredientUnit: IngredientUnit
): RecipeDisplayUnit | undefined {
  if (isCountUnit(ingredientUnit)) return undefined
  if (isWeightUnit(ingredientUnit)) return "g"
  if (isVolumeUnit(ingredientUnit)) return "ml"
  return "g"
}

export function getRecipeUnitOptions(
  ingredientUnit: IngredientUnit
): RecipeDisplayUnit[] {
  if (isCountUnit(ingredientUnit)) return []
  if (isWeightUnit(ingredientUnit)) return ["g", "oz"]
  if (isVolumeUnit(ingredientUnit)) return ["ml", "oz"]
  return RECIPE_DISPLAY_UNITS
}

export function normalizeRecipeItem(
  item: RecipeItem,
  ingredientUnit: IngredientUnit
): RecipeItem {
  if (item.productId) {
    return { productId: item.productId, quantity: item.quantity }
  }

  if (isCountUnit(ingredientUnit)) {
    return { ingredientId: item.ingredientId, quantity: item.quantity }
  }

  const unit = item.unit ?? getDefaultRecipeUnit(ingredientUnit)
  if (!unit) {
    return { ingredientId: item.ingredientId, quantity: item.quantity }
  }

  const allowed = getRecipeUnitOptions(ingredientUnit)
  const resolvedUnit = allowed.includes(unit)
    ? unit
    : (getDefaultRecipeUnit(ingredientUnit) ?? unit)

  return {
    ingredientId: item.ingredientId,
    quantity: item.quantity,
    unit: resolvedUnit,
  }
}

export function toIngredientQuantity(
  quantity: number,
  displayUnit: RecipeDisplayUnit | undefined,
  ingredientUnit: IngredientUnit
): number {
  if (isCountUnit(ingredientUnit)) return quantity

  const unit = displayUnit ?? getDefaultRecipeUnit(ingredientUnit)
  if (!unit) return quantity

  if (isWeightUnit(ingredientUnit)) {
    let grams: number
    if (unit === "g") grams = quantity
    else if (unit === "oz") grams = quantity * GRAMS_PER_OZ
    else return 0

    return ingredientUnit === "kg" ? grams / 1000 : grams
  }

  if (isVolumeUnit(ingredientUnit)) {
    let milliliters: number
    if (unit === "ml") milliliters = quantity
    else if (unit === "oz") milliliters = quantity * ML_PER_FL_OZ
    else return 0

    return ingredientUnit === "l" ? milliliters / 1000 : milliliters
  }

  return quantity
}

/** Recipe quantity normalized to g, ml, or count units for costing. */
export function toBaseRecipeQuantity(
  quantity: number,
  displayUnit: RecipeDisplayUnit | undefined,
  ingredientUnit: IngredientUnit
): { amount: number; unit: IngredientUnit } {
  if (isCountUnit(ingredientUnit)) {
    return { amount: quantity, unit: ingredientUnit }
  }

  const unit = displayUnit ?? getDefaultRecipeUnit(ingredientUnit)
  if (!unit) {
    return { amount: quantity, unit: ingredientUnit }
  }

  if (isWeightUnit(ingredientUnit)) {
    if (unit === "g") return { amount: quantity, unit: "g" }
    if (unit === "oz") {
      return { amount: quantity * GRAMS_PER_OZ, unit: "g" }
    }
    return { amount: 0, unit: "g" }
  }

  if (isVolumeUnit(ingredientUnit)) {
    if (unit === "ml") return { amount: quantity, unit: "ml" }
    if (unit === "oz") {
      return { amount: quantity * ML_PER_FL_OZ, unit: "ml" }
    }
    return { amount: 0, unit: "ml" }
  }

  return { amount: quantity, unit: ingredientUnit }
}

export function getResolvedRecipeUnit(
  item: RecipeItem,
  ingredientUnit: IngredientUnit
): RecipeDisplayUnit | undefined {
  if (isCountUnit(ingredientUnit)) return undefined
  return item.unit ?? getDefaultRecipeUnit(ingredientUnit)
}

export function formatRecipeQuantity(
  item: RecipeItem,
  ingredientUnit: IngredientUnit
): string {
  if (isCountUnit(ingredientUnit)) {
    return `${formatQuantity(item.quantity)} ${ingredientUnit}`
  }

  const unit = item.unit ?? getDefaultRecipeUnit(ingredientUnit) ?? "g"
  return `${formatQuantity(item.quantity)} ${unit}`
}

function formatQuantity(value: number): string {
  if (Number.isInteger(value)) return value.toLocaleString()
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}
