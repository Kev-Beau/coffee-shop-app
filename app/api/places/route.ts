import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const location = searchParams.get('location'); // "33.4484,-112.0740" (lat,lng)
  const query = searchParams.get('query') || 'coffee shop';
  const radius = searchParams.get('radius') || '16093'; // 10 miles in meters

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Google Maps API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Google Places Text Search API
    // If location is provided, use it; otherwise search globally (for city searches like "Portland, OR coffee shops")
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;

    if (location) {
      url += `&location=${location}&radius=${radius}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'REQUEST_DENIED') {
      return NextResponse.json(
        { error: 'Google API request denied. Check your API key.', details: data.error_message },
        { status: 403 }
      );
    }

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: 'Google API error', details: data.status },
        { status: 500 }
      );
    }

    // Transform Google Places data to our format
    const shops = data.results.map((place: any) => ({
      place_id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      location: place.geometry.location,
      rating: place.rating || 0,
      review_count: place.user_ratings_total || 0,
      price_level: place.price_level ? '$'.repeat(place.price_level) : 'Not available',
      photos: place.photos?.map((p: any) => p.photo_reference) || [],
      types: place.types || [],
      open_now: place.opening_hours?.open_now ?? null,
      vicinity: place.vicinity || '',
    }));

    return NextResponse.json({ shops });

  } catch (error) {
    console.error('Error fetching from Google Places:', error);
    return NextResponse.json(
      { error: 'Failed to fetch places' },
      { status: 500 }
    );
  }
}
