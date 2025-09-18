// convex/notes.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const createNote = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    date: v.string(), // ISO date string
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) throw new Error("User not found");

    const noteId = await ctx.db.insert("notes", {
      userId: user._id,
      title: args.title,
      content: args.content,
      date: args.date,
      createdAt: new Date().toISOString(),
    });

    return noteId;
  },
});
export const getNotesByUser = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = args.userId ? await ctx.db.get(args.userId) : await getAuthenticatedUser(ctx);

    if (!user) throw new Error("User not found");

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId || user._id))
      .order("desc") // newest first
      .collect();

    return notes;
  },
});
