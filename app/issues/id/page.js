"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import CommentSection from "../../component/CommentSection";
import UpvoteButton from "../../component/UpvoteButton";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("../../component/MapComponent"), {
  ssr: false,
});

const statusColors = {
  "Pending": "bg-yellow-500",
  "In Progress": "bg-blue-500",
  "Resolved": "bg-green-500",
};

export default function IssueDetail() {

  const searchParams = useSearchParams();
  const issueId = searchParams.get("id");

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Track auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!issueId) {
      setError("Issue ID not provided");
      setLoading(false);
      return;
    }

    fetch(`/api/issues/${issueId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setIssue(data.issue);
          setComments(data.comments || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch issue");
        setLoading(false);
      });
  }, [issueId]);

  const handleVoteChange = (newUpvotes, newHasUpvoted) => {
    setIssue((prev) => ({
      ...prev,
      upvotes: newUpvotes,
    }));
  };

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Issue not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Header */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`inline-block px-3 py-1 text-sm text-white rounded-full ${statusColors[issue.status] || "bg-gray-500"}`}>
                    {issue.status || "Pending"}
                  </span>
                </div>
                <UpvoteButton
                  issueId={issueId}
                  initialUpvotes={issue.upvotes || 0}
                  initialHasUpvoted={issue.upvoters?.includes(user?.uid) || false}
                  onVoteChange={handleVoteChange}
                />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">{issue.title}</h1>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {issue.category}
                </span>
                <span>Reported by {issue.author?.name || "Anonymous"}</span>
                <span>{formatDate(issue.createdAt)}</span>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
              </div>

              {/* Image Gallery */}
              {issue.imageUrl && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Photos</h3>
                  <img
                    src={issue.imageUrl}
                    alt={issue.title}
                    className="max-h-96 rounded-lg object-cover"
                  />
                </div>
              )}
            </div>

            {/* Comments Section */}
            <CommentSection
              issueId={issueId}
              comments={comments}
              onCommentAdded={handleCommentAdded}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Map */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
              <div className="h-[300px] rounded-lg overflow-hidden">
                <MapComponent
                  issues={[issue]}
                  onSelectLocation={() => { }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Lat: {issue.latitude?.toFixed(6)}, Lng: {issue.longitude?.toFixed(6)}
              </p>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                {user && user.uid === issue.author?.uid && (
                  <>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Edit Issue
                    </button>
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Delete Issue
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
