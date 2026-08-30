// import { tagTypes } from "../tagTypes";
// import { baseApi } from "./baseApi";

// const commentApi = baseApi.injectEndpoints({
//   endpoints: (build) => ({
//     createComment: build.mutation({
//       query: ({ commentObject, postId }) => {
//         console.log({ commentObject, postId });
//         return {
//           url: `/comments/${postId}`, // Use the postId in the URL
//           method: "POST",
//           body: commentObject, // Send the commentObject as the body of the request
//         };
//       },
//       invalidatesTags: [tagTypes.comments, tagTypes.posts],
//     }),

//     updateComment: build.mutation({
//       query: (updateComment) => {
//         return {
//           url: `/comments/update`,
//           method: "PATCH",
//           body: updateComment,
//         };
//       },
//       invalidatesTags: [tagTypes.comments, tagTypes.posts],
//     }),

//     deleteComment: build.mutation({
//       query: (commentInfo) => ({
//         url: `/comments/delete`,
//         method: "DELETE",
//         body: commentInfo,
//       }),
//       invalidatesTags: [tagTypes.comments, tagTypes.posts],
//     }),


//     getAllComments: build.query({
//       query: () => ({
//         url: `/comments`,
//         method: "GET",
//       }),
//       providesTags: [tagTypes.comments],
//     }),
//   }),
// });

// export const { useCreateCommentMutation, useGetAllCommentsQuery, useUpdateCommentMutation, useDeleteCommentMutation } =
//   commentApi;
