import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
  users: defineTable({
    username: v.string(),
    fullname: v.string(),
    email: v.string(),
    bio: v.optional(v.string()),
    image: v.string(),
    posts: v.number(),
    clerkId: v.string(),
    code: v.string(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_code", ["code"]),

  posts: defineTable({
    userId: v.id("users"),
    imageUrl: v.string(),
    storageId: v.id("_storage"),
    caption: v.optional(v.string()),
    likes: v.number(),
    comments: v.number(),
  }).index("by_user", ["userId"]),

  likes: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
  })
    .index("by_post", ["postId"])
    .index("by_user_and_post", ["userId", "postId"]),

  comments: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    content: v.string(),
  }).index("by_post", ["postId"]),

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_both", ["followerId", "followingId"]),

  notifications: defineTable({
    receiverId: v.id("users"),
    senderId: v.id("users"),
    type: v.union(v.literal("like"), v.literal("comment"), v.literal("follow")),
    postId: v.optional(v.id("posts")),
    commentId: v.optional(v.id("comments")),
  }).index("by_receiver", ["receiverId"])
     .index("by_post", ["postId"]),


  bookmarks: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
  })
    .index("by_user", ["userId"])
    .index("by_post", ["postId"])
    .index("by_user_and_post", ["userId", "postId"]),

      notes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    date: v.string(), // store as ISO string
    createdAt: v.string(),
  }).index("by_user", ["userId"]),

couples: defineTable({
  user1Id: v.id("users"),
  user2Id: v.id("users"),
  createdAt: v.string(), // store as ISO date
  relationshipType: v.optional(v.string()), // "nearby" | "longDistance"
})
  .index("by_user1", ["user1Id"])
  .index("by_user2", ["user2Id"])
  .index("by_pair", ["user1Id", "user2Id"])
});

