"use server";
import { cookies } from "next/headers";

const deleteCookies = async (keys: string[]) => {
  const cookieStore = await cookies();
  keys.forEach((key) => {
    cookieStore.delete(key);
  });
};

export default deleteCookies;
