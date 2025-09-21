# Supabase Integration Setup

## Database Setup

1. **Create the traffic_violations table:**
   ```sql
   -- Run the SQL from supabase-schema.sql in your Supabase SQL editor
   ```

2. **Set up storage bucket:**
   ```sql
   -- Run the SQL from storage-setup.sql in your Supabase SQL editor
   ```

## Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Database Schema

The `traffic_violations` table has 10 simple fields:

- `id` - UUID primary key
- `incident_id` - Unique incident identifier (e.g., TR-ABC123)
- `description` - Text description of the violation
- `city` - City name
- `state` - State name  
- `latitude` - GPS latitude
- `longitude` - GPS longitude
- `media_urls` - Array of media file URLs from storage
- `status` - Report status (pending, reviewed, resolved)
- `created_at` - Timestamp when created
- `updated_at` - Timestamp when last updated

## How It Works

1. **Media Upload**: Files are uploaded to Supabase Storage bucket `traffic-violations-media`
2. **URL Storage**: Only the public URLs are stored in the database, not the actual files
3. **Form Submission**: All form data is submitted to the `traffic_violations` table
4. **Public Access**: The form allows public submissions without authentication

## Storage Structure

Media files are organized as:
```
traffic-violations-media/
  └── {incident_id}/
      ├── {timestamp}.jpg
      ├── {timestamp}.webm
      └── ...
```

## Security

- Row Level Security (RLS) is enabled
- Public can insert new reports
- Public can read all reports (for status checking)
- Storage bucket is public for media access
