import { ListObjectsV2Command, S3Client, type _Object } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.S3_REGION ?? "us-east-1",
  endpoint: process.env.S3_ENDPOINT || undefined,
  forcePathStyle: process.env.S3_USE_PATH_STYLE !== "false",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "",
  },
});

export const BUCKET_MAIN = process.env.BUCKET_MAIN ?? "app-data-main";
export const BUCKET_BACKUP = process.env.BUCKET_BACKUP ?? "app-data-backup";

export async function listAllObjects(bucket: string): Promise<_Object[]> {
  const objects: _Object[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await s3Client.send(
      new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: continuationToken })
    );
    objects.push(...(response.Contents ?? []));
    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return objects;
}
