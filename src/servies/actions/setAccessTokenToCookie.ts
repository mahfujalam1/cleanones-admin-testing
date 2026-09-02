/* eslint-disable @typescript-eslint/no-explicit-any */
const setAccessTokenToCookies = async (token: string, option?: any) => {
  if (typeof document !== "undefined") {
    document.cookie = `cleanones_manager_access_token=${encodeURIComponent(token)}; path=/; SameSite=Lax;`;
    if (option && option.redirect) {
      window.location.href = option.redirect;
    }
  } else {
    try {
      const { cookies } = await import("next/headers");
      (await cookies()).set("cleanones_manager_access_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
    } catch {}
  }
};

export default setAccessTokenToCookies;
