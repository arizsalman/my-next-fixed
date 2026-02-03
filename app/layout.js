import { Inter } from "next/font/google";
import Navbar from "../components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Community Issue Tracker",
  description: "Report and track community issues",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gradient-to-br from-green-50 via-white to-blue-50 min-h-screen text-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:text-gray-100`} suppressHydrationWarning>
        <Navbar />
        <main>
          {children}
        </main>
        <footer className="py-6 mt-auto">
          <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2024 Community Issue Tracker. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
