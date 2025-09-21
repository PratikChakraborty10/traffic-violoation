import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface FormSubmissionData {
  incident_id: string
  description: string
  city: string
  state: string
  latitude: number
  longitude: number
  media_urls: string[]
}

export async function POST(request: NextRequest) {
  try {
    const data: FormSubmissionData = await request.json()

    // Validate required fields
    const requiredFields = ['incident_id', 'description', 'city', 'state', 'latitude', 'longitude']
    for (const field of requiredFields) {
      if (!data[field as keyof FormSubmissionData]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate coordinates
    if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
      return NextResponse.json(
        { error: 'Latitude and longitude must be numbers' },
        { status: 400 }
      )
    }

    // Check if incident ID already exists
    const { data: existingReport, error: checkError } = await supabaseAdmin
      .from('traffic_violations')
      .select('incident_id')
      .eq('incident_id', data.incident_id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Database check error:', checkError)
      return NextResponse.json(
        { error: 'Failed to validate incident ID' },
        { status: 500 }
      )
    }

    if (existingReport) {
      return NextResponse.json(
        { error: 'Incident ID already exists' },
        { status: 409 }
      )
    }

    // Insert the traffic violation report
    const { data: result, error } = await supabaseAdmin
      .from('traffic_violations')
      .insert([{
        incident_id: data.incident_id,
        description: data.description,
        city: data.city,
        state: data.state,
        latitude: data.latitude,
        longitude: data.longitude,
        media_urls: data.media_urls || [],
        status: 'pending'
      }])
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Form submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
