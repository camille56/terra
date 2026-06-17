import { CopyObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { BUCKET_BACKUP, BUCKET_MAIN, listAllObjects, s3Client } from "@/lib/s3";

// Restauration = miroir complet : le bucket principal devient une copie exacte
// du bucket froid (voir CONTEXT.md, terme "Restauration").
export async function POST() {
  const [backupObjects, mainObjects] = await Promise.all([
    listAllObjects(BUCKET_BACKUP),
    listAllObjects(BUCKET_MAIN),
  ]);

  const backupKeys = new Set(backupObjects.map((object) => object.Key).filter(Boolean) as string[]);
  const mainKeys = new Set(mainObjects.map((object) => object.Key).filter(Boolean) as string[]);

  for (const key of backupKeys) {
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: BUCKET_MAIN,
        Key: key,
        CopySource: `${BUCKET_BACKUP}/${encodeURIComponent(key)}`,
      })
    );
  }

  const keysToDelete = [...mainKeys].filter((key) => !backupKeys.has(key));
  for (let i = 0; i < keysToDelete.length; i += 1000) {
    const chunk = keysToDelete.slice(i, i + 1000);
    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET_MAIN,
        Delete: { Objects: chunk.map((Key) => ({ Key })) },
      })
    );
  }

  return NextResponse.json({ restored: backupKeys.size, deleted: keysToDelete.length });
}
