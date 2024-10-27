import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getSignedUrl(s3Url: string, expiresIn: number = 3600): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET;
  
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET is not defined in the environment variables');
  }

  if (!s3Url.startsWith(`s3://${bucketName}/`)) {
    throw new Error('Invalid S3 URL format');
  }

  const s3Key = s3Url.replace(`s3://${bucketName}/`, '');

  if (!s3Key) {
    throw new Error('Invalid S3 URL: no key found');
  }

  console.log('Generating signed URL for S3 key:', s3Key);

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });
  return await awsGetSignedUrl(s3Client, command, { expiresIn });
}

export const getSignedAudioUrl = (audioUrl: string) => getSignedUrl(audioUrl);
export const getSignedTranscriptUrl = (transcriptUrl: string) => getSignedUrl(transcriptUrl);
