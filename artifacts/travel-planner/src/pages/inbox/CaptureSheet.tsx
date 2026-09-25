import { useId, useRef, useState, type FormEvent } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_LABEL } from "@/components/ui/Pills";
import { buildCapturedPlace } from "@/lib/domain/capture";
import { formatDateOnly } from "@/lib/domain/dates";
import type { Day, ItemCategory, Place } from "@/lib/domain/types";

interface CaptureSheetProps {
  open: boolean;
  days: Day[];
  onSave: (place: Place, dayId: string | null) => void;
  onClose: () => void;
  onCloseAutoFocus: (event: Event) => void;
}

/** "Save a place" (RFC §11): capture only. A link is required; everything else is optional and never guessed. */
export function CaptureSheet({ open, days, onSave, onClose, onCloseAutoFocus }: CaptureSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md" onCloseAutoFocus={onCloseAutoFocus}>
        {open && <CaptureForm days={days} onSave={onSave} />}
      </SheetContent>
    </Sheet>
  );
}

const nativeSelect = "flex min-h-[44px] w-full rounded-md border border-input bg-background px-3 text-sm focus-ring";
const categories = Object.entries(CATEGORY_LABEL) as [ItemCategory, string][];

function newPlaceId(): string {
  return `place-user-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}

function CaptureForm({ days, onSave }: Pick<CaptureSheetProps, "days" | "onSave">) {
  const id = useId();
  const [link, setLink] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [category, setCategory] = useState<ItemCategory>("other");
  const [notes, setNotes] = useState("");
  const [dayId, setDayId] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const linkRef = useRef<HTMLInputElement>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = buildCapturedPlace({ link, name, city, area, category, notes }, newPlaceId());
    if (!result.ok) {
      setLinkError(result.errors.link);
      linkRef.current?.focus();
      return;
    }
    onSave(result.place, dayId || null);
  };

  const label = (field: string, text: string, optional = true) => (
    <label htmlFor={`${id}-${field}`} className="text-sm font-medium text-foreground">
      {text}
      {optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <SheetHeader className="pr-10 text-left">
        <SheetTitle className="font-serif text-xl">Save a place</SheetTitle>
        <SheetDescription>Paste the link now; sort it into a day later.</SheetDescription>
      </SheetHeader>

      <div className="space-y-2">
        {label("link", "Link", false)}
        <Input
          ref={linkRef}
          id={`${id}-link`}
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="https://"
          value={link}
          onChange={(event) => setLink(event.target.value)}
          aria-invalid={linkError ? true : undefined}
          aria-describedby={linkError ? `${id}-link-error` : undefined}
          className="min-h-[44px]"
        />
        {linkError && (
          <p id={`${id}-link-error`} className="text-sm text-sc-status-critical">
            {linkError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        {label("name", "Name")}
        <Input id={`${id}-name`} value={name} onChange={(event) => setName(event.target.value)} className="min-h-[44px]" />
        <p className="text-xs text-muted-foreground">Left empty, it's called "Saved from" the site.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {label("city", "City")}
          <Input id={`${id}-city`} value={city} onChange={(event) => setCity(event.target.value)} className="min-h-[44px]" />
        </div>
        <div className="space-y-2">
          {label("area", "Area")}
          <Input id={`${id}-area`} value={area} onChange={(event) => setArea(event.target.value)} className="min-h-[44px]" />
        </div>
      </div>

      <div className="space-y-2">
        {label("category", "Category")}
        <select id={`${id}-category`} value={category} onChange={(event) => setCategory(event.target.value as ItemCategory)} className={nativeSelect}>
          {categories.map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {label("notes", "Notes")}
        <Textarea id={`${id}-notes`} value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-[80px]" />
      </div>

      <div className="space-y-2">
        {label("day", "Day")}
        <select id={`${id}-day`} value={dayId} onChange={(event) => setDayId(event.target.value)} className={nativeSelect}>
          <option value="">Keep in Inbox</option>
          {days.map((day) => (
            <option key={day.id} value={day.id}>
              {formatDateOnly(day.date, "EEE MMM d")} · {day.title}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" className="min-h-[44px]">
        Save
      </Button>
    </form>
  );
}
