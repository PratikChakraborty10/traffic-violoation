import { supabase } from './supabase'

export interface TrafficViolationData {
  incident_id: string
  description: string
  city: string
  state: string
  latitude: number
  longitude: number
  media_urls: string[]
}

export const submitTrafficViolation = async (data: TrafficViolationData) => {
  try {
    const { data: result, error } = await supabase
      .from('traffic_violations')
      .insert([data])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, data: result }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit report'
    }
  }
}

export const getTrafficViolationByIncidentId = async (incidentId: string) => {
  try {
    const { data, error } = await supabase
      .from('traffic_violations')
      .select('*')
      .eq('incident_id', incidentId)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch report'
    }
  }
}
