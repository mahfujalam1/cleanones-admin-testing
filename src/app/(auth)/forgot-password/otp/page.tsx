"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  useResendResetCodeMutation,
  useVerifyResetOtpMutation,
} from "@/redux/api/endpoints/auth.api";
import { apiError } from "@/redux/api/apiError";
import { passwordReset } from "@/lib/auth/passwordReset";
import { getLocale, localizePath } from "@/lib/locale";
import { getAuthTranslation } from "@/lib/translations";

const CODE_LENGTH = 6;

export default function ResetOtpPage() {
  const router = useRouter();
  const locale = getLocale(usePathname());
  const t = getAuthTranslation(locale);

  const [verifyCode, { isLoading: verifying }] = useVerifyResetOtpMutation();
  const [resendCode, { isLoading: resending }] = useResendResetCodeMutation();

  const [digits, setDigits] = useState(() => Array<string>(CODE_LENGTH).fill(""));
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedEmail = passwordReset.email();
    if (storedEmail) setEmail(storedEmail);
    else setError(t.restartReset);
  }, [t.restartReset]);



  const fill = (start: number, value: string) => {
    const incoming = value.replace(/\D/g, "").slice(0, CODE_LENGTH - start);
    if (!incoming) return;

    setDigits((current) =>
      current.map((digit, position) => {
        const offset = position - start;
        return offset >= 0 && offset < incoming.length ? incoming[offset] : digit;
      }),
    );
    setError("");
    setInfo("");
    inputs.current[Math.min(start + incoming.length, CODE_LENGTH - 1)]?.focus();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = event.target.value.replace(/\D/g, "");
    
    if (!value) {
      setDigits((current) => current.map((digit, position) => (position === index ? "" : digit)));
      return;
    }
    fill(index, value);
  };

  const handlePaste = (event: React.ClipboardEvent, index: number) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();
    
    
    fill(pasted.length >= CODE_LENGTH ? 0 : index, pasted);
  };

  const handleBackspace = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key !== "Backspace" || digits[index]) return;
    event.preventDefault();
    if (index === 0) return;
    setDigits((current) => current.map((digit, position) => (position === index - 1 ? "" : digit)));
    inputs.current[index - 1]?.focus();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = digits.join("");
    if (code.length !== CODE_LENGTH) {
      setError(t.completeOtp);
      return;
    }
    if (!email) {
      setError(t.restartReset);
      return;
    }

    try {
      
      await verifyCode({ email, resetCode: Number(code) }).unwrap();
      passwordReset.markVerified();
      router.push(localizePath("/forgot-password/reset", locale));
    } catch (cause) {
      setError(apiError(cause));
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError(t.restartReset);
      return;
    }
    setError("");
    setInfo("");

    try {
      const message = await resendCode({ email }).unwrap();
      setInfo(message || t.otpSent);
    } catch (cause) {
      setError(apiError(cause));
    }
  };

  return (
    <div className="w-full max-w-md space-y-5 rounded border border-slate-200 bg-white p-6 sm:p-8">
      <div className="flex select-none flex-col items-center">
        <div className="mb-4 flex items-center justify-center">
          <img src="/cleanones.png" className="h-auto w-24 object-contain" alt="CleanOnes" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{t.otpTitle}</h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          {t.otpDescription}{" "}
          {email ? <span className="font-semibold text-slate-700">{email}</span> : t.emailFallback}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputs.current[index] = element;
              }}
              value={digit}
              onChange={(event) => handleChange(event, index)}
              onPaste={(event) => handlePaste(event, index)}
              onKeyDown={(event) => handleBackspace(event, index)}
              onFocus={(event) => event.target.select()}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${index + 1}`}
              className="h-12 w-11 rounded border border-slate-200 bg-white text-center text-lg font-bold text-slate-800 outline-none transition-colors focus:border-primary"
              required
            />
          ))}
        </div>

        {error && (
          <p role="alert" className="text-center text-xs font-medium text-red-500">
            {error}
          </p>
        )}
        {info && <p className="text-center text-xs font-medium text-emerald-600">{info}</p>}

        <button
          type="submit"
          disabled={verifying}
          className="h-10 w-full cursor-pointer rounded bg-primary text-sm font-semibold text-white shadow-sm hover:bg-[#0284c7] disabled:opacity-60"
        >
          {verifying ? t.sending : t.verifyCode}
        </button>
      </form>

      <p className="text-center text-[11px] text-slate-400">
        Didn&apos;t receive the code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="font-semibold text-primary hover:underline disabled:opacity-60"
        >
          {resending ? t.sending : t.resendCode}
        </button>
      </p>
    </div>
  );
}
