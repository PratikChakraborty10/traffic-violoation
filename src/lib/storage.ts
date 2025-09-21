import { supabase } from './supabase'

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export const uploadMediaFile = async (
  file: File,
  incidentId: string
): Promise<UploadResult> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${incidentId}/${Date.now()}.${fileExt}`
    
    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('traffic-violations-media')
      .upload(fileName, file)

    if (error) {
      return { url: '', path: '', error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('traffic-violations-media')
      .getPublicUrl(fileName)

    return {
      url: urlData.publicUrl,
      path: data.path
    }
  } catch (error) {
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

export const uploadMultipleFiles = async (
  files: File[],
  incidentId: string
): Promise<{ urls: string[], errors: string[] }> => {
  const uploadPromises = files.map(file => uploadMediaFile(file, incidentId))
  const results = await Promise.all(uploadPromises)
  
  const urls: string[] = []
  const errors: string[] = []
  
  results.forEach(result => {
    if (result.error) {
      errors.push(result.error)
    } else {
      urls.push(result.url)
    }
  })
  
  return { urls, errors }
}
