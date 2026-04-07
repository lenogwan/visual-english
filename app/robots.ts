import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/profile/'],
    },
    sitemap: 'https://queryi.com/sitemap.xml',
  }
}
