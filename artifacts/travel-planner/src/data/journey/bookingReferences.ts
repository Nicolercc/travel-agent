import type { BookingReference } from "@/types/journey";

/** Confirmed and unresolved booking references for Spain 2026. */
export const bookingReferences: BookingReference[] = [
  {
    id: "book-dl128",
    provider: "Delta Air Lines",
    confirmationNumber: "DL128",
    status: "confirmed",
    notes: "DL 128 · JFK → BCN · departs Jul 28 6:55 PM, arrives Jul 29 8:45 AM",
  },
  {
    id: "book-dl129",
    provider: "Delta Air Lines",
    confirmationNumber: "DL129",
    status: "confirmed",
    notes: "DL 129 · BCN → JFK · departs Aug 5 10:55 AM",
  },
  {
    id: "book-fr7509",
    provider: "Ryanair",
    confirmationNumber: "W4LNUT",
    status: "confirmed",
    notes: "FR 7509 · BCN T2 → MAH · Jul 29 3:50 PM",
  },
  {
    id: "book-fr6882",
    provider: "Ryanair",
    confirmationNumber: "W4LNUT",
    status: "confirmed",
    notes: "FR 6882 · MAH → BCN T2 · Aug 1 7:50 AM",
  },
  {
    id: "book-menorca-car",
    provider: "DoYouSpain / Autos Menorca NR",
    confirmationNumber: "DYS-207641506",
    status: "confirmed",
    notes:
      "Pickup Jul 29 5:00 PM MAH · Voucher return Aug 1 8:00 AM — conflicts with 7:50 AM flight",
  },
  {
    id: "book-drivalia-car",
    provider: "DoYouSpain / Drivalia Rent A Car",
    confirmationNumber: "DYS-208785865",
    status: "confirmed",
    notes: "Pickup Aug 1 9:00 AM BCN · Voucher return Aug 3 12:00 PM · Desired return before 9:00 AM Aug 3",
  },
  {
    id: "book-cala-en-porter",
    provider: "Airbnb — Host Scott",
    confirmationNumber: "SCOTT-CALA-EN-PORTER",
    status: "confirmed",
    notes: "Jul 29–Aug 1 · Check-in after 4:00 PM Jul 29 · Check-out before 10:00 AM Aug 1",
  },
  {
    id: "book-gran-hotel-reymar",
    provider: "Gran Hotel Reymar",
    confirmationNumber: "REYMAR-AUG1",
    status: "confirmed",
    notes: "Aug 1–2 · Check-in 2:00 PM · Check-out 11:00 AM",
  },
  {
    id: "book-intercontinental",
    provider: "InterContinental Barcelona",
    confirmationNumber: "IHG-20384",
    status: "confirmed",
    notes: "Aug 2–4 · Check-in 3:00 PM · Check-out 12:00 PM",
  },
  {
    id: "book-frontair",
    provider: "Alexandre FrontAir Congress Hotel",
    confirmationNumber: "FRONTAIR-AUG4",
    status: "confirmed",
    notes: "Aug 4–5 · Free airport shuttle advertised — exact departure time not yet reserved",
  },
  {
    id: "book-sagrada",
    provider: "Sagrada Família",
    confirmationNumber: null,
    status: "unresolved",
    bookingLink: "https://sagradafamilia.org/",
    notes: "HIGH PRIORITY, NOT BOOKED · Target Aug 4 ~2:00 PM timed entry",
  },
  {
    id: "book-cova-xoroi",
    provider: "Cova d'en Xoroi",
    confirmationNumber: null,
    status: "unresolved",
    bookingLink: "https://covadenxoroi.com/",
    notes: "Sunset session preferred · Not booked · Valid target Jul 29 or Jul 30",
  },
];
