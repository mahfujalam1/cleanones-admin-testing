"use client";

import { usePathname } from "next/navigation";
import { getLocale, localizePath } from "@/lib/locale";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/slices/auth.slice";
import { setSignOutModalOpen } from "@/redux/slices/ui.slice";
import { clearLocalSession } from "@/redux/api/endpoints/auth.api";
import { baseApi } from "@/redux/api/baseApi";
import { getDashboardTranslation } from "@/lib/translations";

export function SignOutConfirmation() {
  const locale = getLocale(usePathname());
  const t = getDashboardTranslation(locale);
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.signOutModalOpen);

  const close = () => dispatch(setSignOutModalOpen(false));
  const confirm = () => {
    dispatch(setSignOutModalOpen(false));
    clearLocalSession();
    dispatch(logout());
    
    dispatch(baseApi.util.resetApiState());
    window.location.href = localizePath("/login", locale);
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && close()}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="modal-backdrop fixed inset-0 z-[100] opacity-100 transition-opacity duration-200 ease-[var(--ease-out)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <AlertDialog.Viewport className="fixed inset-0 z-[101] flex items-center justify-center p-4">
          <AlertDialog.Popup className="shadow w-full max-w-sm origin-center rounded-md border border-border bg-white p-6 opacity-100 transition-[transform,opacity] duration-200 ease-[var(--ease-out)] data-[ending-style]:scale-[0.96] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.96] data-[starting-style]:opacity-0">
            <AlertDialog.Title className="text-lg font-semibold text-foreground">{t.nav.signOut}</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">{t.nav.signOut}</AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Close className="h-9 rounded border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60">{t.common.cancel}</AlertDialog.Close>
              <button type="button" onClick={confirm} className="h-9 rounded bg-destructive px-4 text-sm font-semibold text-white transition-[opacity,transform] hover:opacity-90">{t.nav.signOut}</button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
