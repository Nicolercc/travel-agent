import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { seed } from "@/data/seed";
import { memoryStorage, type StorageAdapter } from "@/lib/persistence/storage";
import { TripProvider } from "@/lib/state/TripProvider";
import { AnnouncerProvider } from "@/lib/a11y/announcer";

/** Render UI inside the real providers at a given URL, with in-memory routing and storage. */
export function renderAt(path: string, ui: ReactElement, storage: StorageAdapter = memoryStorage()) {
  const location = memoryLocation({ path, record: true });
  const result = render(
    <TripProvider seed={seed} storage={storage}>
      <AnnouncerProvider>
        <Router hook={location.hook}>{ui}</Router>
      </AnnouncerProvider>
    </TripProvider>,
  );
  return { ...result, location, storage };
}
