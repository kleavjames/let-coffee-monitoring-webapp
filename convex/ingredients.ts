import { v } from "convex/values"

import { mutation, query } from "./_generated/server"
import { requireAuth } from "./lib/auth"
import {
  ingredientDocValidator,
  ingredientUnitValidator,
} from "./lib/validators"

export const list = query({
  args: {},
  returns: v.array(ingredientDocValidator),
  handler: async (ctx) => {
    await requireAuth(ctx)
    return await ctx.db.query("ingredients").collect()
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    unit: ingredientUnitValidator,
    purchasePrice: v.number(),
    packageQuantity: v.number(),
    stockQuantity: v.optional(v.number()),
  },
  returns: v.id("ingredients"),
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.db.insert("ingredients", {
      name: args.name.trim(),
      unit: args.unit,
      purchasePrice: args.purchasePrice,
      packageQuantity: args.packageQuantity,
      stockQuantity: args.stockQuantity,
    })
  },
})

export const update = mutation({
  args: {
    id: v.id("ingredients"),
    name: v.string(),
    unit: ingredientUnitValidator,
    purchasePrice: v.number(),
    packageQuantity: v.number(),
    stockQuantity: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    await ctx.db.patch(args.id, {
      name: args.name.trim(),
      unit: args.unit,
      purchasePrice: args.purchasePrice,
      packageQuantity: args.packageQuantity,
      stockQuantity: args.stockQuantity,
    })
    return null
  },
})

export const remove = mutation({
  args: {
    id: v.id("ingredients"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    await ctx.db.delete(args.id)
    return null
  },
})
