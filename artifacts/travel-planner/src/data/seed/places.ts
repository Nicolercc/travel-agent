import type { Assignment, Place, Placement } from "@/lib/domain/types";

type SeedPlace = Omit<Place, "origin" | "assignment" | "sourceUrl" | "durationMinutes" | "energyCost" | "window" | "bookingId"> &
  Partial<Pick<Place, "sourceUrl" | "durationMinutes" | "energyCost" | "window" | "bookingId">> & {
    on?: [dayId: string, placement: Placement, extra?: Partial<Pick<Assignment, "backupFor" | "reason">>];
  };

function place({ on, ...fields }: SeedPlace): Place {
  return {
    sourceUrl: null,
    durationMinutes: null,
    energyCost: null,
    window: null,
    bookingId: null,
    ...fields,
    origin: "seed",
    assignment: on
      ? { dayId: on[0], placement: on[1], backupFor: on[2]?.backupFor ?? null, reason: on[2]?.reason ?? null }
      : null,
  };
}

/**
 * Seed activities. Each activity exists exactly once (INV-8). Merged from the journey dataset's
 * flexible events and the earlier saved places; where they disagreed, the journey facts won.
 */
export const places: Place[] = [
  // Jul 29 · arrival
  place({ id: "place-layover", name: "Barcelona layover: lounge, short visit, or stay airside", city: "Barcelona", area: "El Prat Airport", category: "other", priority: "medium", notes: "Decide on the day by energy: recover in the lounge, a short city visit, or stay airside. The window is the free time between the two flights.", energyCost: "medium", window: { start: "09:30", end: "14:20" }, on: ["day-1", "optional"] }),
  place({ id: "place-cova", name: "Cova d'en Xoroi", city: "Cala en Porter", area: "Cala en Porter", category: "nightlife", priority: "high", notes: "Sunset cave club. A strong maybe for tonight if energy allows; Jul 30 is the backup slot. Not yet booked.", energyCost: "high", bookingId: "book-cova-xoroi", on: ["day-1", "optional"] }),

  // Jul 30 · coves
  place({ id: "place-menorca-cala", name: "Cala Macarella & Macarelleta", city: "Ciutadella", area: "South Coast", category: "beach", priority: "must", notes: "The most beautiful cove on the island. Go before 11 AM.", durationMinutes: 120, energyCost: "medium", on: ["day-2", "anchor"] }),
  place({ id: "place-cala-mitjana", name: "Cala Mitjana", city: "Ciutadella", area: "South Coast", category: "beach", priority: "must", notes: "One of the two coves for today.", durationMinutes: 120, energyCost: "medium", on: ["day-2", "planned"] }),
  place({ id: "place-ciutadella-evening", name: "Ciutadella evening", city: "Ciutadella", area: "Old Town", category: "experience", priority: "must", notes: "Old town, harbour, and dinner after dark.", energyCost: "medium", window: { start: "16:30", end: "21:00" }, on: ["day-2", "planned"] }),
  place({ id: "place-cala-turqueta", name: "Cala Turqueta", city: "Ciutadella", area: "South Coast", category: "beach", priority: "medium", notes: "Only if energy is high; skip if tired.", durationMinutes: 90, energyCost: "high", on: ["day-2", "optional"] }),
  place({ id: "place-lithica", name: "Líthica — Pedreres de s'Hostal", city: "Ciutadella", area: "Ciutadella outskirts", category: "experience", priority: "medium", notes: "Check ticket availability and summer hours first.", durationMinutes: 75, energyCost: "medium", on: ["day-2", "optional"] }),
  place({ id: "place-boat-day", name: "Boat day instead of the coves", city: "Cala en Porter", area: "Cala en Porter", category: "experience", priority: "low", notes: "Explicitly optional; depends on cost and weather.", energyCost: "high", on: ["day-2", "backup", { backupFor: "place-menorca-cala" }] }),

  // Jul 31 · Binibeca
  place({ id: "place-binibeca", name: "Binibeca Vell", city: "Sant Lluís", area: "Binibeca", category: "experience", priority: "must", notes: "Whitewashed fishing village. Arrive before the busiest period.", durationMinutes: 90, energyCost: "low", window: { start: "09:00", end: "10:30" }, on: ["day-3", "anchor"] }),
  place({ id: "place-pack-menorca", name: "Pack for the Menorca departure", city: "Cala en Porter", area: "Cala en Porter", category: "other", priority: "must", notes: "Early start tomorrow: the car goes back around 6:00 AM.", durationMinutes: 60, energyCost: "low", on: ["day-3", "planned"] }),
  place({ id: "place-cales-coves", name: "Cales Coves, or a nearby final swim", city: "Alaior", area: "Cales Coves", category: "beach", priority: "high", notes: "A last swim close to base.", durationMinutes: 90, energyCost: "medium", on: ["day-3", "optional"] }),
  place({ id: "place-naveta", name: "Naveta des Tudons", city: "Ciutadella", area: "Naveta des Tudons", category: "experience", priority: "low", notes: "Prehistoric tomb on the Ciutadella road. Skip if tired.", durationMinutes: 45, energyCost: "low", on: ["day-3", "optional"] }),
  place({ id: "place-terrace-dinner", name: "Terrace vermouth or a quiet dinner", city: "Cala en Porter", area: "Cala en Porter", category: "food", priority: "medium", notes: "Keep the last Menorca evening easy.", energyCost: "low", on: ["day-3", "optional"] }),

  // Aug 1 · Costa Brava road trip
  place({ id: "place-marimurtra", name: "Marimurtra Botanical Garden", city: "Blanes", area: "Blanes", category: "experience", priority: "must", notes: "Cliffside garden with sweeping Mediterranean views.", durationMinutes: 105, energyCost: "medium", window: { start: "11:00", end: null }, on: ["day-4", "planned"] }),
  place({ id: "place-begur", name: "Begur old town and lunch", city: "Begur", area: "Old Town", category: "food", priority: "must", notes: "Walk the medieval center and take a long terrace lunch.", durationMinutes: 150, energyCost: "medium", window: { start: "13:30", end: null }, on: ["day-4", "planned"] }),
  place({ id: "place-tossa", name: "Tossa evening: Vila Vella, dinner, gelato", city: "Tossa de Mar", area: "Vila Vella", category: "experience", priority: "must", notes: "Walled medieval village; golden-hour light on the castle.", energyCost: "medium", window: { start: "20:00", end: null }, on: ["day-4", "anchor"] }),
  place({ id: "place-satuna", name: "Sa Tuna or Aiguablava", city: "Begur", area: "Sa Tuna", category: "beach", priority: "high", notes: "Sa Tuna is smaller and calmer; Aiguablava has more space.", durationMinutes: 90, energyCost: "medium", window: { start: "16:30", end: null }, on: ["day-4", "optional"] }),

  // Aug 2 · Tossa → La Roca → Barcelona
  place({ id: "place-larocca", name: "La Roca Village", city: "La Roca del Vallès", area: "La Roca Village", category: "shop", priority: "must", notes: "The must-do: outlet shopping. Plan 2–4 hours; arrive 3–5 PM.", durationMinutes: 180, energyCost: "medium", window: { start: "15:00", end: null }, on: ["day-5", "anchor"] }),
  place({ id: "place-tossa-morning", name: "Tossa morning: coffee, Vila Vella, optional swim", city: "Tossa de Mar", area: "Vila Vella", category: "experience", priority: "medium", notes: "Slow start before checkout.", energyCost: "low", on: ["day-5", "optional"] }),
  place({ id: "place-cami-ronda", name: "Camí de Ronda at S'Agaró", city: "S'Agaró", area: "Camí de Ronda", category: "experience", priority: "medium", notes: "Coastal path. Skip it if La Roca shopping matters.", durationMinutes: 90, energyCost: "high", on: ["day-5", "optional"] }),
  place({ id: "place-hotel-spa", name: "Hotel spa or pool reset", city: "Barcelona", area: "Montjuïc", category: "other", priority: "medium", notes: "A calm first Barcelona evening.", energyCost: "low", on: ["day-5", "optional"] }),
  place({ id: "place-montjuic-sunset", name: "Montjuïc sunset", city: "Barcelona", area: "Montjuïc", category: "viewpoint", priority: "medium", notes: "Close to the hotel.", energyCost: "medium", on: ["day-5", "optional"] }),
  place({ id: "place-poble-sec-tapas", name: "Poble-sec tapas", city: "Barcelona", area: "Poble-sec", category: "food", priority: "low", notes: "Skip if tired.", energyCost: "medium", on: ["day-5", "optional"] }),

  // Aug 3 · Montserrat
  place({ id: "place-montserrat", name: "Montserrat: the Basilica and the Black Madonna", city: "Montserrat", area: "Montserrat", category: "experience", priority: "must", notes: "Take the rack railway up. Morning light is best.", energyCost: "medium", on: ["day-6", "anchor"] }),
  place({ id: "place-montserrat-viewpoint", name: "One proper Montserrat viewpoint", city: "Montserrat", area: "Montserrat", category: "viewpoint", priority: "must", notes: "One good viewpoint is enough.", energyCost: "medium", on: ["day-6", "planned"] }),
  place({ id: "place-sant-joan", name: "Sant Joan funicular", city: "Montserrat", area: "Montserrat", category: "experience", priority: "medium", notes: "Check that it is running.", energyCost: "medium", on: ["day-6", "optional"] }),
  place({ id: "place-montserrat-nature", name: "Full nature day on the mountain", city: "Montserrat", area: "Montserrat", category: "experience", priority: "low", notes: "Only with a confirmed last descent. Skip if tired.", energyCost: "high", on: ["day-6", "optional"] }),

  // Aug 4 · Barcelona
  place({ id: "place-vintage-bakery", name: "Bakery and curated vintage shops", city: "Barcelona", area: "El Born", category: "shop", priority: "high", notes: "Replaces Mercat dels Encants (closed Tuesdays): a bakery and 2–3 vintage shops. Best in the morning.", durationMinutes: 150, energyCost: "medium", on: ["day-7", "planned"] }),
  place({ id: "place-sagrada", name: "Sagrada Família", city: "Barcelona", area: "Eixample", category: "experience", priority: "must", notes: "Timed entry around 2:00 PM. Not yet booked; it sells out.", energyCost: "high", window: { start: "14:00", end: null }, bookingId: "book-sagrada", on: ["day-7", "anchor"] }),
  place({ id: "place-passeig", name: "Passeig de Gràcia architecture walk", city: "Barcelona", area: "Eixample", category: "experience", priority: "must", notes: "Casa Batlló and La Pedrera façades.", energyCost: "medium", on: ["day-7", "planned"] }),
  place({ id: "place-elborn-dinner", name: "El Born evening wander and dinner", city: "Barcelona", area: "El Born", category: "food", priority: "high", notes: "Wander and find something that looks right.", energyCost: "medium", on: ["day-7", "optional"] }),
  place({ id: "place-paradiso", name: "Paradiso", city: "Barcelona", area: "El Born", category: "bar", priority: "must", notes: "Hidden behind a pastrami shop. Go if energy allows.", energyCost: "medium", on: ["day-7", "optional"] }),
  place({ id: "place-bunkers", name: "Bunkers del Carmel", city: "Barcelona", area: "El Carmel", category: "viewpoint", priority: "low", notes: "Sunset viewpoint at the top of a steep climb.", energyCost: "high", on: ["day-7", "do-not-cram", { reason: "It's a hike. After Sagrada Família you may not have the legs." }] }),

  // Unsorted saves (Inbox)
  place({ id: "place-parking-sotano", name: "Parking Sótano", city: "Barcelona", area: "El Born", category: "bar", priority: "high", notes: "Natural wine bar. Small, busy, excellent. Go early or wait for a spot." }),
  place({ id: "place-syra", name: "Syra Coffee", city: "Barcelona", area: "Gràcia", category: "cafe", priority: "medium", notes: "Excellent specialty coffee. Good spot to recharge mid-morning." }),
  place({ id: "place-bar-canete", name: "Bar Cañete", city: "Barcelona", area: "El Raval", category: "food", priority: "high", notes: "Sit at the bar. Get the bombita and the eggplant." }),
  place({ id: "place-la-pepita", name: "La Pepita", city: "Barcelona", area: "Gràcia", category: "food", priority: "high", notes: "Modern tapas, always busy. Book ahead." }),
  place({ id: "place-bormuth", name: "Bormuth", city: "Barcelona", area: "El Born", category: "food", priority: "medium", notes: "Good vermouth and patatas bravas. A reliable backup." }),
  place({ id: "place-nomad-coffee", name: "Nomad Coffee Lab", city: "Barcelona", area: "El Born", category: "cafe", priority: "medium", notes: "Great flat white. A relaxed place to start the morning." }),
  place({ id: "place-xurreria", name: "Xurreria Trebol", city: "Barcelona", area: "Gràcia", category: "food", priority: "high", notes: "Classic churros, open late." }),
];
