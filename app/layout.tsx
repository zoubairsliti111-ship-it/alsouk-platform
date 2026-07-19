import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ALSOUK — B2B Marketplace for Tunisia & North Africa',
  description:
    'ALSOUK connects manufacturers, suppliers, wholesalers, exporters and buyers across Tunisia and North Africa. Source quality products, request quotes and grow your business.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#2563EB',
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="ltr" className={`${cairo.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
