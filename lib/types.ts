export type DataStatus = "provisional" | "finalized" | "under_review";
export type EventStatus = "active" | "monitoring" | "contained";
export type SourceTier = "global" | "regional" | "national";

export interface CountryRecord {
  country: string;
  country_code: string;
  confirmed_cases: number;
  suspected_cases: number;
  deaths: number;
  active_events: number;
  source_name: string;
  source_url: string;
  source_type: SourceTier;
  confidence: number;
  data_status: DataStatus;
  report_date: string;
  last_checked: string;
  last_updated: string;
}

export interface EventRecord {
  id: string;
  name: string;
  location: string;
  country: string;
  country_code: string;
  confirmed_cases: number;
  suspected_cases: number;
  deaths: number;
  status: EventStatus;
  source_name: string;
  source_url: string;
  source_type: SourceTier;
  confidence: number;
  data_status: DataStatus;
  report_date: string;
  last_checked: string;
  last_updated: string;
}

export interface SourceInfo {
  code: string;
  name: string;
  tier: SourceTier;
  url: string;
  last_updated: string;
  status: "ok" | "delay" | "error";
}

export interface TimelinePoint {
  week: number;
  period_start: string;
  confirmed: number;
  suspected: number;
  deaths: number;
}

export interface SummaryTotals {
  confirmed_cases: number;
  suspected_cases: number;
  deaths: number;
  active_events: number;
}

export interface Snapshot {
  id: string;
  as_of: string;
  data_status: DataStatus;
  totals: SummaryTotals;
  by_country: CountryRecord[];
  events: EventRecord[];
  sources_used: SourceInfo[];
  timeline: TimelinePoint[];
  last_checked: string;
  is_demo: boolean;
  notes?: string;
}
