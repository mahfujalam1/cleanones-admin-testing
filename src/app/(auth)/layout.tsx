import React from 'react';
import { MdCheck, MdLockOutline, MdOutlineAutoAwesome } from 'react-icons/md';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen bg-[#f7f8fa]">
      <aside className="relative hidden w-1/2 overflow-hidden border-r border-white/10 bg-[#111827] p-10 text-slate-300 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-36 top-24 h-72 w-72 rounded-full border border-white/60" />
        <div className="pointer-events-none absolute -right-20 top-40 h-48 w-48 rounded-full border border-white/60" />
        <div className="relative z-10"><img src="/cleanones.png" className="h-auto w-32 object-contain" alt="CleanOnes" /></div>
        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 px-3 py-1.5 text-[11px] font-medium text-white"><MdOutlineAutoAwesome className="text-primary" /> One dashboard for every cleaning workflow</span>
            <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-white xl:text-4xl">Run cleaner operations from one intelligent workspace.</h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">Manage live shifts, cleaning teams, quality reviews, and every location from one secure dashboard.</p>
          </div>
          <ul className="space-y-3 text-sm text-white">
            {['Plan and monitor every shift', 'Manage teams and locations in real time', 'Turn quality data into clear decisions'].map((label) => <li key={label} className="flex items-center gap-3"><MdCheck className="h-4 w-4 rounded-full border border-primary p-0.5 text-primary" />{label}</li>)}
          </ul>
          <div className="max-w-md rounded border border-white/15 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between text-xs text-white"><span className="font-semibold">Live Operations</span><span className="flex items-center gap-1.5 font-medium text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active</span></div>
            <div className="mb-2 flex justify-between text-xs text-white"><span>Amsterdam Region</span><span className="font-semibold">76%</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full w-3/4 rounded-full bg-primary" /></div>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-[10px] text-slate-400"><MdLockOutline /> Secure, encrypted connection · Trusted by 200+ businesses</div>
      </aside>
      <section className="flex w-full flex-col items-center justify-center px-6 py-10 lg:w-1/2 lg:px-12">{children}</section>
    </main>
  );
}
