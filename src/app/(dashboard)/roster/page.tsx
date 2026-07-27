import React from 'react';
import { RosterCalendar } from '@/components/roster/RosterCalendar';

export default function RosterPage() {
  return (
    <div className="flex h-full flex-col pb-6">
      <RosterCalendar />
    </div>
  );
}
