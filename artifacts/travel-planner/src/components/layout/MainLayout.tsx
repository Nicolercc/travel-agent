import { ReactNode } from "react";
import { Navigation } from "./Navigation";

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] bg-background">
      <Navigation />
      <main className="flex-1 w-full max-w-6xl xl:max-w-7xl mx-auto p-4 md:p-8 lg:p-10 xl:px-12 trip-pulse-enter min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
