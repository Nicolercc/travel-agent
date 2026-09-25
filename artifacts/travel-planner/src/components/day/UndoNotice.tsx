import { Button } from "@/components/ui/button";

/** An untimed confirmation with Undo — it stays until the next change (WCAG 2.2.1: no time limit). */
export function UndoNotice({ message, onUndo, onDismiss }: { message: string; onUndo: () => void; onDismiss: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-secondary/60 px-4 py-2 text-sm">
      <p className="flex-1 text-foreground">{message}</p>
      <Button variant="outline" size="sm" className="min-h-[44px]" onClick={onUndo}>
        Undo
      </Button>
      <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  );
}
