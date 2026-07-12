import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { MainLayout } from "@/components/layout/MainLayout";
import { TripProvider } from "@/context/TripContext";

import Landing from "@/pages/Landing";
import TripLibrary from "@/pages/TripLibrary";
import Dashboard from "@/pages/Dashboard";
import Inbox from "@/pages/Inbox";
import DayBuilder from "@/pages/DayBuilder";
import TripMode from "@/pages/TripMode";
import Itinerary from "@/pages/Itinerary";
import Logistics from "@/pages/Logistics";
import Packing from "@/pages/Packing";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/trips" component={TripLibrary} />
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
      <Route path="/itinerary">
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TripProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </TripProvider>
    </QueryClientProvider>
  );
}

export default App;
