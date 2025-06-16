
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
import { TimelineEvent, TimelineEventFilters } from '@/types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


const TimelineScreen: React.FC = () => {
  const {
    getFilteredTimelineEvents,
    deleteTimelineEvent,
    updateTimelineEvent,
    deleteAppointment, // Added for deep delete
    deleteMedication   // Added for deep delete
  } = useHealthData();
  const { user } = useAuth();
  const [displayedEvents, setDisplayedEvents] = useState<TimelineEvent[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<TimelineEvent | null>(null);

  const {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    sortOrder,
    setSortOrder,
    dateFilter,
    setDateFilter,
    currentFilters
  } = useTimelineFilters();

  // This useEffect handles re-fetching and updating displayedEvents whenever
  // the master list in HealthDataContext might change (e.g., after a delete operation)
  // or when filters change.
  useEffect(() => {
    if (getFilteredTimelineEvents) {
      const events = getFilteredTimelineEvents(currentFilters);
      setDisplayedEvents(events);
    }
  }, [currentFilters, getFilteredTimelineEvents, masterTimelineEvents]); // Assuming masterTimelineEvents is a dependency if directly accessible or through a version number

  // Corrected: Dependency should be on what HealthDataContext provides.
  // Since HealthDataContext's getFilteredTimelineEvents is memoized with masterTimelineEvents,
  // any change in masterTimelineEvents will give a new function reference for getFilteredTimelineEvents.
  // So, [currentFilters, getFilteredTimelineEvents] should be sufficient.


  const initiateDeleteProcess = (event: TimelineEvent) => {
    setEventToDelete(event);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteHandler = async () => {
    if (!eventToDelete) return;

    try {
      if ((eventToDelete.category === 'Appointment' || eventToDelete.category === 'Medication') && eventToDelete.relatedId) {
        if (eventToDelete.category === 'Appointment') {
          await deleteAppointment(eventToDelete.relatedId);
          toast.success('Appointment and related timeline entries deleted.');
        } else { // Medication
          await deleteMedication(eventToDelete.relatedId);
          toast.success('Medication and related timeline entries deleted.');
        }
      } else {
        await deleteTimelineEvent(eventToDelete.id);
        toast.success('Timeline event removed.');
      }
      // The useEffect listening to getFilteredTimelineEvents should refresh the displayedEvents
    } catch (error) {
      toast.error(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setShowDeleteConfirm(false);
      setEventToDelete(null);
    }
  };

  const handleEditEvent = async (eventId: string, updates: Partial<TimelineEvent>) => {
    await updateTimelineEvent(eventId, updates);
    // The useEffect will handle refreshing displayedEvents
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
                    onDeleteEvent={initiateDeleteProcess} // Pass the new handler
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {eventToDelete?.relatedId && (eventToDelete?.category === 'Appointment' || eventToDelete?.category === 'Medication')
                ? `This action will permanently delete the ${eventToDelete?.category.toLowerCase()} record and all its associated timeline entries.`
                : `This action will permanently delete the timeline entry: "${eventToDelete?.title}".`}
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEventToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteHandler} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TimelineScreen;
