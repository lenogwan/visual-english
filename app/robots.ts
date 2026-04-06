import { Metadata } from 'next'

export default function Robots(): Metadata {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/profile/'],
    },
    sitemap: 'https://queryi.com/sitemap.xml',
  }
}
