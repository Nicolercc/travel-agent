import { Component, createRef, type ErrorInfo, type ReactNode } from "react";
import { STATE_KEY, removeLegacyKeys } from "@/lib/persistence/load";
import { browserStorage } from "@/lib/persistence/storage";

interface Props {
  children: ReactNode;
  /** "app" wraps everything; "page" keeps navigation usable around a failing route. */
  scope: "app" | "page";
}

interface State {
  error: Error | null;
}

/** Clears stored demo data without relying on React state (which may be what failed). */
export function resetStoredDemoData(): void {
  const storage = browserStorage();
  storage.remove(STATE_KEY);
  removeLegacyKeys(storage);
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  private heading = createRef<HTMLHeadingElement>();

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[tripcanvas] render error", error, info.componentStack);
  }

  // A crash during the first render commits the fallback as a mount, later crashes as an update.
  componentDidMount() {
    if (this.state.error) this.heading.current?.focus();
  }

  componentDidUpdate(_: Props, previous: State) {
    if (!previous.error && this.state.error) this.heading.current?.focus();
  }

  render() {
    if (!this.state.error) return this.props.children;
    const body = (
      <div className="mx-auto max-w-md px-4 py-16 space-y-4 text-center">
        <h1 ref={this.heading} tabIndex={-1} className="text-2xl font-serif font-bold text-foreground focus:outline-none">
          Something went wrong on this page.
        </h1>
        <p className="text-sm text-muted-foreground">
          Reloading usually fixes it. If it keeps happening, resetting the demo restores the original trip.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="min-h-[44px] rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground focus-ring"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={() => {
              resetStoredDemoData();
              window.location.reload();
            }}
            className="min-h-[44px] rounded-md border border-border px-4 text-sm font-medium text-foreground focus-ring"
          >
            Reset demo data
          </button>
        </div>
      </div>
    );
    return this.props.scope === "app" ? <main className="min-h-[100dvh] bg-background">{body}</main> : <div role="alert">{body}</div>;
  }
}
