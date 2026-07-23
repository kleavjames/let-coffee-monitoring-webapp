import type { Doc, Id } from "../../convex/_generated/dataModel"
import type {
  Expense,
  Ingredient,
  Product,
  ProductCategory,
  RecipeItem,
  Sale,
} from "./types"

export function toCategory(doc: Doc<"categories">): ProductCategory {
  return {
    id: doc._id,
    name: doc.name,
  }
}

export function toIngredient(doc: Doc<"ingredients">): Ingredient {
  return {
    id: doc._id,
    name: doc.name,
    unit: doc.unit,
    purchasePrice: doc.purchasePrice,
    packageQuantity: doc.packageQuantity,
    stockQuantity: doc.stockQuantity,
  }
}

export function toRecipeItem(
  item: Doc<"products">["recipe"][number]
): RecipeItem {
  if (item.productId) {
    return { productId: item.productId, quantity: item.quantity }
  }

  return {
    ingredientId: item.ingredientId,
    quantity: item.quantity,
    unit: item.unit,
  }
}

export function toProduct(doc: Doc<"products">): Product {
  return {
    id: doc._id,
    name: doc.name,
    categoryId: doc.categoryId,
    price: doc.price,
    status: doc.status,
    special: doc.special ?? false,
    recipe: doc.recipe.map(toRecipeItem),
  }
}

export function toSale(doc: Doc<"sales">): Sale {
  return {
    id: doc._id,
    date: doc.date,
    productId: doc.productId,
    quantity: doc.quantity,
    unitPrice: doc.unitPrice,
    amount: doc.amount,
  }
}

export function toExpense(doc: Doc<"expenses">): Expense {
  return {
    id: doc._id,
    date: doc.date,
    category: doc.category,
    description: doc.description,
    amount: doc.amount,
  }
}

export function toRecipeItemInput(item: RecipeItem) {
  if (item.productId) {
    return {
      productId: item.productId as Id<"products">,
      quantity: item.quantity,
    }
  }

  return {
    ingredientId: item.ingredientId as Id<"ingredients">,
    quantity: item.quantity,
    unit: item.unit,
  }
}

export function toCategoryId(id: string | undefined): Id<"categories"> | undefined {
  return id ? (id as Id<"categories">) : undefined
}

export function toProductId(id: string): Id<"products"> {
  return id as Id<"products">
}

export function toIngredientId(id: string): Id<"ingredients"> {
  return id as Id<"ingredients">
}

export function toSaleId(id: string): Id<"sales"> {
  return id as Id<"sales">
}

export function toExpenseId(id: string): Id<"expenses"> {
  return id as Id<"expenses">
}

export function toCategoryDocId(id: string): Id<"categories"> {
  return id as Id<"categories">
}
