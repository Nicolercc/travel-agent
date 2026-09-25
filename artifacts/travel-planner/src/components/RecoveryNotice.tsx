import { X } from "lucide-react";

interface RecoveryNoticeProps {
  messages: string[];
  /** Persistent condition (e.g. storage unavailable) — shown without a dismiss button. */
  persistentMessage: string | null;
  onDismiss: () => void;
}

/** Tells the traveler when their saved data changed without their action. */
export function RecoveryNotice({ messages, persistentMessage, onDismiss }: RecoveryNoticeProps) {
  return (
    <div role="status" className="empty:hidden space-y-2">
      {persistentMessage && (
        <p className="sc-attention-panel">{persistentMessage}</p>
      )}
      {messages.length > 0 && (
        <div className="sc-attention-panel flex items-start justify-between gap-3">
          <ul className="space-y-1">
            {messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notice"
            className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-md focus-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
