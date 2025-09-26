import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    storageId: v.id("_storage"),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, { storageId, caption }) => {
    const currentUser = await getAuthenticatedUser(ctx);
    
    // Get the proper URL for the uploaded image
    const imageUrl = await ctx.storage.getUrl(storageId);
    
    if (!imageUrl) {
      throw new Error("Failed to get image URL");
    }
    
    // Create the post
    const postId = await ctx.db.insert("posts", {
      userId: currentUser._id,
      imageUrl,
      storageId,
      caption: caption || "",
      likes: 0,
      comments: 0,
    });

    // Update user's post count
    await ctx.db.patch(currentUser._id, {
      posts: currentUser.posts + 1,
    });

    return { postId, imageUrl };
  },
});

export const getFeedPosts = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    // 1. Find if this user is in a couple
    const couple =
      (await ctx.db
        .query("couples")
        .withIndex("by_user1", (q) => q.eq("user1Id", currentUser._id))
        .first()) ||
      (await ctx.db
        .query("couples")
        .withIndex("by_user2", (q) => q.eq("user2Id", currentUser._id))
        .first());

    // 2. Determine which userIds to fetch posts for
  let userIds: Id<"users">[] = [currentUser._id];
if (couple) {
  const partnerId =
    couple.user1Id === currentUser._id ? couple.user2Id : couple.user1Id;
  userIds.push(partnerId);
}


    // 3. Get posts of those users
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", userIds[0]))
      .order("desc")
      .collect();

    // If couple exists, also fetch partner posts
    if (userIds.length > 1) {
      const partnerPosts = await ctx.db
        .query("posts")
        .withIndex("by_user", (q) => q.eq("userId", userIds[1]))
        .order("desc")
        .collect();
      posts.push(...partnerPosts);
    }

    if (posts.length === 0) return [];

    // 4. Enhance posts with user + interactions
    const postsWithInfo = await Promise.all(
      posts.map(async (post) => {
        const postAuthor = (await ctx.db.get(post.userId))!;

        const like = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        const bookmark = await ctx.db
          .query("bookmarks")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        return {
          ...post,
          author: {
            _id: postAuthor?._id,
            username: postAuthor?.username,
            image: postAuthor?.image,
          },
          isLiked: !!like,
          isBookmarked: !!bookmark,
        };
      })
    );

    // 5. Sort combined posts by createdAt descending (if needed)
    postsWithInfo.sort(
      (a, b) => new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime()
    );

    return postsWithInfo;
  },
});



