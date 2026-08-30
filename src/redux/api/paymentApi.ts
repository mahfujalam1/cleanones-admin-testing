// import { tagTypes } from "../tagTypes";
// import { baseApi } from "./baseApi";

// const paymentApi = baseApi.injectEndpoints({
//   endpoints: (build) => ({
//     createPayment: build.mutation({
//       query: (paymentObject) => {
//         // console.log("Sending payment object to API:", paymentObject);
//         return {
//           url: `/payment/create`, // Ensure the correct endpoint
//           method: "POST",
//           body: paymentObject, // Send the likeObject as the body
//         };
//       },
//       invalidatesTags: [tagTypes.payments], // Cache invalidation
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

// export const { useCreatePaymentMutation, useGetAllLikesQuery } = paymentApi;
