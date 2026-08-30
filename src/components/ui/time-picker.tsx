"use client";

import { Select } from "./select";

const options = Array.from({ length: 96 }, (_, index) => {
  const hour = Math.floor(index / 4), minute = (index % 4) * 15;
  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const label = new Date(2000, 0, 1, hour, minute).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return { value, label };
});

export function TimePicker({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) {
  return <Select required value={value} onValueChange={onValueChange} placeholder="Select time" options={options} />;
}
