import type { JourneyDataset } from "../dataset";

/**
 * Minimal synthetic dataset for Phase 2A unit tests only.
 * Spain 2026 content migration is Phase 2B.
 */
export function createMinimalJourneyDataset(): JourneyDataset {
  return {
    locations: [
      {
        id: "loc-jfk",
        name: "JFK",
        kind: "airport",
        city: "New York",
        region: "Transit",
        coordinates: { lat: 40.6413, lng: -73.7781 },
      },
      {
        id: "loc-bcn-airport",
        name: "Barcelona El Prat",
        kind: "airport",
        city: "Barcelona",
        region: "Barcelona",
        coordinates: { lat: 41.2974, lng: 2.0833 },
      },
      {
        id: "loc-cove",
        name: "Sample Cove",
        kind: "beach",
        city: "Menorca",
        region: "Menorca",
        coordinates: { lat: 39.95, lng: 4.1 },
      },
      {
        id: "loc-hotel-menorca",
        name: "Sample Menorca Hotel",
        kind: "hotel",
        city: "Menorca",
        region: "Menorca",
        coordinates: { lat: 39.96, lng: 4.08 },
      },
    ],
    bookingReferences: [
      {
        id: "book-dl128",
        provider: "Delta",
        confirmationNumber: "DL128CONF",
        status: "confirmed",
      },
      {
        id: "book-hotel-menorca",
        provider: "Sample Hotel",
        confirmationNumber: "HTL123",
        status: "confirmed",
      },
    ],
    travelLegs: [
      {
        id: "leg-dl128",
        dayId: "day-0",
        mode: "flight",
        fromLocationId: "loc-jfk",
        toLocationId: "loc-bcn-airport",
        departure: { time: "6:00 PM", date: "2026-07-28" },
        arrival: { time: "8:00 AM", date: "2026-07-29" },
        bookingRefId: "book-dl128",
        status: "confirmed",
        label: "DL128 · JFK → BCN",
      },
    ],
    events: [
      {
        id: "evt-cove-swim",
        dayId: "day-2",
        locationId: "loc-cove",
        title: "Morning cove swim",
        fixed: false,
        tier: "must-do",
        status: "planned",
        energyCost: "medium",
      },
      {
        id: "evt-checkin",
        dayId: "day-2",
        locationId: "loc-hotel-menorca",
        title: "Hotel check-in",
        fixed: true,
        tier: null,
        status: "confirmed",
        bookingRefId: "book-hotel-menorca",
        energyCost: "low",
      },
    ],
    unresolvedTasks: [
      {
        id: "task-car-conflict",
        dayId: "day-3",
        label: "Resolve car return vs flight timing",
        priority: "critical",
      },
    ],
    days: [
      {
        id: "day-0",
        date: "2026-07-28",
        dayType: "flight",
        title: "JFK Departure",
        emotionalTheme: "Transition into travel mode",
        energyMode: "controlled",
        originLocationId: "loc-jfk",
        destinationLocationId: null,
        overnightBaseLocationId: null,
        fixedEventIds: [],
        flexibleEventIds: [],
        legIds: ["leg-dl128"],
        unresolvedTaskIds: [],
        dayVibe: "Calm departure",
        outfitNote: null,
      },
      {
        id: "day-2",
        date: "2026-07-30",
        dayType: "experience",
        title: "Menorca Coves",
        emotionalTheme: "Water and light",
        energyMode: "medium",
        originLocationId: "loc-hotel-menorca",
        destinationLocationId: null,
        overnightBaseLocationId: "loc-hotel-menorca",
        fixedEventIds: ["evt-checkin"],
        flexibleEventIds: ["evt-cove-swim"],
        legIds: [],
        unresolvedTaskIds: [],
        dayVibe: "Slow coastal morning",
        outfitNote: "Swim gear",
      },
      {
        id: "day-3",
        date: "2026-07-31",
        dayType: "experience",
        title: "Final Menorca day",
        emotionalTheme: "Last swim",
        energyMode: "soft-adaptable",
        originLocationId: "loc-hotel-menorca",
        destinationLocationId: null,
        overnightBaseLocationId: "loc-hotel-menorca",
        fixedEventIds: [],
        flexibleEventIds: [],
        legIds: [],
        unresolvedTaskIds: ["task-car-conflict"],
        dayVibe: "Pack with intention",
        outfitNote: null,
      },
    ],
  };
}

export function createInvalidJourneyDataset(): JourneyDataset {
  const dataset = createMinimalJourneyDataset();
  return {
    ...dataset,
    days: dataset.days.map((day) =>
      day.id === "day-2"
        ? { ...day, flexibleEventIds: [...day.flexibleEventIds, "evt-missing"] }
        : day,
    ),
  };
}
