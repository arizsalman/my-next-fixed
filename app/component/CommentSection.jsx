"use client";

import { useState, useEffect, useCallback } from "react";
import { auth } from "../lib/firebase";
import toast, { Toaster } from "react-hot-toast";

// Loading Skeleton Component
function CommentSkeleton() {
  return (
    <div className="animate-pulse border-b pb-4 last:border-b-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-3 w-20 bg-gray-200 rounded"></div>
      </div>
      <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
    </div>
  );
}

export default function CommentSection({ issueId, comments: initialComments, onCommentAdded }) {
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch comments from API
  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/issues/${issueId}/comments`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  }, [issueId]);

  // Auto-refresh comments every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchComments();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchComments]);

  const getAuthHeader = async () => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Please sign in to comment");
    }
    const token = await user.getIdToken();
    return `Bearer ${token}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const authHeader = await getAuthHeader();

      const response = await fetch(`/api/issues/${issueId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          text: newComment,
          username: auth.currentUser?.displayName || "Anonymous",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add comment");
      }

      const comment = await response.json();
      setComments([comment.comment, ...comments]);
      setNewComment("");
      if (onCommentAdded) onCommentAdded(comment.comment);

      toast.success("Comment posted successfully!", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#10B981",
          color: "#fff",
        },
      });
    } catch (err) {
      setError(err.message);
      toast.error(err.message, {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchComments();
    toast.success("Comments refreshed", {
      duration: 2000,
      position: "top-right",
    });
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <Toaster />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Comments</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Posting...
              </>
            ) : (
              "Post"
            )}
          </button>
        </div>
      </form>

      {/* Comments List with Loading Skeletons */}
      {refreshing ? (
        <div className="space-y-4">
          <CommentSkeleton />
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="mt-2 text-gray-500">No comments yet.</p>
          <p className="text-sm text-gray-400">Be the first to start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="border-b pb-4 last:border-b-0 animate-fadeIn">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {(comment.username || "A")[0].toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-gray-900">
                  {comment.username || "Anonymous"}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-gray-700 ml-10">{comment.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
