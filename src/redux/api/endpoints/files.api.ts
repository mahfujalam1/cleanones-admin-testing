import { baseApi } from "../baseApi";
import type { UploadConversationFilesResponse } from "@/services/actions/files";

export const filesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    uploadConversationFiles: builder.mutation<UploadConversationFilesResponse, FormData>({
      query: (body) => ({
        url: "/file/upload-conversation-files",
        method: "POST",
        body,
      }),
    }),
    deleteUploadedFiles: builder.mutation<null, { files: string[] }>({
      query: (body) => ({
        url: "/file/delete-files",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useUploadConversationFilesMutation,
  useDeleteUploadedFilesMutation,
} = filesApi;
