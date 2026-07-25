import { v } from "convex/values"

import { mutation, query } from "./_generated/server"
import { requireAuth } from "./lib/auth"
import {
  expenseCategoryValidator,
  expenseDocValidator,
} from "./lib/validators"

export const list = query({
  args: {},
  returns: v.array(expenseDocValidator),
  handler: async (ctx) => {
    await requireAuth(ctx)
    const expenses = await ctx.db.query("expenses").collect()
    return expenses.sort((a, b) => (a.date < b.date ? 1 : -1))
  },
})

export const create = mutation({
  args: {
    date: v.string(),
    category: expenseCategoryValidator,
    description: v.string(),
    amount: v.number(),
  },
  returns: v.id("expenses"),
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.db.insert("expenses", {
      date: args.date,
      category: args.category,
      description: args.description.trim(),
      amount: args.amount,
    })
  },
})

export const remove = mutation({
  args: {
    id: v.id("expenses"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    await ctx.db.delete(args.id)
    return null
  },
})
