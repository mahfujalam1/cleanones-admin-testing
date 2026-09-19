import { baseApi } from "../baseApi";

export type UploadConversationFilesResponse = {
  images: string[];
  videos: string[];
  pdfs: string[];
};

const asUrlList = (value: unknown): string[] => (Array.isArray(value) ? (value as string[]) : []);

export const filesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    uploadConversationFiles: builder.mutation<UploadConversationFilesResponse, FormData>({
      query: (body) => ({
        url: "/file/upload-conversation-files",
        method: "POST",
        body,
      }),
      transformResponse: (response: Partial<UploadConversationFilesResponse> | null) => ({
        images: asUrlList(response?.images),
        videos: asUrlList(response?.videos),
        pdfs: asUrlList(response?.pdfs),
      }),
    }),
    deleteUploadedFiles: builder.mutation<null, { files: string[] }>({
      query: (body) => ({
        url: "/file/delete-files",
        method: "POST",
        body,
      }),
      transformResponse: () => null,
    }),
  }),
});

export const { useUploadConversationFilesMutation, useDeleteUploadedFilesMutation } = filesApi;
