import type { Booking } from "@/lib/domain/types";

/** Demo fixtures: every confirmation is a DEMO- value (see seed-policy.test.ts). */
export const bookings: Booking[] = [
  { id: "book-dl128", kind: "flight", provider: "Delta Air Lines", title: "DL128 · JFK → Barcelona", confirmation: "DEMO-DLT128", link: "https://www.delta.com/", notes: "Departs Jul 28, 6:55 PM · arrives Jul 29, 8:45 AM" },
  { id: "book-fr7509", kind: "flight", provider: "Ryanair", title: "FR7509 · Barcelona → Menorca", confirmation: "DEMO-FR4K2Q", link: "https://www.ryanair.com/", notes: "Terminal 2 · Jul 29, 3:50 PM · same reservation as FR6882" },
  { id: "book-menorca-car", kind: "car", provider: "DoYouSpain · Autos Menorca", title: "Menorca rental car", confirmation: "DEMO-CARMNR1", link: "https://www.doyouspain.com/", notes: "Pickup Jul 29, 5:00 PM at MAH. Voucher return Aug 1, 8:00 AM, which is after the 7:50 AM flight." },
  { id: "book-cala-en-porter", kind: "stay", provider: "Holiday rental", title: "Cala en Porter stay", confirmation: "DEMO-STAY-CEP", link: null, notes: "Jul 29 – Aug 1 · check-in from 4:00 PM · check-out by 10:00 AM" },
  { id: "book-fr6882", kind: "flight", provider: "Ryanair", title: "FR6882 · Menorca → Barcelona", confirmation: "DEMO-FR4K2Q", link: "https://www.ryanair.com/", notes: "Aug 1, 7:50 AM · arrives Terminal 2" },
  { id: "book-drivalia-car", kind: "car", provider: "DoYouSpain · Drivalia", title: "Barcelona / Costa Brava rental car", confirmation: "DEMO-CARBCN2", link: "https://www.doyouspain.com/", notes: "Pickup Aug 1, 9:00 AM. Voucher return Aug 3, 12:00 PM; aiming to return before 9:00 AM." },
  { id: "book-gran-hotel-reymar", kind: "stay", provider: "Gran Hotel Reymar", title: "Gran Hotel Reymar, Tossa de Mar", confirmation: "DEMO-REYMAR", link: null, notes: "Aug 1–2 · check-in from 2:00 PM · check-out by 11:00 AM" },
  { id: "book-intercontinental", kind: "stay", provider: "InterContinental", title: "InterContinental Barcelona", confirmation: "DEMO-IHG204", link: "https://www.ihg.com/", notes: "Aug 2–4 · check-in from 3:00 PM · check-out by 12:00 PM" },
  { id: "book-frontair", kind: "stay", provider: "Alexandre Hotels", title: "Alexandre FrontAir Congress Hotel", confirmation: "DEMO-FRONTAIR", link: null, notes: "Aug 4–5 · free airport shuttle advertised" },
  { id: "book-dl129", kind: "flight", provider: "Delta Air Lines", title: "DL129 · Barcelona → JFK", confirmation: "DEMO-DLT129", link: "https://www.delta.com/", notes: "Aug 5, 10:55 AM · Terminal 1" },
  { id: "book-sagrada", kind: "ticket", provider: "Sagrada Família", title: "Sagrada Família timed entry", confirmation: null, link: "https://sagradafamilia.org/", notes: "Target Aug 4 around 2:00 PM. Timed entry sells out." },
  { id: "book-cova-xoroi", kind: "ticket", provider: "Cova d'en Xoroi", title: "Cova d'en Xoroi sunset session", confirmation: null, link: "https://covadenxoroi.com/", notes: "Jul 29 preferred, Jul 30 as the backup slot." },
];
