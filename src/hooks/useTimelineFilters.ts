
import { useState, useMemo } from 'react';
import { TimelineEvent } from '@/types';
import { parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export const useTimelineFilters = (timelineEvents: TimelineEvent[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = timelineEvents.filter(event => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.details.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;

      // Date filter
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const eventDate = parseISO(event.date);
        const now = new Date();
        
        switch (dateFilter) {
          case 'today':
            matchesDate = isWithinInterval(eventDate, {
              start: startOfDay(now),
              end: endOfDay(now)
            });
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = isWithinInterval(eventDate, {
              start: startOfDay(weekAgo),
              end: endOfDay(now)
            });
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = isWithinInterval(eventDate, {
              start: startOfDay(monthAgo),
              end: endOfDay(now)
            });
            break;
        }
      }

      return matchesSearch && matchesCategory && matchesDate;
    });

    // Sort events
    filtered.sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      
      if (sortOrder === 'newest') {
        return dateB.getTime() - dateA.getTime();
      } else {
        return dateA.getTime() - dateB.getTime();
      }
    });

    return filtered;
  }, [timelineEvents, searchTerm, categoryFilter, sortOrder, dateFilter]);

  return {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    sortOrder,
    setSortOrder,
    dateFilter,
    setDateFilter,
    filteredAndSortedEvents
  };
};
