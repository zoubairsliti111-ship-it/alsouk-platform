import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cairo } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { AuthProvider } from '@/components/auth-provider'
import { LANGS, type Lang } from '@/lib/i18n'

const LANG_COOKIE = 'alsouk_lang'

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  variable: '--font-sans',
  display: 'swap',
})

const TITLE = 'ALSOUK — B2B Marketplace for Tunisia & North Africa'
const DESCRIPTION =
  'ALSOUK connects manufacturers, suppliers, wholesalers, exporters and buyers across Tunisia and North Africa. Source quality products, request quotes and grow your business.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  generator: 'v0.app',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export const viewport: Viewport = {
  themeColor: '#2563EB',
  colorScheme: 'light',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: DESCRIPTION,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const stored = cookieStore.get(LANG_COOKIE)?.value
  const lang: Lang = LANGS.some((l) => l.code === stored) ? (stored as Lang) : 'en'
  const dir = LANGS.find((l) => l.code === lang)?.dir ?? 'ltr'

  return (
    <html lang={lang} dir={dir} className={`${cairo.variable} bg-background`}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          {children}
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
