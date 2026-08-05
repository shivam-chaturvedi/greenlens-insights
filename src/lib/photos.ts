import { supabase } from "./supabaseClient";

export const PHOTOS_BUCKET = "photos-gallery";
export const MAX_PHOTO_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

export type PhotoRow = {
  id: string;
  caption: string | null;
  storage_bucket: string;
  storage_path: string;
  display_order: number;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Photo = {
  id: string;
  caption: string;
  storageBucket: string;
  storagePath: string;
  displayOrder: number;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
  publicUrl: string;
};

export const validatePhotoFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type || file.name}. Allowed types are JPEG, PNG, WebP, GIF, AVIF.`,
    };
  }
  if (file.size > MAX_PHOTO_FILE_SIZE) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File "${file.name}" is too large (${sizeInMb}MB). Maximum allowed size is 10MB.`,
    };
  }
  return { valid: true };
};

export const compressImage = async (
  file: File,
  maxWidth = 2048,
  maxHeight = 2048,
  quality = 0.85
): Promise<File> => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  // Preserve vector and animation formats
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  // Skip compression for small files
  if (file.size < 200 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = file.type === "image/png" ? "image/png" : "image/webp";
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }
          const extension = mimeType === "image/webp" ? ".webp" : ".png";
          const newName = file.name.replace(/\.[^/.]+$/, "") + extension;
          const compressedFile = new File([blob], newName, {
            type: mimeType,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
};

export const getPhotoPublicUrl = (path: string, bucket: string = PHOTOS_BUCKET): string => {
  if (!path) return "";
  const targetBucket = bucket || PHOTOS_BUCKET;
  const { data } = supabase.storage.from(targetBucket).getPublicUrl(path);
  return data.publicUrl ?? "";
};

export const fetchPhotos = async (): Promise<Photo[]> => {
  const { data, error } = await supabase
    .from<PhotoRow>("photos")
    .select("id, caption, storage_bucket, storage_path, display_order, uploaded_by, created_at, updated_at")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    // If the photos table doesn't exist yet, return empty list cleanly
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      console.warn("photos table does not exist in Supabase database yet. Run migration 019.");
      return [];
    }
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    caption: row.caption ?? "",
    storageBucket: row.storage_bucket ?? PHOTOS_BUCKET,
    storagePath: row.storage_path ?? "",
    displayOrder: row.display_order ?? 0,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publicUrl: getPhotoPublicUrl(row.storage_path, row.storage_bucket),
  }));
};

const sanitizeFileName = (name: string) => name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");

/**
 * Uploads a file to storage, dynamically creating the bucket if missing,
 * or using a fallback public bucket if needed.
 */
const uploadToStorage = async (filePath: string, file: File): Promise<{ bucket: string; path: string }> => {
  let targetBucket = PHOTOS_BUCKET;
  let uploadRes = await supabase.storage.from(targetBucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadRes.error) {
    const isBucketNotFound =
      uploadRes.error.message?.includes("Bucket not found") ||
      (uploadRes.error as any).statusCode === "404" ||
      (uploadRes.error as any).status === 404;

    if (isBucketNotFound) {
      // 1. Attempt to create the 'photos-gallery' bucket via API
      try {
        await supabase.storage.createBucket(PHOTOS_BUCKET, { public: true });
      } catch {
        // ignore bucket creation error
      }

      // Retry upload to photos-gallery
      uploadRes = await supabase.storage.from(PHOTOS_BUCKET).upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

      // 2. If still Bucket not found, try fallback existing buckets
      if (uploadRes.error && uploadRes.error.message?.includes("Bucket not found")) {
        const fallbacks = [
          "journalism-article-images",
          "community-post-images",
          "consulting-reports",
          "community-post-media",
        ];
        for (const fallback of fallbacks) {
          const retry = await supabase.storage.from(fallback).upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });
          if (!retry.error) {
            return { bucket: fallback, path: filePath };
          }
        }
      }
    }
  }

  if (uploadRes.error) {
    throw new Error(`Upload failed: ${uploadRes.error.message}`);
  }

  return { bucket: targetBucket, path: filePath };
};

