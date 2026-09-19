import { baseApi } from "../baseApi";
import { tagTypes } from "../../tagTypes";
import type { LegalSlug } from "@/lib/legal-content";

const RESOURCE: Record<LegalSlug, string> = {
  "privacy-policy": "privacy-policy",
  "terms-and-conditions": "terms-conditions",
  "about-us": "about-us",
};

export type LegalDocument = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type LegalPayload = {
  _id?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
} | null;

const toDocument = (payload: LegalPayload): LegalDocument => ({
  id: payload?._id ?? "",
  content: payload?.description ?? "",
  createdAt: payload?.createdAt ?? "",
  updatedAt: payload?.updatedAt ?? "",
});

export const legalApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getLegalDocument: builder.query<LegalDocument, LegalSlug>({
      query: (slug) => `/manage/get-${RESOURCE[slug]}`,
      transformResponse: (response: LegalPayload) => toDocument(response),
      providesTags: (_res, _err, slug) => [{ type: tagTypes.legal, id: slug }],
    }),

    saveLegalDocument: builder.mutation<
      LegalDocument,
      { slug: LegalSlug; id?: string; content: string }
    >({
      async queryFn({ slug, id, content }, _api, _options, fetchWithBQ) {
        const headers = { "Content-Type": "application/json" };
        const body = { description: content };

        const result = id
          ? await fetchWithBQ({
              url: `/manage/edit-${RESOURCE[slug]}/${encodeURIComponent(id)}`,
              method: "PATCH",
              headers,
              body,
            })
          : await fetchWithBQ({
              url: `/manage/add-${RESOURCE[slug]}`,
              method: "POST",
              headers,
              body,
            });

        if (result.error) return { error: result.error };

        const saved = toDocument(result.data as LegalPayload);
        return {
          data: { ...saved, id: saved.id || id || "", content: saved.content || content },
        };
      },
      invalidatesTags: (_res, _err, { slug }) => [{ type: tagTypes.legal, id: slug }],
    }),
  }),
});

export const { useGetLegalDocumentQuery, useSaveLegalDocumentMutation } = legalApi;
