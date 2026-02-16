"use client";

import Image from "next/image";
import { UserPlus, Scale, TrendingUp } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 py-6 md:py-10">
        <div className="flex flex-col justify-center items-center h-fit md:justify-start">
          <Image src="/logo.png" alt="Logo" width={48} height={48} />
          <a href="#" className="flex items-center gap-2 font-medium">
            My Daily Health Journal
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
      <div className="hidden lg:flex w-full bg-blue-600 relative overflow-hidden flex-col justify-center items-center px-10 h-full">
        {/* Ambient Background */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[30rem] h-[30rem] rounded-full bg-blue-400 blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[30rem] h-[30rem] rounded-full bg-blue-800 blur-3xl opacity-40"></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>

        <div className="relative z-10 w-full max-w-2xl flex flex-col h-full justify-center">
          <div className="text-center mb-10 mt-8">
            <h2 className="text-3xl font-semibold text-white tracking-tight mb-2">
              How it works
            </h2>
            <p className="text-blue-100 font-normal max-w-lg mx-auto">
              Track your health metrics in three simple steps.
            </p>
          </div>

          {/* Middle Line Section */}
          <div className="flex flex-col gap-20 relative z-10 py-5">
            {/* Dotted Vertical Line */}
            <div className="absolute left-1/2 w-px -ml-[0.5px] z-0 top-0 bottom-0">
              <svg className="h-full w-full" preserveAspectRatio="none">
                <line
                  x1="50%"
                  y1="0"
                  x2="50%"
                  y2="100%"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                />
              </svg>
            </div>

            {/* Step 1: Create Account */}
            <div className="flex items-center gap-16 group w-full relative">
              {/* Step Number Badge */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-blue-500 border-2 border-blue-300 text-white font-bold text-sm flex items-center justify-center shadow-lg shadow-blue-900/40">
                1
              </div>

              {/* Visual Card */}
              <div className="w-1/2 flex justify-end">
                <div className="relative w-48 h-32 bg-white rounded-2xl shadow-xl shadow-blue-900/20 p-5 transform transition-transform group-hover:-translate-y-1 duration-300 border border-white/20">
                  {/* Skeleton Lines */}
                  <div className="space-y-3">
                    <div className="h-2.5 w-20 bg-slate-100 rounded-full"></div>
                    <div className="h-2.5 w-28 bg-slate-100 rounded-full"></div>
                    <div className="h-2.5 w-16 bg-slate-100 rounded-full"></div>
                  </div>

                  {/* Floating Badge */}
                  <div className="absolute -bottom-5 -left-5 h-12 w-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg ring-4 ring-blue-600">
                    <UserPlus className="w-6 h-6 stroke-[1.5]" />
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="w-1/2 text-left pt-2">
                <h3 className="text-white font-semibold text-xl mb-2">
                  Create Free Account
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed max-w-[200px]">
                  Sign up in seconds securely. No credit card required to start.
                </p>
              </div>
            </div>

            {/* Step 2: Enter Metrics */}
            <div className="flex flex-row-reverse items-center gap-16 group w-full relative">
              {/* Step Number Badge */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-blue-500 border-2 border-blue-300 text-white font-bold text-sm flex items-center justify-center shadow-lg shadow-blue-900/40">
                2
              </div>

              {/* Visual Card */}
              <div className="w-1/2 flex justify-start">
                <div className="relative w-48 h-36 bg-slate-900 rounded-2xl shadow-xl shadow-blue-900/40 p-4 transform transition-transform group-hover:-translate-y-1 duration-300 flex flex-col border border-slate-700/50">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-slate-800 flex items-center justify-center text-blue-400">
                        <Scale className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-medium text-slate-300">
                        Weight
                      </span>
                    </div>
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>

                  {/* Input Body */}
                  <div className="flex-1 flex flex-col justify-center">
                    {/* Number Display with cursor */}
                    <div className="flex items-baseline justify-center gap-0.5 mb-2">
                      <span className="text-2xl font-bold text-white tracking-tight">
                        165
                      </span>
                      <div className="h-5 w-0.5 bg-blue-500 animate-pulse"></div>
                      <span className="text-xs text-slate-500 font-medium ml-1">
                        lbs
                      </span>
                    </div>

                    {/* Fake Slider */}
                    <div className="w-full px-2">
                      <div className="h-1 bg-slate-800 rounded-full relative">
                        <div className="absolute left-0 top-0 h-full w-1/2 bg-blue-500 rounded-full"></div>
                        <div className="absolute left-1/2 top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full shadow-lg border border-blue-100"></div>
                      </div>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="mt-2">
                    <button className="w-full py-1.5 bg-blue-600 rounded-lg text-[10px] font-semibold text-white shadow-sm shadow-blue-900/20">
                      Save Entry
                    </button>
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="w-1/2 text-right pt-2">
                <h3 className="text-white font-semibold text-xl mb-2">
                  Enter Metrics
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed ml-auto max-w-[200px]">
                  Log weight, blood pressure, or sugar levels easily daily.
                </p>
              </div>
            </div>

            {/* Step 3: See Trends */}
            <div className="flex items-center gap-16 group w-full relative">
              {/* Step Number Badge */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-blue-500 border-2 border-blue-300 text-white font-bold text-sm flex items-center justify-center shadow-lg shadow-blue-900/40">
                3
              </div>

              {/* Visual Card */}
              <div className="w-1/2 flex justify-end">
                <div className="relative w-48 h-36 flex items-end justify-center gap-3 px-2">
                  {/* Bar Chart Bars */}
                  <div className="w-5 bg-blue-300/40 rounded-t-md h-28 backdrop-blur-sm"></div>
                  <div className="w-5 bg-blue-300/60 rounded-t-md h-20 backdrop-blur-sm"></div>
                  <div className="w-5 bg-white rounded-t-md h-16 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                  <div className="w-5 bg-blue-300/40 rounded-t-md h-14 backdrop-blur-sm"></div>

                  {/* Floating Tooltip */}
                  <div className="absolute top-10 right-6 bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl transform translate-x-1 translate-y-1 animate-pulse whitespace-nowrap">
                    <p className="text-green-500">-2 lbs</p>
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="w-1/2 text-left pt-2">
                <h3 className="text-white font-semibold text-xl mb-2">
                  See Trends
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed max-w-[200px]">
                  Visualize your health journey with beautiful interactive
                  charts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
