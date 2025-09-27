import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

// Mark an activity as completed for the current user
export const markActivityCompleted = mutation({
  args: {
    activityId: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    
    // Check if already completed
    const existingCompletion = await ctx.db
      .query("activityCompletions")
      .withIndex("by_user_and_activity", (q) => 
        q.eq("userId", user._id).eq("activityId", args.activityId)
      )
      .first();

    if (existingCompletion) {
      return existingCompletion._id; // Already completed
    }

    // Mark as completed
    const completionId = await ctx.db.insert("activityCompletions", {
      userId: user._id,
      activityId: args.activityId,
      completedAt: new Date().toISOString(),
    });

    return completionId;
  },
});

// Check if a specific activity is completed by the current user
export const isActivityCompleted = query({
  args: {
    userId: v.id("users"),
    activityId: v.number(),
  },
  handler: async (ctx, args) => {
    const completion = await ctx.db
      .query("activityCompletions")
      .withIndex("by_user_and_activity", (q) => 
        q.eq("userId", args.userId).eq("activityId", args.activityId)
      )
      .first();

    return !!completion;
  },
});

// Get all completed activities for a user
export const getUserCompletedActivities = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const completions = await ctx.db
      .query("activityCompletions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return completions.map(c => c.activityId);
  },
});

// Get completion status for multiple activities
export const getActivitiesCompletionStatus = query({
  args: {
    userId: v.id("users"),
    activityIds: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const completions = await ctx.db
      .query("activityCompletions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const completedIds = new Set(completions.map(c => c.activityId));
    
    return args.activityIds.reduce((acc, activityId) => {
      acc[activityId] = completedIds.has(activityId);
      return acc;
    }, {} as Record<number, boolean>);
  },
});