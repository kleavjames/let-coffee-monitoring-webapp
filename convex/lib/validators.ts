import { v } from "convex/values"

export const ingredientUnitValidator = v.union(
  v.literal("g"),
  v.literal("kg"),
  v.literal("ml"),
  v.literal("l"),
  v.literal("oz"),
  v.literal("pcs"),
  v.literal("pack")
)

export const recipeDisplayUnitValidator = v.union(
  v.literal("g"),
  v.literal("ml"),
  v.literal("oz")
)

export const recipeItemValidator = v.object({
  ingredientId: v.optional(v.id("ingredients")),
  productId: v.optional(v.id("products")),
  quantity: v.number(),
  unit: v.optional(recipeDisplayUnitValidator),
})

export const productStatusValidator = v.union(
  v.literal("active"),
  v.literal("inactive")
)

export const expenseCategoryValidator = v.union(
  v.literal("Ingredients"),
  v.literal("Rent"),
  v.literal("Utilities"),
  v.literal("Staff"),
  v.literal("Other")
)

export const categoryDocValidator = v.object({
  _id: v.id("categories"),
  _creationTime: v.number(),
  name: v.string(),
})

export const ingredientDocValidator = v.object({
  _id: v.id("ingredients"),
  _creationTime: v.number(),
  name: v.string(),
  unit: ingredientUnitValidator,
  purchasePrice: v.number(),
  packageQuantity: v.number(),
  stockQuantity: v.optional(v.number()),
})

export const productDocValidator = v.object({
  _id: v.id("products"),
  _creationTime: v.number(),
  name: v.string(),
  categoryId: v.optional(v.id("categories")),
  price: v.optional(v.number()),
  status: productStatusValidator,
  special: v.optional(v.boolean()),
  recipe: v.array(recipeItemValidator),
})

export const saleDocValidator = v.object({
  _id: v.id("sales"),
  _creationTime: v.number(),
  date: v.string(),
  productId: v.id("products"),
  quantity: v.number(),
  unitPrice: v.number(),
})

export const expenseDocValidator = v.object({
  _id: v.id("expenses"),
  _creationTime: v.number(),
  date: v.string(),
  category: expenseCategoryValidator,
  description: v.string(),
  amount: v.number(),
})