export const uploadSinglePhoto = async (
  file: File,
  caption: string,
  displayOrder: number,
  userId?: string
): Promise<Photo> => {
  const validation = validatePhotoFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const compressedFile = await compressImage(file);
  const fileName = `${crypto.randomUUID()}-${sanitizeFileName(compressedFile.name)}`;
  const filePath = `uploads/${fileName}`;

  const { bucket: usedBucket, path: uploadedPath } = await uploadToStorage(filePath, compressedFile);

  const { data: dbData, error: dbError } = await supabase
    .from<PhotoRow>("photos")
    .insert({
      caption: caption.trim(),
      storage_bucket: usedBucket,
      storage_path: uploadedPath,
      display_order: displayOrder,
      uploaded_by: userId || null,
    })
    .select()
    .single();

  if (dbError || !dbData) {
    // Cleanup storage file if DB insert fails
    await supabase.storage.from(usedBucket).remove([uploadedPath]);
    throw new Error(`Failed to save photo metadata: ${dbError?.message || "Unknown error"}`);
  }

  return {
    id: dbData.id,
    caption: dbData.caption ?? "",
    storageBucket: dbData.storage_bucket,
    storagePath: dbData.storage_path,
    displayOrder: dbData.display_order,
    uploadedBy: dbData.uploaded_by,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at,
    publicUrl: getPhotoPublicUrl(dbData.storage_path, dbData.storage_bucket),
  };
};

export const updatePhoto = async (
  id: string,
  updates: {
    caption?: string;
    displayOrder?: number;
    file?: File;
    oldStoragePath?: string;
    oldStorageBucket?: string;
  }
): Promise<void> => {
  let newStoragePath: string | undefined;
  let newStorageBucket: string | undefined;

  if (updates.file) {
    const validation = validatePhotoFile(updates.file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const compressedFile = await compressImage(updates.file);
    const fileName = `${crypto.randomUUID()}-${sanitizeFileName(compressedFile.name)}`;
    const filePath = `uploads/${fileName}`;

    const uploadRes = await uploadToStorage(filePath, compressedFile);
    newStoragePath = uploadRes.path;
    newStorageBucket = uploadRes.bucket;
  }

  const payload: Partial<PhotoRow> = {};
  if (updates.caption !== undefined) {
    payload.caption = updates.caption.trim();
  }
  if (updates.displayOrder !== undefined) {
    payload.display_order = updates.displayOrder;
  }
  if (newStoragePath && newStorageBucket) {
    payload.storage_path = newStoragePath;
    payload.storage_bucket = newStorageBucket;
  }

  const { error: updateError } = await supabase
    .from("photos")
    .update(payload)
    .eq("id", id);

  if (updateError) {
    if (newStoragePath && newStorageBucket) {
      await supabase.storage.from(newStorageBucket).remove([newStoragePath]);
    }
    throw updateError;
  }

  // Clean up old file if replacement succeeded
  if (newStoragePath && updates.oldStoragePath) {
    const oldBucket = updates.oldStorageBucket || PHOTOS_BUCKET;
    await supabase.storage.from(oldBucket).remove([updates.oldStoragePath]);
  }
};

export const deletePhoto = async (photo: Photo): Promise<void> => {
  const bucket = photo.storageBucket || PHOTOS_BUCKET;
  if (photo.storagePath) {
    await supabase.storage.from(bucket).remove([photo.storagePath]);
  }

  const { error } = await supabase.from("photos").delete().eq("id", photo.id);
  if (error) {
    throw error;
  }
};

export const reorderPhotos = async (
  items: { id: string; displayOrder: number }[]
): Promise<void> => {
  const updates = items.map((item) =>
    supabase
      .from("photos")
      .update({ display_order: item.displayOrder })
      .eq("id", item.id)
  );

  const results = await Promise.all(updates);
  const firstError = results.find((res) => res.error);
  if (firstError?.error) {
    throw firstError.error;
  }
};
