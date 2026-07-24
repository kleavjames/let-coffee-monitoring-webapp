import { v } from "convex/values"

import { mutation, query } from "./_generated/server"
import { requireAuth } from "./lib/auth"
import { categoryDocValidator } from "./lib/validators"

export const list = query({
  args: {},
  returns: v.array(categoryDocValidator),
  handler: async (ctx) => {
    await requireAuth(ctx)
    return await ctx.db.query("categories").collect()
  },
})

export const create = mutation({
  args: {
    name: v.string(),
  },
  returns: v.id("categories"),
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    return await ctx.db.insert("categories", { name: args.name.trim() })
  },
})

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    await ctx.db.patch(args.id, { name: args.name.trim() })
    return null
  },
})

export const remove = mutation({
  args: {
    id: v.id("categories"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAuth(ctx)
    await ctx.db.delete(args.id)
    return null
  },
})
