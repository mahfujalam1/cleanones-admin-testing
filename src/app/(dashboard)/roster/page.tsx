import React from 'react';
import { RosterCalendar } from '@/components/roster/RosterCalendar';

export default function RosterPage() {
  return (
    
    
    <div className="flex h-[calc(100dvh-7.5rem)] min-h-[520px] flex-col pb-4">
      <RosterCalendar />
    </div>
  );
}
