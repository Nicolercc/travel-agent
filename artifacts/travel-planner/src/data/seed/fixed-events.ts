import type { FixedEvent } from "@/lib/domain/types";

/**
 * Appointments and reminders that cannot move. Flight departures/arrivals live on legs,
 * and timed activities (Sagrada Família) are places — neither is duplicated here.
 */
export const fixedEvents: FixedEvent[] = [
  { id: "fx-jfk-arrive", dayId: "day-0", kind: "airport", title: "Arrive at JFK", locationId: "loc-jfk", window: { start: "15:45", end: "16:15" }, bookingId: null },
  { id: "fx-dl128-checkin", dayId: "day-0", kind: "airport", title: "Check in for DL128", locationId: "loc-jfk", window: null, bookingId: "book-dl128" },
  { id: "fx-cala-checkin", dayId: "day-1", kind: "check-in", title: "Holiday rental check-in (from 4:00 PM)", locationId: "loc-cala-en-porter", window: { start: "16:00", end: null }, bookingId: "book-cala-en-porter" },
  { id: "fx-menorca-car-pickup", dayId: "day-1", kind: "pickup", title: "Menorca car pickup", locationId: "loc-mah-airport", window: { start: "17:00", end: "17:30" }, bookingId: "book-menorca-car" },
  { id: "fx-wake-day4", dayId: "day-4", kind: "wake", title: "Wake up", locationId: "loc-cala-en-porter", window: { start: "05:00", end: "05:30" }, bookingId: null },
  { id: "fx-menorca-car-return", dayId: "day-4", kind: "return", title: "Menorca car return", locationId: "loc-mah-airport", window: { start: "06:00", end: "06:30" }, bookingId: "book-menorca-car" },
  { id: "fx-drivalia-pickup", dayId: "day-4", kind: "pickup", title: "Drivalia car pickup", locationId: "loc-drivalia-sant-boi", window: { start: "09:00", end: "09:30" }, bookingId: "book-drivalia-car" },
  { id: "fx-road-departure", dayId: "day-4", kind: "departure", title: "Hit the road toward the Costa Brava", locationId: "loc-drivalia-sant-boi", window: { start: "10:00", end: "10:30" }, bookingId: null },
  { id: "fx-reymar-checkin", dayId: "day-4", kind: "check-in", title: "Gran Hotel Reymar check-in (from 2:00 PM)", locationId: "loc-gran-hotel-reymar", window: { start: "14:00", end: null }, bookingId: "book-gran-hotel-reymar" },
  { id: "fx-reymar-checkout", dayId: "day-5", kind: "check-out", title: "Gran Hotel Reymar checkout (by 11:00 AM)", locationId: "loc-gran-hotel-reymar", window: { start: "11:00", end: null }, bookingId: "book-gran-hotel-reymar" },
  { id: "fx-ic-checkin", dayId: "day-5", kind: "check-in", title: "InterContinental check-in (from 3:00 PM)", locationId: "loc-intercontinental-bcn", window: { start: "15:00", end: null }, bookingId: "book-intercontinental" },
  { id: "fx-wake-day6", dayId: "day-6", kind: "wake", title: "Wake up", locationId: "loc-intercontinental-bcn", window: { start: "07:00", end: null }, bookingId: null },
  { id: "fx-leave-hotel-day6", dayId: "day-6", kind: "departure", title: "Leave the hotel for the car return", locationId: "loc-intercontinental-bcn", window: { start: "07:45", end: "08:00" }, bookingId: null },
  { id: "fx-drivalia-return", dayId: "day-6", kind: "return", title: "Drivalia car return", locationId: "loc-drivalia-sant-boi", window: { start: "08:30", end: "09:00" }, bookingId: "book-drivalia-car" },
  { id: "fx-ic-checkout", dayId: "day-7", kind: "check-out", title: "InterContinental checkout (by 12:00 PM)", locationId: "loc-intercontinental-bcn", window: { start: "12:00", end: null }, bookingId: "book-intercontinental" },
  { id: "fx-frontair-checkin", dayId: "day-7", kind: "check-in", title: "FrontAir hotel check-in", locationId: "loc-frontair-hotel", window: null, bookingId: "book-frontair" },
  { id: "fx-wake-day8", dayId: "day-8", kind: "wake", title: "Wake up", locationId: "loc-frontair-hotel", window: { start: "06:30", end: "07:00" }, bookingId: null },
  { id: "fx-bcn-t1-arrival", dayId: "day-8", kind: "airport", title: "Arrive at Terminal 1", locationId: "loc-bcn-t1", window: { start: "07:45", end: "08:00" }, bookingId: null },
];
