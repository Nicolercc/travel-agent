import type { Trip } from "@/lib/domain/types";

export const trip: Trip = {
  id: "trip-spain-2026",
  title: "Spain 2026",
  startDate: "2026-07-28",
  endDate: "2026-08-05",
  regions: [
    { id: "transit", name: "Transit" },
    { id: "menorca", name: "Menorca" },
    { id: "costa-brava", name: "Costa Brava" },
    { id: "barcelona", name: "Barcelona" },
  ],
  emergencyInfo: [
    { label: "Emergency number in Spain", value: "112" },
    { label: "Travel insurance policy", value: "DEMO-INS-0001" },
    { label: "European Health Insurance Card", value: "In wallet" },
  ],
};
