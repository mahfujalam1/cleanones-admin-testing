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
  remember_me?: boolean;
  playerId?: string;
};

type Tokens = { accessToken: string; refreshToken?: string; role?: string };

export type AuthSession = { accessToken: string; user: DashboardUser | null };

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
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const { data: session } = await queryFulfilled;

        if (!session.user) return;
        tokenStore.set(session.accessToken);
        writeSessionMarker(session.user.role, Boolean(arg.remember_me));
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
