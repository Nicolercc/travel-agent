import type { TripSeed } from "@/lib/domain/types";
import { bookings } from "./bookings";
import { days } from "./days";
import { fixedEvents } from "./fixed-events";
import { legs } from "./legs";
import { locations } from "./locations";
import { packing } from "./packing";
import { places } from "./places";
import { tasks } from "./tasks";
import { trip } from "./trip";

export const seed: TripSeed = { trip, days, locations, legs, fixedEvents, bookings, tasks, places, packing };
