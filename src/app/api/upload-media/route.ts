import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const incidentId = formData.get('incidentId') as string

    console.log('Upload API called with:', { 
      fileName: file?.name, 
      fileSize: file?.size, 
      fileType: file?.type, 
      incidentId 
    });

    if (!file || !incidentId) {
      console.error('Missing required fields:', { hasFile: !!file, hasIncidentId: !!incidentId });
      return NextResponse.json(
        { error: 'File and incident ID are required' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${incidentId}/${Date.now()}.${fileExt}`
    
    console.log('Generated filename:', fileName);
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    console.log('File converted to ArrayBuffer, size:', arrayBuffer.byteLength);
    
    // Upload file to Supabase storage
    console.log('Uploading to Supabase storage...');
    const { data, error } = await supabaseAdmin.storage
      .from('traffic-violations-media')
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('Upload successful, data:', data);

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('traffic-violations-media')
      .getPublicUrl(fileName)

    console.log('Generated public URL:', urlData.publicUrl);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
