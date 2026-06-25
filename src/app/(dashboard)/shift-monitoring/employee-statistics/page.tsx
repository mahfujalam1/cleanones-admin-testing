"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { WORKERS } from '@/components/shift-monitoring/data';
import { EmployeeStatistics } from '@/components/shift-monitoring/EmployeeStatistics';
import { EmployeeSidebar } from '@/components/shift-monitoring/EmployeeSidebar';

function EmployeeStatisticsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const workerIdParam = searchParams.get('workerId');
  const selectedWorkerId = workerIdParam ? parseInt(workerIdParam) : null;

  const selectedWorker = WORKERS.find(w => w.id === selectedWorkerId) || null;

  const handleClose = () => {
    // Remove query param to clean up URL
    router.replace('/shift-monitoring/employee-statistics');
  };

  const handleWorkerSelect = (worker: { id: number }) => {
    router.push(`/shift-monitoring/employee-statistics?workerId=${worker.id}`);
  };

  return (
    <>
      <EmployeeStatistics 
        onWorkerSelect={handleWorkerSelect} 
        selectedWorkerId={selectedWorkerId}
      />
      {selectedWorker && (
        <EmployeeSidebar 
          worker={selectedWorker} 
          onClose={handleClose} 
        />
      )}
    </>
  );
}

export default function EmployeeStatisticsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmployeeStatisticsContent />
    </Suspense>
  );
}
