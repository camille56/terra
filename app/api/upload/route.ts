import { CopyObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { BUCKET_BACKUP, BUCKET_MAIN, s3Client } from "@/lib/s3";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Aucun fichier reçu." }, { status: 400 });
  }

  const key = file.name;
  const body = Buffer.from(await file.arrayBuffer());

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_MAIN,
      Key: key,
      Body: body,
      ContentType: file.type || "application/octet-stream",
    })
  );

  // Réplication synchrone vers le bucket froid (ADR 0001).
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: BUCKET_BACKUP,
      Key: key,
      CopySource: `${BUCKET_MAIN}/${encodeURIComponent(key)}`,
    })
  );

  return NextResponse.json({ key, size: body.length });
}
