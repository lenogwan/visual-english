import { NextRequest, NextResponse } from 'next/server'

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY || 'YWQSMIq76fCjdpldTzQ81QFm68IoUvzTOqs1x7OfJmg'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    }

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=squarish`
    
    const res = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_KEY}`,
      },
      next: { revalidate: 86400 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Unsplash API error' }, { status: res.status })
    }

    const data = await res.json()
    
    if (data.results && data.results.length > 0) {
      const photo = data.results[0]
      return NextResponse.json({
        url: photo.urls.regular,
        thumb: photo.urls.thumb,
        small: photo.urls.small,
        photographer: photo.user.name,
      })
    }

    return NextResponse.json({ url: null })
  } catch (error) {
    console.error('Unsplash search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
