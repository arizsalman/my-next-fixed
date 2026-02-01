
"use client";
console.log("API KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

import { useEffect, useState } from "react";


import {
  signInWithEmail,
  signInWithGitHub,
  signOutUser,
  signInWithGoogle,
  registerWithEmail,
  resetPassword
} from "../lib/auth";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { FaGoogle, FaGithub } from "react-icons/fa";


export default function Login() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login"); // login | register | forgot
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  async function handleGoogle() {
    try {
      setLoading(true);
      await signInWithGoogle(remember);
      setMessage("Logged in with Google");
    } catch (err) {
      console.error(err);
      setMessage("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGitHub() {
    try {
      setLoading(true);
      await signInWithGitHub(remember);
      setMessage("Logged in with GitHub");
    } catch (err) {
      console.error(err);
      setMessage("GitHub sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailLogin(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await signInWithEmail({ email: form.email, password: form.password, remember });
      setMessage("Logged in successfully");
    } catch (err) {
      console.error(err);
      setMessage("Email login failed: " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await registerWithEmail({ email: form.email, password: form.password });
      setMessage("Account created. You are logged in.");
    } catch (err) {
      console.error(err);
      setMessage("Signup failed: " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await resetPassword(form.email);
      setMessage("Password reset email sent.");
    } catch (err) {
      console.error(err);
      setMessage("Reset failed: " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await signOutUser();
    setMessage("Signed out");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-10 bg-slate-800 text-white">
          <h2 className="text-2xl font-semibold mb-6">Sign in to your account</h2>
          {user ? (
            <div>
              <p className="mb-4">
                Welcome, <span className="font-semibold">{user.displayName || user.email}</span>
              </p>
              <button
                onClick={handleSignOut}
                className="w-full bg-red-600 py-2 rounded text-white hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              {view === "login" && (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="text-sm mb-1 block">Email address</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-sm mb-1 block">Password</label>
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={() => setRemember(!remember)}
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      onClick={() => setView("forgot")}
                      className="text-indigo-300"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-slate-900 text-slate-300">Or continue with</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleGoogle}
                      className="flex-1 py-2 rounded bg-white text-slate-800 flex items-center justify-center gap-2"
                      disabled={loading}
                    >
                      <FaGoogle /> Google
                    </button>
                    <button
                      type="button"
                      onClick={handleGitHub}
                      className="flex-1 py-2 rounded bg-slate-800 border border-slate-700 flex items-center justify-center gap-2"
                      disabled={loading}
                    >
                      <FaGithub /> GitHub
                    </button>
                  </div>

                  <div className="text-sm text-slate-400 pt-4">
                    Not a member?{" "}
                    <button
                      type="button"
                      onClick={() => setView("register")}
                      className="text-indigo-300"
                    >
                      Create account
                    </button>
                  </div>
                </form>
              )}

              {view === "register" && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="text-sm mb-1 block">Email address</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm mb-1 block">Password</label>
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
                    />
                  </div>
                  <div>
                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full bg-indigo-500 py-2 rounded text-white"
                    >
                      {loading ? "Please wait..." : "Create account"}
                    </button>
                  </div>
                  <div className="text-sm text-slate-400 pt-4">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setView("login")}
                      className="text-indigo-300"
                    >
                      Sign in
                    </button>
                  </div>
                </form>
              )}

              {view === "forgot" && (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <label className="text-sm mb-1 block">Enter your email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
                    />
                  </div>
                  <div>
                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full bg-indigo-500 py-2 rounded text-white"
                    >
                      {loading ? "Sending..." : "Send reset email"}
                    </button>
                  </div>
                  <div className="text-sm text-slate-400 pt-4">
                    Remembered?{" "}
                    <button
                      type="button"
                      onClick={() => setView("login")}
                      className="text-indigo-300"
                    >
                      Sign in
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {message && <p className="mt-4 text-sm text-indigo-200">{message}</p>}
        </div>
      </div>
    </div>
  );
}

