import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const { placeId } = await params;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Google Maps API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Google Places Details API
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,photos,review,rating,user_ratings_total,price_level,geometry,types&key=${apiKey}`;

    const response = await fetch(detailsUrl);
    const data = await response.json();

    if (data.status === 'REQUEST_DENIED') {
      return NextResponse.json(
        { error: 'Google API request denied', details: data.error_message },
        { status: 403 }
      );
    }

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: 'Google API error', details: data.status },
        { status: 500 }
      );
    }

    const place = data.result;

    // Transform to our format
    const shop = {
      place_id: placeId,
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number || null,
      website: place.website || null,
      location: place.geometry.location,
      rating: place.rating || 0,
      review_count: place.user_ratings_total || 0,
      price_level: place.price_level ? '$'.repeat(place.price_level) : 'Not available',
      photos: place.photos?.map((p: any) => p.photo_reference) || [],
      types: place.types || [],
      opening_hours: place.opening_hours || null,
      reviews: place.reviews || [],
    };

    return NextResponse.json({ shop });

  } catch (error) {
    console.error('Error fetching place details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 }
    );
  }
}
