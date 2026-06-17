import { NextResponse } from "next/server";
import { BUCKET_MAIN, listAllObjects } from "@/lib/s3";

export async function GET() {
  const objects = await listAllObjects(BUCKET_MAIN);

  const files = objects
    .filter((object) => object.Key)
    .map((object) => ({
      key: object.Key as string,
      size: object.Size ?? 0,
      lastModified: object.LastModified?.toISOString() ?? null,
    }))
    .sort((a, b) => (b.lastModified ?? "").localeCompare(a.lastModified ?? ""));

  return NextResponse.json({ files });
}
