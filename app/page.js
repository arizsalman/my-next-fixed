"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { auth } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("./component/MapComponent"), {
  ssr: false,
});

const STATUS_OPTIONS = ["", "Pending", "In Progress", "Resolved"];
const CATEGORIES = [
  "",
  "Infrastructure",
  "Sanitation",
  "Safety",
  "Environment",
  "Traffic",
  "Noise",
  "Other",
];

function SearchParamsHandler({ onParamsReady }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    onParamsReady(status, category);
  }, [searchParams, onParamsReady]);

  return null;
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const handleParamsReady = (status, category) => {
    if (status) setStatusFilter(status);
    if (category) setCategoryFilter(category);
  };

  useEffect(() => {
    // Check if Firebase auth is available before subscribing
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }
    // If no auth, user stays null (development mode)
  }, []);

  useEffect(() => {
    fetch("/api/issues")
      .then((res) => res.json())
      .then((data) => {
        if (data.issues) {
          setAllIssues(data.issues);
        } else if (Array.isArray(data)) {
          setAllIssues(data);
        } else {
          setError("Failed to fetch issues");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching issues:", err);
        setError("Failed to fetch issues");
        setLoading(false);
      });
  }, []);

  // Filter issues based on selected filters
  useEffect(() => {
    let filtered = allIssues;

    if (statusFilter) {
      filtered = filtered.filter((issue) => issue.status === statusFilter);
    }

    if (categoryFilter) {
      filtered = filtered.filter((issue) => issue.category === categoryFilter);
    }

    setIssues(filtered);
  }, [allIssues, statusFilter, categoryFilter]);

  const clearFilters = () => {
    setStatusFilter("");
    setCategoryFilter("");
  };

  const activeFilters = [
    statusFilter && `Status: ${statusFilter}`,
    categoryFilter && `Category: ${categoryFilter}`,
  ].filter(Boolean);

  // Show login prompt if not authenticated (only when auth is configured)
  if (!auth) {
    return (
      <div className="min-h-screen">
        <Suspense fallback={null}>
          <SearchParamsHandler onParamsReady={handleParamsReady} />
        </Suspense>
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Community Issue Tracker
            </h1>
          </div>

          {/* Login Prompt */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Firebase Not Configured
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Firebase is not configured for this deployment. Please add the Firebase environment variables to your Vercel project settings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/about"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen">
        <Suspense fallback={null}>
          <SearchParamsHandler onParamsReady={handleParamsReady} />
        </Suspense>
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Community Issue Tracker
            </h1>
          </div>

          {/* Login Prompt */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Please Sign In to Continue
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You need to be logged in to view the community issue map and report issues.
              Join our community to make a difference!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/about"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Suspense fallback={null}>
        <SearchParamsHandler onParamsReady={handleParamsReady} />
      </Suspense>
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Community Issue Tracker
          </h1>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filters:</span>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status || "All"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat || "All"}
                  </option>
                ))}
              </select>
            </div>

            {(statusFilter || categoryFilter) && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear filters
              </button>
            )}

            <div className="ml-auto text-sm text-gray-500">
              Showing {issues.length} of {allIssues.length} issues
              {activeFilters.length > 0 && (
                <span className="ml-2 text-blue-600">
                  ({activeFilters.join(", ")})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-gray-200 h-[80vh] rounded-2xl shadow-inner overflow-hidden">
          {loading && (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="flex justify-center items-center h-full">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            </div>
          )}

          {!loading && !error && (
            <MapComponent
              issues={issues}
              userLocation={null}
              showUserLocation={true}
            />
          )}

          {!loading && !error && issues.length === 0 && (
            <div className="flex flex-col justify-center items-center h-full text-gray-500">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-lg">No issues found.</p>
              <p className="text-gray-400">
                {activeFilters.length > 0
                  ? "Try adjusting your filters"
                  : "Be the first to report an issue!"}
              </p>
            </div>
          )}
        </div>

        {/* Floating Report Issue Button */}
        <Link
          href="/issue"
          className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 fixed bottom-8 right-8 flex items-center gap-2 transition-colors z-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          + Report Issue
        </Link>
      </main>
    </div>
  );
}
