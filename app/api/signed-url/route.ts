import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  const extractedKey = url.split('s3://')[1];
  const fileExtension = extractedKey.split('.').pop();

  let contentType;
  switch (fileExtension) {
    case 'json':
      contentType = 'application/json';
      break;
    case 'm4a':
      contentType = 'audio/x-m4a';
      break;
    default:
      contentType = 'application/octet-stream';
  }

  console.log('Generating signed URL:', {
    originalUrl: url,
    extractedKey,
    fileExtension,
    contentType
  });

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: extractedKey,
    ResponseContentType: contentType,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log('Generated signed URL for key:', {
      key: extractedKey,
      contentType,
      urlLength: signedUrl.length,
      baseUrl: signedUrl.split('?')[0]
    });

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
  }
} 