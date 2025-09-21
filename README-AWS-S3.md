# AWS S3 Integration Setup

## Overview
The traffic violation form now uses AWS S3 for media file storage instead of Supabase storage. This provides better scalability and cost-effectiveness for file storage.

## Setup Instructions

### 1. Create AWS S3 Bucket
1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click "Create bucket"
3. Choose a unique bucket name (e.g., `traffic-violations-media`)
4. Select your preferred region
5. Configure public access settings:
   - Uncheck "Block all public access"
   - Check "I acknowledge that the current settings might result in this bucket and objects being public"
6. Create the bucket

### 2. Configure Bucket CORS
Add this CORS configuration to your S3 bucket:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 3. Create IAM User
1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click "Users" → "Create user"
3. Username: `traffic-violations-uploader`
4. Attach policies:
   - `AmazonS3FullAccess` (or create custom policy with limited permissions)
5. Create access key
6. Save the Access Key ID and Secret Access Key

### 4. Environment Variables
Add these to your `.env.local` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_REGION=us-east-1
```

### 5. Custom IAM Policy (Recommended)
For better security, create a custom IAM policy instead of using `AmazonS3FullAccess`:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/traffic-violations/*"
        }
    ]
}
```

## File Structure

Files are organized in S3 as:
```
your-bucket-name/
└── traffic-violations/
    └── {incident_id}/
        ├── {timestamp}.jpg
        ├── {timestamp}.webm
        └── ...
```

## Benefits of AWS S3

### 1. **Scalability**
- Unlimited storage capacity
- Automatic scaling
- Global availability

### 2. **Cost-Effective**
- Pay only for what you use
- No upfront costs
- Lifecycle policies for cost optimization

### 3. **Reliability**
- 99.999999999% (11 9's) durability
- Built-in redundancy
- Versioning support

### 4. **Performance**
- Global CDN integration
- Low latency access
- High throughput

## API Changes

### Upload Endpoint
- **URL**: `POST /api/upload-media`
- **Storage**: AWS S3 instead of Supabase
- **Response**: Same format with S3 public URL

### File URLs
- **Format**: `https://{bucket}.s3.{region}.amazonaws.com/traffic-violations/{incident_id}/{timestamp}.{ext}`
- **Access**: Public read access
- **CDN**: Can be integrated with CloudFront for better performance

## Security Considerations

### 1. **IAM Permissions**
- Use least privilege principle
- Create specific IAM user for uploads
- Rotate access keys regularly

### 2. **Bucket Policy**
- Consider adding IP restrictions
- Implement request rate limiting
- Monitor access logs

### 3. **File Validation**
- Validate file types on upload
- Implement file size limits
- Scan for malware (optional)

## Monitoring and Logging

### 1. **CloudWatch**
- Monitor S3 metrics
- Set up alarms for errors
- Track storage usage

### 2. **Access Logs**
- Enable S3 access logging
- Monitor file access patterns
- Detect unusual activity

## Cost Optimization

### 1. **Storage Classes**
- Standard for frequently accessed files
- IA (Infrequent Access) for older files
- Glacier for archival

### 2. **Lifecycle Policies**
- Automatically move old files to cheaper storage
- Delete files after retention period
- Reduce storage costs

## Testing

To test the S3 integration:
1. Add AWS credentials to `.env.local`
2. Restart your development server
3. Try uploading a photo/video
4. Check S3 bucket for uploaded files
5. Verify public URLs work

## Troubleshooting

### Common Issues:
1. **Access Denied**: Check IAM permissions
2. **CORS Errors**: Verify bucket CORS configuration
3. **Invalid Credentials**: Check environment variables
4. **Bucket Not Found**: Verify bucket name and region

### Debug Mode:
The API logs detailed information:
- File upload details
- S3 upload results
- Generated URLs
- Any errors encountered
