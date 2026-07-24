import { v } from "convex/values"

import { mutation, query } from "./_generated/server"
import { requireAuth } from "./lib/auth"
import { saleDocValidator } from "./lib/validators"

export const list = query({
  args: {},
  returns: v.array(saleDocValidator),
  handler: async (ctx) => {
    await requireAuth(ctx)
    const sales = await ctx.db.query("sales").collect()
    return sales.sort((a, b) => (a.date < b.date ? 1 : -1))
  },
})

export const create = mutation({
  args: {
    date: v.string(),
    productId: v.id("products"),
    quantity: v.number(),
    unitPrice: v.number(),
    amount: v.optional(v.number()),
  },
  returns: v.id("sales"),
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.db.insert("sales", {
      date: args.date,
      productId: args.productId,
      quantity: args.quantity,
      unitPrice: args.unitPrice,
      ...(args.amount !== undefined ? { amount: args.amount } : {}),
    })
  },
})

export const remove = mutation({
  args: {
    id: v.id("sales"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    await ctx.db.delete(args.id)
    return null
  },
})
