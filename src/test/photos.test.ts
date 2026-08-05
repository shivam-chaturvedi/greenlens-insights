import { describe, it, expect, vi } from "vitest";
import {
  validatePhotoFile,
  compressImage,
  getPhotoPublicUrl,
  ALLOWED_IMAGE_TYPES,
  MAX_PHOTO_FILE_SIZE,
  PHOTOS_BUCKET,
} from "@/lib/photos";

describe("Photos Gallery Utility Functions", () => {
  it("should validate allowed image file types", () => {
    const validFile = new File(["test image data"], "sample.jpg", { type: "image/jpeg" });
    const result = validatePhotoFile(validFile);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should reject disallowed file types", () => {
    const pdfFile = new File(["pdf data"], "document.pdf", { type: "application/pdf" });
    const result = validatePhotoFile(pdfFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Unsupported file type");
  });

  it("should reject oversized image files (> 10MB)", () => {
    const largeBlob = new ArrayBuffer(MAX_PHOTO_FILE_SIZE + 1024);
    const oversizedFile = new File([largeBlob], "huge.png", { type: "image/png" });
    const result = validatePhotoFile(oversizedFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("is too large");
  });

  it("should generate public URL correctly for a storage path", () => {
    const path = "uploads/123-test.png";
    const url = getPhotoPublicUrl(path);
    expect(url).toContain(PHOTOS_BUCKET);
    expect(url).toContain(path);
  });

  it("should return original file when compressing non-browser or small files", async () => {
    const smallFile = new File(["tiny content"], "tiny.png", { type: "image/png" });
    const result = await compressImage(smallFile);
    expect(result).toBe(smallFile);
  });

  it("should preserve GIF files without compressing", async () => {
    const gifFile = new File(["gif content"], "anim.gif", { type: "image/gif" });
    const result = await compressImage(gifFile);
    expect(result).toBe(gifFile);
  });
});
