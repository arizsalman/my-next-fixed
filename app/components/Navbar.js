'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: 'About', href: '/about' },
  { name: 'Query', href: '/query' },
  { name: 'Issue', href: '/issue' },
  { name: 'Login', href: '/login' },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow">
      <nav className="flex items-center justify-between p-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          MyApp
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Desktop menu */}
        <div className="hidden lg:flex gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="font-semibold text-gray-700 hover:text-black"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <DialogPanel className="fixed inset-0 bg-white p-6">
          <button onClick={() => setMobileMenuOpen(false)}>
            <XMarkIcon className="h-6 w-6" />
          </button>

          <div className="mt-6 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-lg font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}
