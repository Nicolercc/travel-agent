import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type Announce = (message: string) => void;

const AnnounceContext = createContext<Announce>(() => {});

/**
 * One app-wide polite live region (RFC §15: every mutation announced exactly once).
 * Each message renders as a fresh node so an identical message is announced again.
 */
export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<{ id: number; text: string } | null>(null);
  const counter = useRef(0);
  const announce = useCallback<Announce>((text) => {
    counter.current += 1;
    setMessage({ id: counter.current, text });
  }, []);
  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only" data-testid="announcer">
        {message && <span key={message.id}>{message.text}</span>}
      </div>
    </AnnounceContext.Provider>
  );
}

export function useAnnounce(): Announce {
  return useContext(AnnounceContext);
}
