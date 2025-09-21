# API Routes Documentation

## Overview
The application now uses Next.js API routes for all backend operations, providing better security and server-side processing.

## API Endpoints

### 1. Media Upload API
**Endpoint:** `POST /api/upload-media`

**Purpose:** Upload media files to Supabase storage

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `file`: File object
  - `incidentId`: string

**Response:**
```json
{
  "success": true,
  "url": "https://supabase-url/storage/v1/object/public/traffic-violations-media/TR-ABC123/1234567890.jpg",
  "path": "TR-ABC123/1234567890.jpg"
}
```

### 2. Incident ID Generation API
**Endpoint:** `POST /api/generate-incident-id`

**Purpose:** Generate unique incident IDs with database validation

**Request:**
- Method: POST
- No body required

**Response:**
```json
{
  "success": true,
  "incidentId": "TR-ABC123-DEF45"
}
```

### 3. Form Submission API
**Endpoint:** `POST /api/submit-form`

**Purpose:** Submit traffic violation report to database

**Request:**
- Method: POST
- Content-Type: application/json
- Body:
```json
{
  "incident_id": "TR-ABC123-DEF45",
  "description": "Red light violation at Main St",
  "city": "New York",
  "state": "NY",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "media_urls": ["https://supabase-url/storage/..."]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "incident_id": "TR-ABC123-DEF45",
    "description": "Red light violation at Main St",
    "city": "New York",
    "state": "NY",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "media_urls": ["https://supabase-url/storage/..."],
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

## Security Features

1. **Server-side Processing:** All Supabase operations happen on the server
2. **Service Role Key:** Used only in API routes, never exposed to client
3. **Input Validation:** All API routes validate input data
4. **Error Handling:** Comprehensive error handling with proper HTTP status codes
5. **Unique ID Generation:** Database-validated unique incident IDs

## File Structure

```
src/
├── app/
│   └── api/
│       ├── upload-media/
│       │   └── route.ts
│       ├── generate-incident-id/
│       │   └── route.ts
│       └── submit-form/
│           └── route.ts
└── lib/
    ├── api.ts          # Client-side API functions
    ├── supabase.ts     # Supabase client configuration
    ├── storage.ts      # Legacy storage functions (can be removed)
    └── database.ts     # Legacy database functions (can be removed)
```

## Usage in Components

The form component now uses the API client functions from `@/lib/api`:

```typescript
import { uploadMultipleFiles, generateIncidentId, submitTrafficViolation } from "@/lib/api";

// Generate incident ID
const incidentIdResult = await generateIncidentId();

// Upload media files
const uploadResult = await uploadMultipleFiles(files, incidentId);

// Submit form
const result = await submitTrafficViolation(formData);
```

## Benefits

1. **Better Security:** Service role key never exposed to client
2. **Server-side Validation:** Input validation happens on server
3. **Error Handling:** Consistent error responses
4. **Scalability:** API routes can be easily extended
5. **Type Safety:** Full TypeScript support
6. **Unique IDs:** Database-validated unique incident IDs
