import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    let incidentId: string = ''
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10

    // Generate unique incident ID
    while (!isUnique && attempts < maxAttempts) {
      const timestamp = Date.now().toString(36)
      const random = Math.random().toString(36).substr(2, 5)
      incidentId = `TR-${timestamp}-${random}`.toUpperCase()

      // Check if incident ID already exists
      const { error } = await supabaseAdmin
        .from('traffic_violations')
        .select('incident_id')
        .eq('incident_id', incidentId)
        .single()

      if (error && error.code === 'PGRST116') {
        // No rows found - ID is unique
        isUnique = true
      } else if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to generate incident ID' },
          { status: 500 }
        )
      }

      attempts++
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique incident ID' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      incidentId
    })

  } catch (error) {
    console.error('Incident ID generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
