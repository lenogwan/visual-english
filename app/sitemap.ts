import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://visual-english.vercel.app'
  
  // Base routes
  const routes = [
    '',
    '/learn',
    '/practice',
    '/quiz',
    '/search',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return [...routes]
}
