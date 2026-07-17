"use client";

/**
 * Supabase Storage への素材アップロード
 * バケット名は "media"（Phase 2 適用時に作成。README 参照）。
 */
import { getBrowserClient } from "@/lib/supabase/client";

const BUCKET = "media";

export interface UploadResult {
  url: string;
  path: string;
}

export async function uploadMedia(
  file: File,
  artistId: string,
): Promise<UploadResult> {
  const sb = getBrowserClient();
  const safeName = file.name.replace(/[^\w.\-]/g, "_");
  const path = `${artistId}/${Date.now()}_${safeName}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}
