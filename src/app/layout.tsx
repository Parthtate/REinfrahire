import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from 'next/font/google'
import "./globals.css";
import { satoshi } from './fonts'

import { JobProvider } from '@/contexts/JobContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${satoshi.variable} font-sans`}>
      <body>
        <JobProvider>
          {children}
        </JobProvider>
      </body>
    </html>
  )
}