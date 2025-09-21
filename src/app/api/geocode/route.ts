import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');

  if (!latitude || !longitude) {
    return NextResponse.json({ error: "Missing latitude or longitude" }, { status: 400 });
  }

  try {
    const nominatimUrl = `${process.env.NOMINATIM_URL}?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18&namedetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "TrafficViolationForm/1.0 (https://traffic-violoation.vercel.app/app)"
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Geocoding API error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy geocoding error:", error);
    return NextResponse.json({ error: "Failed to fetch location data" }, { status: 500 });
  }
}