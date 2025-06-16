
import { useState } from 'react';
import { TimelineEventFilters } from '@/types'; // Assuming sortOrder is part of TimelineEventFilters

// Default sort order is 'desc' (newest first) in HealthDataContext
// We'll use 'asc' | 'desc' for consistency with the new filters type
export const useTimelineFilters = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Default to newest first
  const [dateFilter, setDateFilter] = useState<string>('all');

  // The filtering and sorting logic has moved to HealthDataContext.
  // This hook now primarily manages the state of these filter options.

  const currentFilters: TimelineEventFilters = {
    searchTerm: searchTerm || undefined, // Pass undefined if empty string for cleaner filter object
    categoryFilter: categoryFilter,
    dateFilter: dateFilter,
    sortOrder: sortOrder,
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
    currentFilters, // Expose the combined filter object for convenience
  };
};
