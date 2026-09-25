import { ReactNode } from "react";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import { RecoveryNotice } from "@/components/RecoveryNotice";
import { SkipLink } from "@/components/SkipLink";
import { persistenceMessage, recoveryMessage } from "@/lib/state/recovery-messages";
import { useTrip } from "@/lib/state/TripProvider";
import { Navigation } from "./Navigation";

export function MainLayout({ children }: { children: ReactNode }) {
  const { recoveries, dismissRecoveries, persistence } = useTrip();
  const messages = recoveries.map(recoveryMessage).filter((message): message is string => message !== null);
  return (
    <div className="flex flex-col lg:flex-row min-h-[100dvh] bg-background">
      <SkipLink />
      <Navigation />
      <main
        id="main"
        tabIndex={-1}
        className="flex-1 w-full max-w-6xl xl:max-w-7xl mx-auto p-4 md:p-8 lg:p-10 xl:px-12 trip-pulse-enter min-w-0 overflow-x-hidden space-y-4 focus:outline-none"
      >
        <RecoveryNotice messages={messages} persistentMessage={persistenceMessage(persistence)} onDismiss={dismissRecoveries} />
        <ErrorBoundary scope="page">{children}</ErrorBoundary>
      </main>
    </div>
  );
}
