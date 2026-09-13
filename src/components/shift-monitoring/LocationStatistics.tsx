"use client";

import React, { useState, useMemo } from 'react';
import { MdLocationOn, MdSearch, MdClose, MdFilterList, MdGridView, MdViewList } from 'react-icons/md';
import { TbMapPin, TbBuildingSkyscraper, TbClock, TbCalendarStats, TbArrowUpRight } from 'react-icons/tb';
import { CardGridSkeleton, TableSkeleton } from '@/components/shared/SkeletonLoader';
import { type Period } from '@/services/actions/shiftMonitoring';
import { useGetLocationStatisticsQuery } from '@/redux/api/shiftMonitoringApi';
import { LocationDetailsModal, type LocationItem } from './LocationDetailsModal';

type SortOption = 'hours' | 'shifts' | 'workers' | 'name';

export function LocationStatistics() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('hours');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeLocation, setActiveLocation] = useState<LocationItem | null>(null);

  const { data: locRes, isLoading: loading, error } = useGetLocationStatisticsQuery({
    period,
    search: search.trim() || undefined,
  });

  const rawItems: LocationItem[] = useMemo(() => locRes?.locations ?? [], [locRes?.locations]);

  // Unique clients for dropdown
  const uniqueClients = useMemo(() => {
    const clients = Array.from(new Set(rawItems.map((l) => l.client_name).filter(Boolean)));
    return clients.sort();
  }, [rawItems]);

  // Filtered & Sorted items
  const items = useMemo(() => {
    let filtered = rawItems;
    if (selectedClient !== 'ALL') {
      filtered = filtered.filter((l) => l.client_name === selectedClient);
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === 'hours') return (b.hours_worked_numeric || 0) - (a.hours_worked_numeric || 0);
      if (sortBy === 'shifts') return (b.shifts_count || 0) - (a.shifts_count || 0);
      if (sortBy === 'workers') return (b.workers_count || 0) - (a.workers_count || 0);
      if (sortBy === 'name') return a.location_name.localeCompare(b.location_name);
      return 0;
    });
  }, [rawItems, selectedClient, sortBy]);

  // Aggregate KPI summary stats
  const summary = useMemo(() => {
    const totalLocations = items.length;
    const clientCount = new Set(items.map((i) => i.client_name)).size;
    const totalHours = items.reduce((acc, i) => acc + (i.hours_worked_numeric || 0), 0);
    const totalShifts = items.reduce((acc, i) => acc + (i.shifts_count || 0), 0);
    const totalWorkers = items.reduce((acc, i) => acc + (i.workers_count || 0), 0);
    const maxHours = Math.max(1, ...items.map((i) => i.hours_worked_numeric || 0));

    return {
      totalLocations,
      clientCount,
      totalHours: totalHours.toFixed(1),
      totalShifts,
      totalWorkers,
      maxHours,
    };
  }, [items]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600">
            <TbMapPin className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-medium text-slate-900 tracking-tight">Live Operations by Client & Location</h1>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Overview
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Operational deployment, hours logged, and active staff across client sites.
            </p>
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          {(['today', 'weekly', 'monthly'] as const).map((value) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-medium capitalize transition-all ${
                period === value
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <TbMapPin className="text-xl" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-400">Total Sites</p>
            <p className="text-xl font-medium text-slate-900">{summary.totalLocations}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <TbBuildingSkyscraper className="text-xl" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-400">Clients Served</p>
            <p className="text-xl font-medium text-slate-900">{summary.clientCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <TbClock className="text-xl" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-400">Tracked Hours</p>
            <p className="text-xl font-medium text-slate-900">{summary.totalHours}h</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <TbCalendarStats className="text-xl" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-400">Total Shifts</p>
            <p className="text-xl font-medium text-slate-900">{summary.totalShifts}</p>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
            <input
              type="text"
              placeholder="Search location or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-slate-50 py-2 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <MdClose />
              </button>
            )}
          </div>

          {/* Client filter */}
          {uniqueClients.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Client:</span>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Clients ({uniqueClients.length})</option>
                {uniqueClients.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Sort & View Mode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <MdFilterList className="text-sm" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary"
            >
              <option value="hours">Hours Worked (High to Low)</option>
              <option value="shifts">Total Shifts (High to Low)</option>
              <option value="workers">Staff Count (High to Low)</option>
              <option value="name">Site Name (A-Z)</option>
            </select>
          </div>

          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`cursor-pointer rounded p-1.5 transition-colors ${
                viewMode === 'grid' ? 'bg-white text-primary shadow-2xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Card Grid"
            >
              <MdGridView className="text-base" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`cursor-pointer rounded p-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-white text-primary shadow-2xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <MdViewList className="text-base" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          Failed to load location statistics. Please refresh or try again later.
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        viewMode === 'grid' ? (
          <CardGridSkeleton cards={8} />
        ) : (
          <div className="dashboard-card overflow-hidden rounded-xl border border-slate-200 bg-white">
            <TableSkeleton rows={6} columns={6} />
          </div>
        )
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <TbMapPin className="text-2xl" />
          </div>
          <h3 className="text-base font-medium text-slate-900">No client locations found</h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
            {search || selectedClient !== 'ALL'
              ? 'Try adjusting your search query or client filter.'
              : 'No operational records available for this period.'}
          </p>
          {(search || selectedClient !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedClient('ALL');
              }}
              className="mt-3 cursor-pointer rounded-lg bg-sky-50 px-3.5 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-100"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const avgHours = item.shifts_count > 0 ? (item.hours_worked_numeric / item.shifts_count).toFixed(1) : '0';
            const progress = Math.min(100, Math.round(((item.hours_worked_numeric || 0) / summary.maxHours) * 100));

            return (
              <div
                key={item.location_id}
                onClick={() => setActiveLocation(item)}
                className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
              >
                <div>
                  {/* Card Header */}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 group-hover:bg-primary group-hover:text-white transition-colors">
                        <MdLocationOn className="text-xl" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-medium text-slate-900 group-hover:text-primary transition-colors">
                          {item.location_name}
                        </h3>
                        <p className="truncate text-xs font-normal text-slate-400 mt-0.5">
                          {item.client_name || 'Client Site'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4 Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50/80 p-3 text-center border border-slate-100">
                    <div>
                      <span className="block text-base font-medium text-slate-800">{item.workers_count}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Workers</span>
                    </div>
                    <div>
                      <span className="block text-base font-medium text-slate-900">{item.hours_worked}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Hours</span>
                    </div>
                    <div>
                      <span className="block text-base font-medium text-slate-900">{item.shifts_count}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Shifts</span>
                    </div>
                  </div>

                  {/* Activity / Capacity Bar */}
                  <div className="mt-3.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Volume relative to peak</span>
                      <span className="font-medium text-slate-700">{avgHours}h / shift</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-all duration-300"
                        style={{ width: `${Math.max(8, progress)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-slate-400">ID: #{item.location_id}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-primary group-hover:underline">
                    View Details
                    <TbArrowUpRight className="text-sm transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="dashboard-card overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Location & Site</th>
                  <th className="px-6 py-3.5">Client Company</th>
                  <th className="px-6 py-3.5">Assigned Workers</th>
                  <th className="px-6 py-3.5">Hours Logged</th>
                  <th className="px-6 py-3.5">Total Shifts</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm bg-white">
                {items.map((item) => (
                  <tr
                    key={item.location_id}
                    onClick={() => setActiveLocation(item)}
                    className="group cursor-pointer transition-colors hover:bg-sky-50/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white transition-colors">
                          <MdLocationOn className="text-lg" />
                        </span>
                        <div>
                          <span className="block font-medium text-slate-900 group-hover:text-primary transition-colors">
                            {item.location_name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">ID: #{item.location_id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-normal text-slate-700">
                        <TbBuildingSkyscraper className="text-slate-400 text-sm" />
                        {item.client_name || 'Client Site'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800">{item.workers_count} staff</span>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.hours_worked}
                    </td>

                    <td className="px-6 py-4 text-slate-700 font-normal">
                      {item.shifts_count}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLocation(item);
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
                      >
                        Details <TbArrowUpRight className="text-sm text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Centered Modal: Zero Sidebars */}
      {activeLocation && (
        <LocationDetailsModal
          location={activeLocation}
          period={period}
          onClose={() => setActiveLocation(null)}
        />
      )}
    </div>
  );
}
