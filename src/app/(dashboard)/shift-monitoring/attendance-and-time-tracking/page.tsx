"use client";

import React, { useState } from 'react';
import { AttendanceTimeTracking } from '@/components/shift-monitoring/AttendanceTimeTracking';
import { AttendanceSidebar } from '@/components/shift-monitoring/AttendanceSidebar';
import { WorkerInfo } from '@/components/shift-monitoring/types';

export default function AttendanceTimeTrackingPage() {
  const [selectedWorker, setSelectedWorker] = useState<WorkerInfo | null>(null);

  return (
    <div className='space-y-6 pb-10'>
      <AttendanceTimeTracking
        onWorkerSelect={(worker) => setSelectedWorker(worker)}
        selectedWorkerId={selectedWorker?.id || null}
      />
      {selectedWorker && (
        <AttendanceSidebar
          worker={selectedWorker}
          onClose={() => setSelectedWorker(null)}
        />
      )}
    </div>
  );
}
