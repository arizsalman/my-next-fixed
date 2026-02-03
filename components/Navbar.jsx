'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { auth } from '../app/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Issue', href: '/issue' },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="flex items-center justify-between p-4 lg:px-8 max-w-7xl mx-auto">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-green-600 hover:text-green-700 transition-colors">
          IssueTracker
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Desktop menu */}
        <div className="hidden lg:flex gap-1 items-center">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              {item.name}
            </Link>
          ))}

          {/* Auth buttons */}
          <div className="ml-4 flex items-center gap-2">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-green-600 transition-colors"
                >
                  Admin
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:text-green-600 transition-colors"
                >
                  Sign Out
                </button>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <DialogPanel className="fixed inset-0 bg-white p-6 z-50">
          <div className="flex justify-between items-center mb-6">
            <Link
              href="/"
              className="text-xl font-bold text-green-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              IssueTracker
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3 rounded-lg font-semibold text-gray-700 hover:text-green-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/admin"
                  className="block px-4 py-3 rounded-lg font-semibold text-gray-700 hover:text-green-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
                <button
                  onClick={() => {
                    handleSignOut()
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg font-semibold text-gray-700 hover:text-green-600 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block px-4 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}
