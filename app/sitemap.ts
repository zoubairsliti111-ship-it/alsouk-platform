import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://alsouk-platform.vercel.app'

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/suppliers?select=id,created_at`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    }
  )

  const suppliers = response.ok ? await response.json() : []

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/suppliers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...suppliers.map((supplier: { id: string; created_at?: string }) => ({
      url: `${baseUrl}/suppliers/${supplier.id}`,
      lastModified: supplier.created_at
        ? new Date(supplier.created_at)
        : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
