import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

function getTodayString() {
  const now = new Date();
  return now.toISOString().split("T")[0]; // e.g., "2025-09-27"
}

export const updateStreak = mutation({
  args: { coupleId: v.id("couples") },
  handler: async (ctx, { coupleId }) => {
    await getAuthenticatedUser(ctx); // ensure user is logged in

    // 1. Find couple streak
    let streakDoc = await ctx.db
      .query("streaks")
      .withIndex("by_couple", (q) => q.eq("coupleId", coupleId))
      .first();

    const today = getTodayString();

    // 2. Count today’s posts for both partners
    const couple = await ctx.db.get(coupleId);
    if (!couple) throw new Error("Couple not found");

    const user1Posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", couple.user1Id))
      .collect();

    const user2Posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", couple.user2Id))
      .collect();

    const todayPosts = [...user1Posts, ...user2Posts].filter((p) => {
      const postDate = new Date(p._creationTime).toISOString().split("T")[0];
      return postDate === today;
    });

    // 3. If >= 4 posts and not updated today → increment streak
    if (todayPosts.length >= 4) {
      if (!streakDoc) {
        const id = await ctx.db.insert("streaks", {
          coupleId,
          streak: 1,
          lastUpdated: today,
        });
        return { streak: 1, id };
      }

      if (streakDoc.lastUpdated !== today) {
        await ctx.db.patch(streakDoc._id, {
          streak: streakDoc.streak + 1,
          lastUpdated: today,
        });
        return { streak: streakDoc.streak + 1, id: streakDoc._id };
      }
    }

    return { streak: streakDoc ? streakDoc.streak : 0, id: streakDoc?._id };
  },
});

export const getStreak = query({
  args: { coupleId: v.id("couples") },
  handler: async (ctx, { coupleId }) => {
    const streakDoc = await ctx.db
      .query("streaks")
      .withIndex("by_couple", (q) => q.eq("coupleId", coupleId))
      .first();

    return streakDoc ? streakDoc.streak : 0;
  },
});
