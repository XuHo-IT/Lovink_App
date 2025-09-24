import { v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";

function generateCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
// Create a new task with the given text
export const createUser = mutation({
  args: {
    username: v.string(),
    fullname: v.string(),
    email: v.string(),
    bio: v.optional(v.string()),
    image: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const exsitingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (exsitingUser) return;

    // Generate unique code
    let code: string;
    while (true) {
      code = generateCode(6);
      const duplicate = await ctx.db
        .query("users")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
      if (!duplicate) break; // found unique code
    }
    await ctx.db.insert("users", {
      username: args.username,
      fullname: args.fullname,
      email: args.email,
      bio: args.bio,
      image: args.image,
      clerkId: args.clerkId,
      posts: 0,
      code,
    });
  },
});

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const currentUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();
  if (!currentUser) throw new Error("User not found");
  return currentUser;
}

// Wrap getAuthenticatedUser as a query
export const getAuthenticatedUserQuery = query({
  handler: async (ctx) => {
    return await getAuthenticatedUser(ctx);
  },
});
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    return user;
  },
});

export const updateProfile = mutation({
  args: {
    fullname: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    await ctx.db.patch(currentUser._id, {
      fullname: args.fullname,
      bio: args.bio,
    });
  },
});
export const getUserProfile = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("User not found");

    return user;
  },
});
export const getUserCode = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    return user.code;
  },
});
export const connectCouple = mutation({
  args: {
    myClerkId: v.string(),
    loverCode: v.string(),
  },
  handler: async (ctx, { myClerkId, loverCode }) => {
    // find my user
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", myClerkId))
      .unique();

    if (!me) throw new Error("User not found");

    // find lover by code
    const lover = await ctx.db
      .query("users")
      .withIndex("by_code", (q) => q.eq("code", loverCode))
      .unique();

    if (!lover) throw new Error("Lover not found");

    // check if already connected (both directions)
    const existing = await ctx.db
      .query("couples")
      .withIndex("by_pair", (q) =>
        q.eq("user1Id", me._id).eq("user2Id", lover._id)
      )
      .unique();

    const reverse = await ctx.db
      .query("couples")
      .withIndex("by_pair", (q) =>
        q.eq("user1Id", lover._id).eq("user2Id", me._id)
      )
      .unique();

    if (existing || reverse) {
      return existing?._id ?? reverse?._id;
    }

    // ✅ Insert couple, storing ISO string instead of number
    return await ctx.db.insert("couples", {
      user1Id: me._id,
      user2Id: lover._id,
      createdAt: new Date().toISOString(), // must be string
    });
  },
});

export const getUserByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
  },
});
export const updateRelationshipType = mutation({
  args: {
    coupleId: v.id("couples"),
    relationshipType: v.string(), // "nearby" | "longDistance"
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.coupleId, {
      relationshipType: args.relationshipType,
    });
  },
});
export const getRelationshipType = query({
  args: { coupleId: v.id("couples") },
  handler: async (ctx, args) => {
    const couple = await ctx.db.get(args.coupleId);
    if (!couple) return null;
    return couple.relationshipType ?? null;
  },
});
export const getRelationshipTypeByUser = query({
  args: { userId: v.id("users") }, 
  handler: async (ctx, args) => {
    const couple =
      (await ctx.db.query("couples").withIndex("by_user1", (q) => q.eq("user1Id", args.userId)).first()) ||
      (await ctx.db.query("couples").withIndex("by_user2", (q) => q.eq("user2Id", args.userId)).first());

    if (!couple) return null;
    return couple.relationshipType ?? null;
  },
});
export const getCoupleByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const couple =
      (await ctx.db
        .query("couples")
        .withIndex("by_user1", (q) => q.eq("user1Id", args.userId))
        .first()) ||
      (await ctx.db
        .query("couples")
        .withIndex("by_user2", (q) => q.eq("user2Id", args.userId))
        .first());

    if (!couple) return null;

    // find soulmate (use === instead of .equals)
    const soulmateId =
      couple.user1Id === args.userId ? couple.user2Id : couple.user1Id;

    const soulmate = await ctx.db.get(soulmateId);

    return {
      soulmateName: soulmate?.fullname ?? "Unknown",
      soulmateImage: soulmate?.image ?? null,
      soulmateBio: soulmate?.bio ?? null,
      createdAt: couple.createdAt, // ISO string
    };
  },
});
export const removeCouple = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const couple =
      (await ctx.db
        .query("couples")
        .withIndex("by_user1", (q) => q.eq("user1Id", args.userId))
        .first()) ||
      (await ctx.db
        .query("couples")
        .withIndex("by_user2", (q) => q.eq("user2Id", args.userId))
        .first());

    if (couple) {
      await ctx.db.delete(couple._id);
    }
  },
});




