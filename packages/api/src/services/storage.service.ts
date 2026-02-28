import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT || undefined,
  forcePathStyle: !!process.env.S3_ENDPOINT, // for MinIO
  credentials: process.env.S3_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      }
    : undefined,
});

const DEFAULT_BUCKET = process.env.S3_BUCKET || 'sudanflood-uploads';

export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  bucket: string = DEFAULT_BUCKET,
): Promise<{ url: string; key: string; bucket: string }> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return { url, key, bucket };
}

export async function generatePresignedDownloadUrl(
  key: string,
  bucket: string = DEFAULT_BUCKET,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function deleteObject(
  key: string,
  bucket: string = DEFAULT_BUCKET,
): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await s3Client.send(command);
}
