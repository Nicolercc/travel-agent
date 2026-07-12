export type ItemStatus = 'booked' | 'planned' | 'optional' | 'backup' | 'do-not-cram';
export type ItemCategory = 'food' | 'bar' | 'cafe' | 'museum' | 'experience' | 'shop' | 'accommodation' | 'transport' | 'viewpoint' | 'nightlife' | 'beach';
export type SourceType = 'tiktok' | 'instagram' | 'google_maps' | 'blog' | 'manual';
export type Priority = 'must' | 'high' | 'medium' | 'low';
export type DaySection = 'anchor' | 'booked' | 'planned' | 'optional' | 'backup' | 'do-not-cram';
export type TripDayKind =
  | 'arrival'
  | 'experience'
  | 'road-trip'
  | 'transfer'
  | 'city'
  | 'mountain'
  | 'departure';
export type LogisticsType = 'flight' | 'hotel' | 'car_rental' | 'ticket' | 'reservation' | 'emergency';

export interface SavedPlace {
  id: string;
  name: string;
  city: string;
  area: string;
  category: ItemCategory;
  priority: Priority;
  status: ItemStatus;
  notes: string;
  source_type: SourceType;
  source_url: string | null;
  raw_notes: string | null;
  google_maps_url: string | null;
  transcript?: string | null;
  assigned_day_id: string | null;
  day_section?: DaySection;
  booking_link?: string | null;
  time?: string | null;
  tags?: string[];
}

export interface TripDay {
  id: string;
  date: string;
  city: string;
  area_context: string;
  title: string;
  day_kind: TripDayKind;
  day_vibe: string;
  anchor_place_id: string | null;
  outfit_note: string | null;
  notes: string | null;
}

export interface Trip {
  id: string;
  title: string;
  route: string;
  destination: string;
  start_date: string;
  end_date: string;
  cover_image?: string | null;
  days: TripDay[];
}

export interface LogisticsItem {
  id: string;
  type: LogisticsType;
  title: string;
  date: string | null;
  time: string | null;
  address: string | null;
  confirmation: string | null;
  booking_link: string | null;
  notes: string | null;
}
