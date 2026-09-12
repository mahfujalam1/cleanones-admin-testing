// import { tagTypes } from "../tagTypes";
// import { baseApi } from "./baseApi";

// const likeApi = baseApi.injectEndpoints({
//   endpoints: (build) => ({
//     createLike: build.mutation({
//       query: (likeObject) => {
//         console.log("Sending like object to API:", likeObject);
//         return {
//           url: `/likes`, // Ensure the correct endpoint
//           method: "POST",
//           body: likeObject, // Send the likeObject as the body
//         };
//       },
//       invalidatesTags: [tagTypes.posts, tagTypes.likes], // Cache invalidation
//     }),

//     getAllLikes: build.query({
//       query: () => {
//         return {
//           url: '/likes',
//           method: "GET",
//         };
//       },
//       providesTags: [tagTypes.likes],
//     }),
//   }),
// });

// export const { useCreateLikeMutation, useGetAllLikesQuery } = likeApi;
