import { useId } from "react";
import { Copy } from "lucide-react";
import { useAnnounce } from "@/lib/a11y/announcer";

interface CopyButtonProps {
  value: string;
  /** What is being copied, e.g. "DL128 confirmation". */
  label: string;
}

/** Shows a value and copies it. If the clipboard is refused, selects the text so it can be copied by hand. */
export function CopyButton({ value, label }: CopyButtonProps) {
  const id = useId();
  const announce = useAnnounce();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      announce(`Copied ${label}.`);
    } catch {
      const node = document.getElementById(id);
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      announce(`Couldn't copy automatically. ${label} is selected; press Command or Control plus C.`);
    }
  };

  return (
    <span className="inline-flex items-center gap-1 rounded border border-border bg-secondary pl-2 font-mono text-xs text-foreground">
      <span id={id} className="select-all">{value}</span>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className="inline-flex h-11 w-11 items-center justify-center rounded focus-ring"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}
