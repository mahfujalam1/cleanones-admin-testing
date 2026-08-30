// /* eslint-disable @typescript-eslint/no-explicit-any */

// import { tagTypes } from "../tagTypes";
// import { baseApi } from "./baseApi";

// const postsApi = baseApi.injectEndpoints({
//   endpoints: (build) => ({
//     createPost: build.mutation({
//       query: (data) => {
//         return {
//           url: `/post/create-post`,
//           method: "POST",
//           body: data, // 'body' should be used instead of 'data' for the payload in RTK Query
//         };
//       },
//       invalidatesTags: [tagTypes.posts],
//     }),

//     savePost: build.mutation({
//       query: ({ saveData }) => {
//         // console.log("Saving post data:", saveData); // Log the saveData here
//         return {
//           url: `/favorite/create-favorite`,
//           method: "POST",
//           body: saveData, // 'body' should be used instead of 'data' for the payload in RTK Query
//         };
//       },
//       invalidatesTags: [tagTypes.posts],
//     }),

//     getAllPosts: build.query({
//       query: (arg: Record<string, any>) => ({
//         url: "/post/posts",
//         method: "GET",
//         params: arg,
//       }),
//       providesTags: [tagTypes.posts],
//     }),

//     getSinglePost: build.query({
//       query: (postId) => ({
//         url: `/post/post/${postId}`,
//         method: "GET",
//       }),
//       providesTags: [tagTypes.posts],
//     }),

//     updatePost: build.mutation({
//       query: ({ updateData, postId }) => {
//         // console.log({ updateData, postId });
//         return {
//           url: `/post/post/${postId}`, // Use the postId in the URL
//           method: "PATCH",
//           body: updateData, // Send the commentObject as the body of the request
//         };
//       },
//       invalidatesTags: [tagTypes.posts],
//     }),
//     deletePost: build.mutation({
//       query: (id) => ({
//         url: `/post/post/${id}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: [tagTypes.posts],
//     }),
//     getMyPosts: build.query({
//       query: () => ({
//         url: "/post/my-posts",
//         method: "GET",
//       }),
//       providesTags: [tagTypes.posts],
//     }),
//   }),
// });

// export const {
//   useCreatePostMutation,
//   useGetAllPostsQuery,
//   useGetSinglePostQuery,
//   useDeletePostMutation,
//   useUpdatePostMutation,
//   useGetMyPostsQuery,
//   useSavePostMutation,
// } = postsApi;
