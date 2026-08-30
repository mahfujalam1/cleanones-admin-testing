/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { cookies } from "next/headers";

import { redirect } from "next/navigation";
const setAccessTokenToCookies = async (token: string, option?: any) => {
  (await cookies()).set("cleanones_manager_access_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
  if (option && option.redirect) {
    redirect(option.redirect);
  }
};

export default setAccessTokenToCookies;
