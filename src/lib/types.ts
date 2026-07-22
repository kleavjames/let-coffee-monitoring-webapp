export type IngredientUnit = "g" | "kg" | "ml" | "l" | "pcs"

export type Ingredient = {
  id: string
  name: string
  unit: IngredientUnit
  costPerUnit: number
  stockQuantity: number
}

export type RecipeItem = {
  ingredientId: string
  quantity: number
}

export type ProductStatus = "active" | "inactive"

export type Product = {
  id: string
  name: string
  category: string
  price: number
  status: ProductStatus
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
