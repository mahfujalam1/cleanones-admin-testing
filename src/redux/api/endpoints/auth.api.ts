import { clearRefreshCooldown } from "@/lib/auth/refresh";
import { tokenStore } from "@/lib/auth/tokenStore";
import {
  clearSessionMarker,
  userFromAccessToken,
  writeSessionMarker,
  type DashboardUser,
} from "@/lib/auth/session";
import { setUser } from "@/redux/slices/auth.slice";
import { baseApi, type ApiMeta } from "../baseApi";

export type LoginRequest = {
  email: string;
  password: string;
  /** Push device ID, when the browser has registered for notifications. */
  playerId?: string;
};

type Tokens = { accessToken: string; refreshToken?: string; role?: string };

/**
 * A login result the UI can act on directly. `user` is null when the credentials were valid but
 * the account is not a manager-side role, which the login page reports as a permission error.
 */
export type AuthSession = { accessToken: string; user: DashboardUser | null };

/** Endpoints that answer `data: null` carry their result in the envelope's message. */
const messageOnly = (_data: null, meta: ApiMeta | undefined) => meta?.message ?? "";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthSession, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body: { ...body, platform: "web" },
      }),
      transformResponse: (tokens: Tokens, _meta, arg): AuthSession => ({
        accessToken: tokens.accessToken,
        user: userFromAccessToken(tokens.accessToken, { email: arg.email, role: tokens.role }),
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data: session } = await queryFulfilled;
        // A non-manager account gets no session; the login page turns the null user into an error.
        if (!session.user) return;
        tokenStore.set(session.accessToken);
        writeSessionMarker(session.user.role);
        clearRefreshCooldown();
        dispatch(setUser(session.user));
      },
    }),

    forgotPassword: builder.mutation<string, { email: string }>({
      query: (body) => ({ url: "/auth/forget-password", method: "POST", body }),
      transformResponse: messageOnly,
    }),

    resendResetCode: builder.mutation<string, { email: string }>({
      query: (body) => ({ url: "/auth/resend-reset-code", method: "POST", body }),
      transformResponse: messageOnly,
    }),

    verifyResetOtp: builder.mutation<string, { email: string; resetCode: number }>({
      query: (body) => ({ url: "/auth/verify-reset-otp", method: "POST", body }),
      transformResponse: messageOnly,
    }),

    /**
     * Requires a prior `verifyResetOtp`. The API returns tokens here, but they are deliberately
     * discarded: the user is sent back to the login page so the new password is proven once.
     */
    resetPassword: builder.mutation<string, { email: string; password: string; confirmPassword: string }>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
      transformResponse: (_tokens: Tokens, meta: ApiMeta | undefined) => meta?.message ?? "",
    }),

    changePassword: builder.mutation<
      string,
      { oldPassword: string; newPassword: string; confirmNewPassword: string }
    >({
      query: (body) => ({ url: "/auth/change-password", method: "POST", body }),
      transformResponse: messageOnly,
    }),
  }),
});

/**
 * Signs out locally. The API exposes no logout route, so the HttpOnly refresh cookie can only be
 * dropped by the backend — clearing the session marker is what actually ends the session here:
 * `proxy.ts` gates on it, and nothing will attempt a refresh without it.
 */
export function clearLocalSession() {
  tokenStore.clear();
  clearSessionMarker();
}

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useResendResetCodeMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApi;
