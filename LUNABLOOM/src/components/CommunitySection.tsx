"use client";

import React, { useState } from "react";
import {
  Users,
  Heart,
  MessageCircle,
  Flag,
  ShieldCheck,
  Send,
  Sparkles,
} from "lucide-react";
import type { CommunityPostItem } from "@/types/wellness";

interface CommunitySectionProps {
  posts: CommunityPostItem[];
  onRefresh: () => Promise<void>;
  onNotify: (msg: string, type?: "success" | "error") => void;
}

const CATEGORIES = [
  "All",
  "Cycle Tips",
  "Self-Care",
  "Symptom Relief",
  "Nutrition & Herbs",
  "Emotional Support",
];

export default function CommunitySection({
  posts,
  onRefresh,
  onNotify,
}: CommunitySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Self-Care");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [reportingPostId, setReportingPostId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState(
    "Unsolicited medical diagnosis or unsafe advice"
  );

  const filteredPosts =
    selectedCategory === "All"
      ? posts
      : posts.filter((p) => p.category === selectedCategory);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_post",
          title,
          category,
          content,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onNotify(data.error || "Could not publish post.", "error");
        return;
      }
      setTitle("");
      setContent("");
      await onRefresh();
      onNotify("Your post was shared with the Wellness Circle!");
    } catch {
      onNotify("Network error while posting.", "error");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", postId }),
      });
      if (res.ok) {
        await onRefresh();
      }
    } catch {
      // ignore
    }
  };

  const handleAddComment = async (e: React.FormEvent, postId: number) => {
    e.preventDefault();
    const text = (commentDrafts[postId] || "").trim();
    if (!text) return;

    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "comment",
          postId,
          content: text,
        }),
      });
      if (res.ok) {
        setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
        await onRefresh();
        onNotify("Supportive reply posted!");
      }
    } catch {
      onNotify("Could not post comment.", "error");
    }
  };

  const handleConfirmReport = async (postId: number) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "report",
          postId,
          reportReason,
        }),
      });
      if (res.ok) {
        setReportingPostId(null);
        await onRefresh();
        onNotify(
          "Thank you. Post has been hidden from the feed for community safety review."
        );
      }
    } catch {
      onNotify("Failed to submit report.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#2E1A2B]">
            Wellness Circle & Peer Community
          </h1>
          <p className="text-sm text-[#5A4257]">
            Share comforting rituals, symptom relief tips, and encouragement in a kind, moderated space.
          </p>
        </div>
      </div>

      {/* Community Guidelines Banner */}
      <div className="wellness-card rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-purple-50/90 via-pink-50/80 to-orange-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-xs text-[#4A2E47] space-y-0.5">
            <p className="font-semibold text-purple-950">
              Community Guidelines & Safety Promise
            </p>
            <p>
              Lead with warmth and empathy. Peer tips reflect personal experiences—never substitute for medical advice. Use the Report flag anytime to protect this space.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* New Post Composer */}
        <form
          onSubmit={handleCreatePost}
          className="lg:col-span-4 wellness-card rounded-3xl p-6 space-y-4 self-start"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-[#2E1A2B]">
                Share a Tip or Story
              </h2>
              <p className="text-xs text-[#6B5368]">
                Posted with your first-name alias
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
              Topic Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
              Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., My favorite soothing chamomile & ginger routine"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A2E47] mb-1">
              Your Message *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Share what helped you feel supported, comfortable, or understood..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={posting}
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold shadow-sm hover:opacity-95 transition disabled:opacity-60 cursor-pointer"
          >
            {posting ? "Publishing..." : "Publish to Community"}
          </button>
        </form>

        {/* Discussions Feed */}
        <div className="lg:col-span-8 space-y-4">
          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white/90 text-[#4A2E47] border-pink-200 hover:bg-pink-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredPosts.length === 0 ? (
            <div className="wellness-card rounded-3xl p-8 text-center text-sm text-[#6B5368]">
              No posts in this category yet. Start the conversation!
            </div>
          ) : (
            filteredPosts.map((post) => (
              <article
                key={post.id}
                className="wellness-card rounded-3xl p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-[#2E1A2B]">
                        {post.authorAlias}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-medium">
                        {post.authorBadge}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 font-semibold">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-[#2E1A2B] mt-1.5">
                      {post.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setReportingPostId(
                        reportingPostId === post.id ? null : post.id
                      )
                    }
                    title="Report post for moderation"
                    className="text-xs text-[#6B5368] hover:text-rose-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                </div>

                {/* Inline Moderation Report Box */}
                {reportingPostId === post.id && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2.5">
                    <p className="text-xs font-semibold text-rose-900">
                      Report this post for community safety review:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs"
                      >
                        <option>Unsolicited medical diagnosis or unsafe advice</option>
                        <option>Disrespectful or judgmental language</option>
                        <option>Spam or promotional content</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleConfirmReport(post.id)}
                        className="px-4 py-1.5 rounded-full bg-rose-600 text-white text-xs font-semibold cursor-pointer"
                      >
                        Hide & Report
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-sm text-[#4A2E47] leading-relaxed">
                  {post.content}
                </p>

                {/* Actions Row */}
                <div className="flex items-center gap-4 pt-2 border-t border-pink-100">
                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-700 hover:text-pink-900 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-200 transition cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                    <span>{post.likesCount} Warm Hearts</span>
                  </button>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#6B5368]">
                    <MessageCircle className="w-3.5 h-3.5 text-purple-500" />
                    <span>{post.comments.length} Replies</span>
                  </span>
                </div>

                {/* Comments Thread */}
                <div className="space-y-2.5 pt-1">
                  {post.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 rounded-2xl bg-pink-50/60 border border-pink-100/80 text-xs"
                    >
                      <span className="font-semibold text-purple-900">
                        {comment.authorAlias}:{" "}
                      </span>
                      <span className="text-[#4A2E47]">{comment.content}</span>
                    </div>
                  ))}

                  <form
                    onSubmit={(e) => handleAddComment(e, post.id)}
                    className="flex gap-2 pt-1"
                  >
                    <input
                      type="text"
                      placeholder="Write a kind reply..."
                      value={commentDrafts[post.id] || ""}
                      onChange={(e) =>
                        setCommentDrafts((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      className="flex-1 px-3.5 py-1.5 rounded-full bg-white border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-full bg-purple-600 text-white text-xs font-semibold flex items-center gap-1 hover:bg-purple-700 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Reply</span>
                    </button>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
