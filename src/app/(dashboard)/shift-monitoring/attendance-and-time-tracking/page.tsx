"use client";

import React, { useState } from 'react';
import { AttendanceTimeTracking, type TimeRange } from '@/components/shift-monitoring/AttendanceTimeTracking';
import { AttendanceStatsModal } from '@/components/shift-monitoring/AttendanceStatsModal';
import { WorkerInfo } from '@/components/shift-monitoring/types';

export default function AttendanceTimeTrackingPage() {
  const [selectedWorker, setSelectedWorker] = useState<WorkerInfo | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('Today');

  return (
    <div className="space-y-6 pb-10">
      <AttendanceTimeTracking
        onWorkerSelect={(worker) => setSelectedWorker(worker)}
        selectedWorkerId={selectedWorker?.id || null}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
      {selectedWorker && (
        <AttendanceStatsModal
          worker={selectedWorker}
          period={timeRange.toLowerCase() as 'today' | 'weekly' | 'monthly'}
          onClose={() => setSelectedWorker(null)}
        />
      )}
    </div>
  );
}
