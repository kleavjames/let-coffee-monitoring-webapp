import { v } from "convex/values"

import { mutation, query } from "./_generated/server"
import {
  productDocValidator,
  productStatusValidator,
  recipeItemValidator,
} from "./lib/validators"

export const list = query({
  args: {},
  returns: v.array(productDocValidator),
  handler: async (ctx) => {
    return await ctx.db.query("products").collect()
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    categoryId: v.optional(v.id("categories")),
    price: v.optional(v.number()),
    status: productStatusValidator,
    special: v.optional(v.boolean()),
    recipe: v.array(recipeItemValidator),
  },
  returns: v.id("products"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", {
      name: args.name.trim(),
      categoryId: args.categoryId,
      price: args.price,
      status: args.status,
      special: args.special ?? false,
      recipe: args.recipe,
    })
  },
})

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.string(),
    categoryId: v.optional(v.id("categories")),
    price: v.optional(v.number()),
    status: productStatusValidator,
    special: v.optional(v.boolean()),
    recipe: v.array(recipeItemValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name.trim(),
      categoryId: args.categoryId,
      price: args.price,
      status: args.status,
      special: args.special ?? false,
      recipe: args.recipe,
    })
    return null
  },
})

export const remove = mutation({
  args: {
    id: v.id("products"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return null
  },
})
