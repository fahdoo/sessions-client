import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = params.id;
  const { transcript } = await request.json();

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: `transcripts/${sessionId}.json`,
      Body: JSON.stringify(transcript),
      ContentType: 'application/json',
    });

    await s3Client.send(command);

    return NextResponse.json({ 
      success: true,
      message: 'Transcript saved to S3 successfully'
    });
  } catch (error) {
    console.error('Error saving to S3:', error);
    return NextResponse.json(
      { error: 'Failed to save transcript to S3' },
      { status: 500 }
    );
  }
} 