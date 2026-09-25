import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import NotFound from "@/pages/not-found";
import { MainLayout } from "@/app/layout/MainLayout";
import { TripProvider } from "@/lib/state/TripProvider";
import { seed } from "@/data/seed";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import { AnnouncerProvider } from "@/lib/a11y/announcer";
import { RouteFocus } from "@/lib/a11y/route-focus";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Inbox from "@/pages/Inbox";
import DayBuilder from "@/pages/DayBuilder";
import TripMode from "@/pages/TripMode";
import Itinerary from "@/pages/Itinerary";
import Logistics from "@/pages/Logistics";
import Packing from "@/pages/Packing";

/** The route table (exported for integration tests). */
export function AppRoutes() {
  return (
    <>
      <RouteFocus />
      <Switch>
      <Route path="/" component={Landing} />
      <Route path="/trips">
        <Redirect to="/dashboard" replace />
      </Route>
      <Route path="/dashboard">
        <MainLayout><Dashboard /></MainLayout>
      </Route>
      <Route path="/inbox">
        <MainLayout><Inbox /></MainLayout>
      </Route>
      <Route path="/day/:dayId">
        <MainLayout><DayBuilder /></MainLayout>
      </Route>
      <Route path="/trip-mode/:dayId">
        <TripMode />
      </Route>
      <Route path="/itinerary/:dayId?">
        <MainLayout><Itinerary /></MainLayout>
      </Route>
      <Route path="/logistics">
        <MainLayout><Logistics /></MainLayout>
      </Route>
      <Route path="/packing">
        <MainLayout><Packing /></MainLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary scope="app">
      <TripProvider seed={seed}>
        <AnnouncerProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </WouterRouter>
        </AnnouncerProvider>
      </TripProvider>
    </ErrorBoundary>
  );
}

export default App;
