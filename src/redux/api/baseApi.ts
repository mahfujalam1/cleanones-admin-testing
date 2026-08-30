
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { tagTypeList } from "../tagTypes"; // Adjust the path as necessary

// Define a service using a base URL and expected endpoints
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: ``,
  }),
  tagTypes: tagTypeList,
  endpoints: () => ({
    
  }),
});

// Export hooks for usage in functional components
export const {  } = baseApi; // Updated hook name
