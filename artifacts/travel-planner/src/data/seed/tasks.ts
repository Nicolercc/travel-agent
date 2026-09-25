import type { Task } from "@/lib/domain/types";

export const tasks: Task[] = [
  { id: "task-delta-checkin", dayId: "day-0", label: "Complete Delta online check-in when it opens", priority: "medium", relatedBookingId: "book-dl128", relatedPlaceId: null, relatedLegId: "leg-dl128", resolvedBy: "manual" },
  { id: "task-cova-reservation", dayId: "day-1", label: "Book the Cova d'en Xoroi sunset session", priority: "high", relatedBookingId: "book-cova-xoroi", relatedPlaceId: "place-cova", relatedLegId: null, resolvedBy: "booking" },
  { id: "task-canudas-lounge", dayId: "day-1", label: "Check Terminal 2 lounge eligibility and guest access", priority: "low", relatedBookingId: null, relatedPlaceId: "place-layover", relatedLegId: null, resolvedBy: "manual" },
  { id: "task-boat-day", dayId: "day-2", label: "Decide on the boat day (cost and weather dependent)", priority: "medium", relatedBookingId: null, relatedPlaceId: "place-boat-day", relatedLegId: null, resolvedBy: "manual" },
  { id: "task-lithica-hours", dayId: "day-2", label: "Confirm Líthica ticket availability and summer hours", priority: "low", relatedBookingId: null, relatedPlaceId: "place-lithica", relatedLegId: null, resolvedBy: "manual" },
  { id: "task-menorca-car-return", dayId: "day-3", label: "Fix the Menorca car return: the voucher says 8:00 AM, after the 7:50 AM flight", priority: "critical", relatedBookingId: "book-menorca-car", relatedPlaceId: null, relatedLegId: "leg-car-return-menorca", resolvedBy: "manual" },
  { id: "task-intercontinental-parking", dayId: "day-5", label: "Confirm the InterContinental parking rate or an alternate garage", priority: "low", relatedBookingId: "book-intercontinental", relatedPlaceId: null, relatedLegId: null, resolvedBy: "manual" },
  { id: "task-drivalia-early-return", dayId: "day-6", label: "Confirm Drivalia accepts a return before 9:00 AM (the voucher says noon)", priority: "high", relatedBookingId: "book-drivalia-car", relatedPlaceId: null, relatedLegId: "leg-drive-car-return", resolvedBy: "manual" },
  { id: "task-fgc-schedule", dayId: "day-6", label: "Check the FGC schedule and the last descent from Montserrat", priority: "medium", relatedBookingId: null, relatedPlaceId: "place-montserrat", relatedLegId: "leg-fgc-montserrat", resolvedBy: "manual" },
  { id: "task-funicular-status", dayId: "day-6", label: "Check the Sant Joan and Santa Cova funicular status", priority: "low", relatedBookingId: null, relatedPlaceId: "place-sant-joan", relatedLegId: null, resolvedBy: "manual" },
  { id: "task-sagrada-booking", dayId: "day-7", label: "Book Sagrada Família timed-entry tickets for around 2:00 PM", priority: "critical", relatedBookingId: "book-sagrada", relatedPlaceId: "place-sagrada", relatedLegId: null, resolvedBy: "booking" },
  { id: "task-vintage-shops", dayId: "day-7", label: "Pick the 2–3 vintage shops (Encants is closed on Tuesdays)", priority: "medium", relatedBookingId: null, relatedPlaceId: "place-vintage-bakery", relatedLegId: null, resolvedBy: "manual" },
  { id: "task-bakery-hours", dayId: "day-7", label: "Confirm the bakery branch and opening hours", priority: "low", relatedBookingId: null, relatedPlaceId: "place-vintage-bakery", relatedLegId: null, resolvedBy: "manual" },
  { id: "task-frontair-shuttle", dayId: "day-8", label: "Reserve the FrontAir shuttle departure time (by the evening of Aug 4)", priority: "high", relatedBookingId: "book-frontair", relatedPlaceId: null, relatedLegId: "leg-frontair-shuttle", resolvedBy: "manual" },
];
