"use client";

import { useState } from "react";
import { auth } from "../lib/firebase";

export default function UpvoteButton({ issueId, initialUpvotes, initialHasUpvoted, onVoteChange }) {
  const [upvotes, setUpvotes] = useState(initialUpvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted || false);
  const [loading, setLoading] = useState(false);

  const handleUpvote = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in to upvote");
      return;
    }

    // Optimistic UI update
    const previousUpvotes = upvotes;
    const previousHasUpvoted = hasUpvoted;

    setHasUpvoted(!hasUpvoted);
    setUpvotes(hasUpvoted ? upvotes - 1 : upvotes + 1);

    setLoading(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/issues/${issueId}/upvote`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upvote");
      }

      const data = await response.json();

      // Update with server response
      setUpvotes(data.upvotes);
      setHasUpvoted(data.upvoted);

      // Notify parent component
      if (onVoteChange) {
        onVoteChange(data.upvotes, data.upvoted);
      }
    } catch (err) {
      // Revert on error
      setUpvotes(previousUpvotes);
      setHasUpvoted(previousHasUpvoted);
      console.error("Upvote error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpvote}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${hasUpvoted
          ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <svg
        className={`w-5 h-5 transition-transform duration-200 ${hasUpvoted ? "fill-current scale-110" : "stroke-current fill-none"
          }`}
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      </svg>
      <span className="font-medium">{upvotes}</span>
      {loading && (
        <span className="text-xs animate-pulse">
          {hasUpvoted ? "Removing..." : "Adding..."}
        </span>
      )}
    </button>
  );
}
