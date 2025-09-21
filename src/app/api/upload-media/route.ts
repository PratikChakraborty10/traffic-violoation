import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const incidentId = formData.get("incidentId") as string;

    console.log("Upload API called with:", {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      incidentId,
    });

    if (!file || !incidentId) {
      console.error("Missing required fields:", { hasFile: !!file, hasIncidentId: !!incidentId });
      return NextResponse.json(
        { error: "File and incident ID are required" },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      console.error("File too large:", { fileSize: file.size, maxSize });
      return NextResponse.json(
        { error: "File size must not exceed 10MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${incidentId}/${Date.now()}.${fileExt}`;
    console.log("Generated filename:", fileName);

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("File converted to Buffer, size:", buffer.byteLength);

    // Upload file to S3
    console.log("Uploading to S3...");
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!, // bucket name
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
        ACL: 'public-read',
      })
    );

    console.log("Upload successful:", fileName);

    // Construct public URL (⚠️ only works if bucket is public or has correct policy)
    const publicUrl = `https://${process.env.AWS_S3_BUCKET!}.s3.${process.env.AWS_REGION!}.amazonaws.com/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: fileName,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
