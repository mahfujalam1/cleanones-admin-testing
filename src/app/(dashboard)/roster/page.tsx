import React from 'react';
import { RosterCalendar } from '@/components/roster/RosterCalendar';

export default function RosterPage() {
  return (
    <div className="h-full flex flex-col w-full pb-10">
      <RosterCalendar />
    </div>
  );
}