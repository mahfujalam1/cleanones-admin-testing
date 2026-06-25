import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] bg-[#1a2332] text-white p-12 relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -bottom-[20%] -left-[20%] w-[140%] h-[140%] rounded-full bg-white/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-[#0ea5e9] rounded flex items-center justify-center font-bold text-lg">
              CO
            </div>
            <span className="text-xl font-semibold">CleanOnes</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-6">
            Cleaning workforce<br />
            management on <span className="text-[#0ea5e9]">one<br />platform</span>
          </h1>
          
          <p className="text-gray-400 mb-12 max-w-sm">
            Manage your cleaning teams, shifts, and locations from one powerful dashboard.
          </p>

          <ul className="space-y-4">
            {[
              "Real-time shift monitoring",
              "AI-powered photo review",
              "GPS location validation",
              "Automated performance reports"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                <FaCheckCircle className="text-[#0ea5e9]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm mt-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#0ea5e9] flex items-center justify-center text-xs font-bold">
              KP
            </div>
            <div>
              <div className="text-sm font-medium">Kaz Putters</div>
              <div className="text-xs text-gray-400">Operations Manager - Amsterdam</div>
            </div>
          </div>
          <p className="text-xs text-gray-300 italic">
            &quot;CleanOnes gives me complete visibility over all our teams and locations.&quot;
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f8fafc] p-6">
        {children}
        <p className="text-xs text-gray-400 mt-8 text-center">
          © 2026 CleanOnes BV - Keizersgracht 123, Amsterdam
        </p>
      </div>
    </div>
  );
}
