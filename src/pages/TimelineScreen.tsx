
import React from 'react';
import Header from '@/components/shared/Header';
import BottomNavigation from '@/components/shared/BottomNavigation';
import FAB from '@/components/shared/FAB';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Download } from 'lucide-react';
import { useHealthData } from '@/contexts/HealthDataContext';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/shared/Header';
import BottomNavigation from '@/components/shared/BottomNavigation';
import FAB from '@/components/shared/FAB';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Download } from 'lucide-react';
import { useHealthData } from '@/contexts/HealthDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { generateTimelinePDF } from '@/services/pdfExportService';
import { useTimelineFilters } from '@/hooks/useTimelineFilters';
import TimelineFilters from '@/components/timeline/TimelineFilters';
import TimelineEventGroup from '@/components/timeline/TimelineEventGroup';
import { TimelineEvent, TimelineEventFilters } from '@/types'; // Import TimelineEventFilters
import { toast } from 'sonner'; // Assuming toast is used for errors

const TimelineScreen: React.FC = () => {
  const { getFilteredTimelineEvents, deleteTimelineEvent, updateTimelineEvent } = useHealthData();
  const { user } = useAuth();
  const [displayedEvents, setDisplayedEvents] = useState<TimelineEvent[]>([]);

  const {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    sortOrder,
    setSortOrder,
    dateFilter,
    setDateFilter,
    currentFilters // Use the combined filters object
  } = useTimelineFilters();

  useEffect(() => {
    // Fetch filtered events when currentFilters change
    if (getFilteredTimelineEvents) {
      const events = getFilteredTimelineEvents(currentFilters);
      setDisplayedEvents(events);
    }
  }, [currentFilters, getFilteredTimelineEvents]);


  const handleDeleteEvent = async (eventId: string) => {
    // Optimistically update UI or refetch after delete
    await deleteTimelineEvent(eventId);
    // Re-fetch to reflect changes, HealthDataContext's master list is updated
    if (getFilteredTimelineEvents) {
        const events = getFilteredTimelineEvents(currentFilters);
        setDisplayedEvents(events);
    }
  };

  const handleEditEvent = async (eventId: string, updates: Partial<TimelineEvent>) => {
    await updateTimelineEvent(eventId, updates);
    // Re-fetch to reflect changes
    if (getFilteredTimelineEvents) {
        const events = getFilteredTimelineEvents(currentFilters);
        setDisplayedEvents(events);
    }
  };

  const handleExportTimeline = () => {
    if (!user) return;

    try {
      // Use displayedEvents which are already filtered
      generateTimelinePDF(user, displayedEvents);
    } catch (error) {
      console.error("Error generating timeline PDF:", error);
      toast.error('There was an error generating the PDF. Please try again.');
    }
  };

  const groupEventsByDate = (events: TimelineEvent[]) => { // Parameter type updated
    const groups: { [key: string]: TimelineEvent[] } = {}; // Value type updated
    
    events.forEach(event => {
      const dateKey = format(parseISO(event.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    return groups;
  };

  const eventGroups = groupEventsByDate(displayedEvents); // Use displayedEvents

  return (
    <div className="min-h-screen bg-background-main font-inter">
      <Header />
      
      <main className="px-4 py-6 pb-24">
        <Card className="bg-surface-card border-border-divider shadow-md mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-text-primary">
                <Clock className="h-5 w-5 text-primary-action" />
                <span>Medical Timeline</span>
              </CardTitle>
              <Button
                onClick={handleExportTimeline}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                disabled={displayedEvents.length === 0} // Use displayedEvents
              >
                <Download className="h-4 w-4" />
                <span>Export PDF</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TimelineFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />

            {/* Timeline Display */}
            <div className="space-y-6">
              {Object.keys(eventGroups).length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-text-secondary">
                    {searchTerm || categoryFilter !== 'all' || dateFilter !== 'all'
                      ? 'No timeline events match your filters.'
                      : 'No timeline events yet. Start by adding medications, appointments, or documents.'}
                  </p>
                </div>
              ) : (
                Object.entries(eventGroups).map(([dateKey, events]) => (
                  <TimelineEventGroup
                    key={dateKey}
                    dateKey={dateKey}
                    events={events}
                    onDeleteEvent={handleDeleteEvent}
                    onEditEvent={handleEditEvent}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
      <FAB />
    </div>
  );
};

export default TimelineScreen;
