import { NextRequest, NextResponse } from 'next/server';

// GET /api/shops/search - Search for coffee shops using Google Places
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Call Google Places Text Search API
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' coffee shop')}&key=${apiKey}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.status === 'REQUEST_DENIED') {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 500 });
    }

    if (data.error_message) {
      return NextResponse.json({ error: data.error_message }, { status: 500 });
    }

    // Transform results to match our shop format
    const shops = data.results?.map((place: any) => ({
      place_id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      price_level: place.price_level,
      photos: place.photos?.map((p: any) => p.photo_reference) || [],
    })) || [];

    return NextResponse.json({ data: shops });
  } catch (error: any) {
    console.error('Error searching shops:', error);
    return NextResponse.json({ error: error.message || 'Failed to search shops' }, { status: 500 });
  }
}
