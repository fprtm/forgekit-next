import React from "react";
import { DemoModeBanner } from "@/shared/components/demo-mode-banner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-screen flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <DemoModeBanner />
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {/* Premium Mesh Background Decoration */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Soft glowing purple radial spot */}
          <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-purple-500/10 blur-[120px] dark:bg-purple-500/5 animate-pulse duration-5000" />
          {/* Soft glowing blue radial spot */}
          <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-500/5 animate-pulse duration-7000" />
        </div>

        {/* Main card viewport */}
        <div className="relative z-10 flex w-full max-w-md items-center justify-center p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
