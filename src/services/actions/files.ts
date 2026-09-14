import { authenticated, type ActionResult } from "./auth";

export type UploadConversationFilesResponse = {
  images: string[];
  videos: string[];
  pdfs: string[];
};

/**
 * POST /file/upload-conversation-files
 * Multipart form data containing `conversation_image` (image files) or `conversation_pdf` (pdf files).
 * Max 50 MiB per file.
 */
export async function uploadConversationFiles(
  formData: FormData
): Promise<ActionResult<UploadConversationFilesResponse>> {
  const result = await authenticated<any>("/file/upload-conversation-files", {
    method: "POST",
    body: formData,
  });

  if (!result.success) {
    return result;
  }

  const payload = (result.data as any)?.data ?? result.data;
  return {
    success: true,
    data: {
      images: Array.isArray(payload?.images) ? payload.images : [],
      videos: Array.isArray(payload?.videos) ? payload.videos : [],
      pdfs: Array.isArray(payload?.pdfs) ? payload.pdfs : [],
    },
  };
}

/**
 * POST /file/delete-files
 * Deletes files from S3/CDN by URL.
 */
export async function deleteUploadedFiles(
  files: string[]
): Promise<ActionResult<null>> {
  if (!files || files.length === 0) {
    return { success: true, data: null };
  }

  const result = await authenticated<any>("/file/delete-files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files }),
  });

  if (!result.success) {
    return result;
  }

  return { success: true, data: null };
}
