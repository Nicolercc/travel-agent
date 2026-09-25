import { Link } from "wouter";
import { ArrowRight, CalendarCheck, Compass, Inbox, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkipLink } from "@/components/SkipLink";

const STEPS = [
  { title: "Save", body: "Paste a link to anything you want to do. It lands in your Inbox.", Icon: Inbox },
  { title: "Place", body: "Give each save a day: an anchor, the core plan, optional extras, backups.", Icon: Map },
  { title: "Check", body: "Every day gets an honest verdict — Comfortable, Full, Tight, or Overloaded — with the reasons and the one change that helps most.", Icon: CalendarCheck },
  { title: "Go", body: "Trip Mode shows what's next, your confirmations, and backups when plans change.", Icon: Compass },
];

export default function Landing() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground overflow-x-hidden">
      <SkipLink />
      <header className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border/50">
        <p className="flex items-center gap-2 text-primary font-serif text-xl font-bold tracking-tight">
          <Map className="w-5 h-5" /> TripCanvas
        </p>
        <Button asChild size="sm" data-testid="cta-open-demo">
          <Link href="/dashboard">Open the demo</Link>
        </Button>
      </header>

      <main id="main" tabIndex={-1} className="focus:outline-none">
        <section className="max-w-4xl mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-foreground leading-tight tracking-tight mb-6 text-balance">
            Turn the places you've saved into days you can actually live.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            TripCanvas tells you plainly, with reasons, when a day won't work — and what to change.
          </p>
          <Button asChild size="lg" className="px-8 text-base gap-2 min-h-[48px]" data-testid="hero-cta-primary">
            <Link href="/dashboard">
              Open the Spain 2026 demo <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            The demo is set three days before departure, so there is real planning left to do.
          </p>
        </section>

        <section aria-labelledby="how-heading" className="border-t border-border/50 bg-secondary/20 py-20 px-6 md:px-12">
          <h2 id="how-heading" className="max-w-4xl mx-auto font-serif text-3xl md:text-4xl text-foreground mb-10 text-center">
            How it works
          </h2>
          <ol className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 list-none p-0">
            {STEPS.map(({ title, body, Icon }, index) => (
              <li key={title} className="bg-card border border-border rounded-xl p-6 text-left">
                <p className="flex items-center gap-2 mb-4 text-xs font-bold text-muted-foreground">
                  <span>Step {index + 1}</span>
                  <Icon className="w-4 h-4 text-primary" />
                </p>
                <h3 className="font-serif text-lg font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-border/50 py-6 px-6 text-center text-xs text-muted-foreground">
        No account and no backend: your changes stay in this browser.
      </footer>
    </div>
  );
}
