import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

import {
  expenseCategoryValidator,
  ingredientUnitValidator,
  productStatusValidator,
  recipeDisplayUnitValidator,
} from "./lib/validators"

const recipeItem = v.object({
  ingredientId: v.optional(v.id("ingredients")),
  productId: v.optional(v.id("products")),
  quantity: v.number(),
  unit: v.optional(recipeDisplayUnitValidator),
})

export default defineSchema({
  categories: defineTable({
    name: v.string(),
  }),

  ingredients: defineTable({
    name: v.string(),
    unit: ingredientUnitValidator,
    purchasePrice: v.number(),
    packageQuantity: v.number(),
    stockQuantity: v.optional(v.number()),
  }),

  products: defineTable({
    name: v.string(),
    categoryId: v.optional(v.id("categories")),
    price: v.optional(v.number()),
    status: productStatusValidator,
    special: v.optional(v.boolean()),
    recipe: v.array(recipeItem),
  }).index("by_category", ["categoryId"]),

  sales: defineTable({
    date: v.string(),
    productId: v.id("products"),
    quantity: v.number(),
    unitPrice: v.number(),
    amount: v.optional(v.number()),
  }).index("by_date", ["date"]),

  expenses: defineTable({
    date: v.string(),
    category: expenseCategoryValidator,
    description: v.string(),
    amount: v.number(),
  }).index("by_date", ["date"]),
})
