import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] w-full flex items-center justify-center bg-background px-4">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-serif font-bold text-foreground">This page doesn't exist.</h1>
        <p className="text-muted-foreground">The link may be out of date. Your trip is still here.</p>
        <Button asChild className="min-h-[44px]">
          <Link href="/dashboard">Go to Trip Pulse</Link>
        </Button>
      </div>
    </main>
  );
}
