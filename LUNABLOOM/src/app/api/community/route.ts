import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { communityPosts, communityComments } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getActiveUser } from "@/lib/auth";

export async function GET() {
  const posts = await db
    .select()
    .from(communityPosts)
    .orderBy(desc(communityPosts.createdAt));

  const comments = await db
    .select()
    .from(communityComments)
    .orderBy(communityComments.createdAt);

  const visiblePosts = posts
    .filter((p) => !p.isReported)
    .map((p) => ({
      ...p,
      comments: comments.filter((c) => c.postId === p.id),
    }));

  return NextResponse.json({ posts: visiblePosts });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getActiveUser();
    const body = await request.json();
    const action = String(body.action || "create_post");

    const authorAlias = user
      ? `${user.name.split(" ")[0]} ${
          user.name.split(" ")[1]?.[0] ? user.name.split(" ")[1][0] + "." : ""
        }`.trim()
      : "Wellness Guest";

    if (action === "create_post") {
      const title = String(body.title || "").trim();
      const content = String(body.content || "").trim();
      const category = String(body.category || "Self-Care").trim();

      if (title.length < 4) {
        return NextResponse.json(
          { error: "Please provide a post title (at least 4 characters)." },
          { status: 400 }
        );
      }
      if (content.length < 10) {
        return NextResponse.json(
          { error: "Please write a bit more to share with the community." },
          { status: 400 }
        );
      }

      const [created] = await db
        .insert(communityPosts)
        .values({
          userId: user?.id ?? null,
          authorAlias,
          authorBadge: user ? "Verified Member" : "Community Guest",
          category,
          title,
          content,
          likesCount: 1,
        })
        .returning();

      return NextResponse.json({
        ok: true,
        post: { ...created, comments: [] },
      });
    }

    if (action === "comment") {
      const postId = Number(body.postId);
      const content = String(body.content || "").trim();

      if (!postId || !content) {
        return NextResponse.json(
          { error: "Please write a supportive reply." },
          { status: 400 }
        );
      }

      const [created] = await db
        .insert(communityComments)
        .values({
          postId,
          userId: user?.id ?? null,
          authorAlias,
          content,
        })
        .returning();

      return NextResponse.json({ ok: true, comment: created });
    }

    if (action === "like") {
      const postId = Number(body.postId);
      if (!postId) {
        return NextResponse.json({ error: "Missing post ID." }, { status: 400 });
      }

      const [updated] = await db
        .update(communityPosts)
        .set({
          likesCount: sql`${communityPosts.likesCount} + 1`,
        })
        .where(eq(communityPosts.id, postId))
        .returning();

      return NextResponse.json({ ok: true, post: updated });
    }

    if (action === "report") {
      const postId = Number(body.postId);
      const reportReason = String(
        body.reportReason || "Community guidelines review requested"
      ).trim();

      if (!postId) {
        return NextResponse.json({ error: "Missing post ID." }, { status: 400 });
      }

      await db
        .update(communityPosts)
        .set({
          isReported: true,
          reportReason,
        })
        .where(eq(communityPosts.id, postId));

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Unsupported community action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Community API error:", error);
    return NextResponse.json(
      { error: "Failed to process community request." },
      { status: 500 }
    );
  }
}
