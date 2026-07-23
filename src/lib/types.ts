export type IngredientUnit = "g" | "kg" | "ml" | "l" | "oz" | "pcs" | "pack"

export type Ingredient = {
  id: string
  name: string
  unit: IngredientUnit
  purchasePrice: number
  packageQuantity: number
  stockQuantity?: number
}

export type RecipeDisplayUnit = "g" | "ml" | "oz"

export type RecipeItem = {
  ingredientId?: string
  productId?: string
  quantity: number
  unit?: RecipeDisplayUnit
}

export type ProductCategory = {
  id: string
  name: string
}

export type ProductStatus = "active" | "inactive"

export type Product = {
  id: string
  name: string
  categoryId?: string
  price?: number
  status: ProductStatus
  special?: boolean
  recipe: RecipeItem[]
}

export type Sale = {
  id: string
  date: string
  productId: string
  quantity: number
  unitPrice: number
}

export type ExpenseCategory =
  | "Ingredients"
  | "Rent"
  | "Utilities"
  | "Staff"
  | "Other"

export type Expense = {
  id: string
  date: string
  category: ExpenseCategory
  description: string
  amount: number
}
