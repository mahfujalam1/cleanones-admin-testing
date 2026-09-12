export type ReportRange = "Week" | "Month" | "Quarter" | "Year";

export interface QualityDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface ShiftTrendItem {
  label: string;
  count: number;
}
