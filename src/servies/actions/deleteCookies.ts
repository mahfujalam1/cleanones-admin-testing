const deleteCookies = async (keys: string[]) => {
  if (typeof document !== "undefined") {
    keys.forEach((key) => {
      document.cookie = `${key}=; path=/; max-age=0;`;
    });
  } else {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      keys.forEach((key) => {
        cookieStore.delete(key);
      });
    } catch {}
  }
};

export default deleteCookies;
