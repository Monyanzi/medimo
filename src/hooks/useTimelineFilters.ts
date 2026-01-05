
import { useState } from 'react';
import { TimelineEventFilters } from '@/types'; // Assuming sortOrder is part of TimelineEventFilters

// Default sort order is 'desc' (newest first) in HealthDataContext
// We'll use 'asc' | 'desc' for consistency with the new filters type
export const useTimelineFilters = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Default to newest first
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [systemFilter, setSystemFilter] = useState<'all' | 'user' | 'system'>('all');


  const currentFilters: TimelineEventFilters = {
    searchTerm: searchTerm || undefined, // Pass undefined if empty string for cleaner filter object
    categoryFilter: categoryFilter,
    dateFilter: dateFilter,
    sortOrder: sortOrder,
    systemFilter: systemFilter,
  };

  return {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    sortOrder,
    setSortOrder,
    dateFilter,
    setDateFilter,
    systemFilter,
    setSystemFilter,
    currentFilters, // Expose the combined filter object for convenience
  };
};
