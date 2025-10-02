import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

//  Check if user completed quiz
// check if completed
export const hasCompletedQuiz = query({
  args: { userId: v.id("users"), quizId: v.string() },
  handler: async (ctx, { userId, quizId }) => {
    const record = await ctx.db
      .query("quizCompletions")
      .withIndex("by_user_and_quiz", (q) =>
        q.eq("userId", userId).eq("quizId", quizId)
      )
      .unique();
    return !!record;
  },
});

// mark completed
export const completeQuiz = mutation({
  args: { userId: v.id("users"), quizId: v.string() },
  handler: async (ctx, { userId, quizId }) => {
    const now = new Date().toISOString();

    const existing = await ctx.db
      .query("quizCompletions")
      .withIndex("by_user_and_quiz", (q) =>
        q.eq("userId", userId).eq("quizId", quizId)
      )
      .unique();

    if (!existing) {
      await ctx.db.insert("quizCompletions", {
        userId,
        quizId,
        completedAt: now,
      });
    }
    return true;
  },
});

