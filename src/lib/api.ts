// API client functions for traffic violation form

export interface UploadResponse {
  success: boolean
  url?: string
  path?: string
  error?: string
}

export interface IncidentIdResponse {
  success: boolean
  incidentId?: string
  error?: string
}

export interface FormSubmissionResponse {
  success: boolean
  data?: unknown
  error?: string
}

// Upload media file to Supabase storage
export const uploadMediaFile = async (
  file: File,
  incidentId: string
): Promise<UploadResponse> => {
  try {
    console.log('Uploading file:', { name: file.name, size: file.size, type: file.type, incidentId });
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('incidentId', incidentId)

    const response = await fetch('/api/upload-media', {
      method: 'POST',
      body: formData,
    })

    console.log('Upload response status:', response.status);

    const result = await response.json()
    console.log('Upload response data:', result);

    if (!response.ok) {
      console.error('Upload failed:', result.error);
      return { success: false, error: result.error }
    }

    return result
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

// Upload multiple media files
export const uploadMultipleFiles = async (
  files: File[],
  incidentId: string
): Promise<{ urls: string[], errors: string[] }> => {
  const uploadPromises = files.map(file => uploadMediaFile(file, incidentId))
  const results = await Promise.all(uploadPromises)
  
  const urls: string[] = []
  const errors: string[] = []
  
  results.forEach(result => {
    if (result.success && result.url) {
      urls.push(result.url)
    } else if (result.error) {
      errors.push(result.error)
    }
  })
  
  return { urls, errors }
}

// Generate unique incident ID
export const generateIncidentId = async (): Promise<IncidentIdResponse> => {
  try {
    const response = await fetch('/api/generate-incident-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.error }
    }

    return result
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate incident ID'
    }
  }
}

// Submit form data
export const submitTrafficViolation = async (data: {
  incident_id: string
  description: string
  city: string
  state: string
  latitude: number
  longitude: number
  media_urls: string[]
}): Promise<FormSubmissionResponse> => {
  try {
    const response = await fetch('/api/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.error }
    }

    return result
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit report'
    }
  }
}
