import { ShiftManagementBoard } from "@/components/shift-management/ShiftManagementBoard";

export default function ShiftManagementPage() {
  return (
    <div className="flex h-[calc(100dvh-7.5rem)] min-h-[520px] flex-col pb-4">
      <ShiftManagementBoard />
    </div>
  );
}
