
import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/shared/Header';
import BottomNavigation from '@/components/shared/BottomNavigation';
import DesktopSidebar from '@/components/shared/DesktopSidebar';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Download } from 'lucide-react';
import { useHealthData } from '@/contexts/HealthDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO, isToday, isWithinInterval, subDays } from 'date-fns';
import { generateTimelinePDF } from '@/services/pdfExportService';
import { generateTimelineBlueprintPDF } from '@/services/pdfBlueprintExport';
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
    timelineEvents,
    deleteTimelineEvent,
    updateTimelineEvent,
    deleteAppointment,
    deleteMedication,
    addTimelineEvent,
    medications,
    appointments,
    documents,
    vitalSigns,
    exportEventCategories,
    setExportEventCategories,
    isLoading
  } = useHealthData();
  const { user } = useAuth();
  const [displayedEvents, setDisplayedEvents] = useState<TimelineEvent[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<TimelineEvent | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  // Initialize with user's saved notes or empty string
  const [importantNotes, setImportantNotes] = useState(user?.importantNotes || '');

  // Update notes if user content changes (e.g. after profile edit)
  React.useEffect(() => {
    if (user?.importantNotes) {
      setImportantNotes(user.importantNotes);
    }
  }, [user?.importantNotes]);

  const {
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
    currentFilters
  } = useTimelineFilters();

  const getFilteredEvents = useCallback((filters: TimelineEventFilters): TimelineEvent[] => {
    let processedEvents = [...timelineEvents];

    if (filters.searchTerm) {
      const lowerSearchTerm = filters.searchTerm.toLowerCase();
      processedEvents = processedEvents.filter(event =>
        event.title.toLowerCase().includes(lowerSearchTerm) ||
        (event.details && event.details.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (filters.categoryFilter && filters.categoryFilter !== 'all') {
      processedEvents = processedEvents.filter(event => event.category === filters.categoryFilter);
    }

    if (filters.dateFilter && filters.dateFilter !== 'all') {
      const now = new Date();
      processedEvents = processedEvents.filter(event => {
        const eventDate = parseISO(event.date);
        switch (filters.dateFilter) {
          case 'today':
            return isToday(eventDate);
          case 'past_7_days':
            return isWithinInterval(eventDate, { start: subDays(now, 7), end: now });
          case 'past_30_days':
            return isWithinInterval(eventDate, { start: subDays(now, 30), end: now });
          default:
            return true;
        }
      });
    }

    const sortedEvents = [...processedEvents].sort((a, b) => {
      const timeA = parseISO(a.date).getTime();
      const timeB = parseISO(b.date).getTime();
      return filters.sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    if (filters.systemFilter && filters.systemFilter !== 'all') {
      return sortedEvents.filter(ev => filters.systemFilter === 'system' ? ev.isSystem : !ev.isSystem);
    }

    return sortedEvents;
  }, [timelineEvents]);

  useEffect(() => {
    const filteredEvents = getFilteredEvents(currentFilters);
    setDisplayedEvents(filteredEvents);
  }, [currentFilters, getFilteredEvents]);


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
        } else {
          await deleteMedication(eventToDelete.relatedId);
          toast.success('Medication and related timeline entries deleted.');
        }
      } else {
        await deleteTimelineEvent(eventToDelete.id);
        toast.success('Timeline event removed.');
      }
    } catch (error) {
      toast.error(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setShowDeleteConfirm(false);
      setEventToDelete(null);
    }
  };

  const handleEditEvent = async (eventId: string, updates: Partial<TimelineEvent>) => {
    await updateTimelineEvent(eventId, updates);
  };

  const buildExportEvents = (): TimelineEvent[] => {
    return timelineEvents
      .filter(ev => exportEventCategories.includes(ev.category))
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  };

  const handleExportTimeline = () => {
    if (!user) return;

    try {
      generateTimelinePDF(user, buildExportEvents(), {
        medications,
        appointments,
        vitalSigns,
        includeTimeline: true,
        importantNotes
      });
    } catch (error) {
      console.error("Error generating timeline PDF:", error);
      toast.error('There was an error generating the PDF. Please try again.');
    }
  };

  const groupEventsByDate = (events: TimelineEvent[]) => {
    const groups: { [key: string]: TimelineEvent[] } = {};

    events.forEach(event => {
      const dateKey = format(parseISO(event.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    return groups;
  };

  const eventGroups = groupEventsByDate(displayedEvents);

  return (
    <div className="min-h-screen bg-[var(--medimo-bg-primary)]">
      {/* Desktop Sidebar - hidden on mobile */}
      <DesktopSidebar />

      {/* Main content with sidebar offset on desktop */}
      <div className="xl:pl-64 transition-all duration-300">
        <Header />

        <main className="px-4 py-6 pb-28 lg:pb-8 max-w-5xl mx-auto lg:px-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 reveal-1">
              <LoadingSpinner size="lg" text="Loading timeline..." />
            </div>
          ) : (
            <Card className="bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] rounded-2xl mb-6 reveal-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-[var(--medimo-text-primary)]">
                    <div className="w-10 h-10 rounded-xl bg-[var(--medimo-accent-soft)] flex items-center justify-center">
                      <Clock className="h-5 w-5 text-[var(--medimo-accent)]" />
                    </div>
                    <span className="font-display font-semibold">Medical Timeline</span>
                  </CardTitle>
                  <Button
                    onClick={() => setShowExportOptions(true)}
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 rounded-xl text-[var(--medimo-text-muted)] hover:text-[var(--medimo-accent)] hover:bg-[var(--medimo-accent-soft)] transition-colors"
                    disabled={displayedEvents.length === 0}
                    title="Export timeline"
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <TimelineFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  systemFilter={systemFilter}
                  setSystemFilter={setSystemFilter}
                  dateFilter={dateFilter}
                  setDateFilter={setDateFilter}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                />

                <div className="space-y-6">
                  {Object.keys(eventGroups).length === 0 ? (
                    searchTerm || categoryFilter !== 'all' || dateFilter !== 'all' ? (
                      <div className="text-center py-12">
                        <Clock className="h-12 w-12 mx-auto text-[var(--medimo-text-muted)] mb-4" />
                        <p className="text-[var(--medimo-text-secondary)]">
                          No timeline events match your filters.
                        </p>
                      </div>
                    ) : (
                      <EmptyState
                        illustration="/illustrations/empty-timeline.png"
                        title="Start Your Health Journey"
                        description="Your timeline will show all health events, medications, appointments, and vital signs in one place."
                      />
                    )
                  ) : (
                    Object.entries(eventGroups).map(([dateKey, events]) => (
                      <TimelineEventGroup
                        key={dateKey}
                        dateKey={dateKey}
                        events={events}
                        onDeleteEvent={initiateDeleteProcess}
                        onEditEvent={handleEditEvent}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      <BottomNavigation />

      {/* Export Options Modal */}
      <AlertDialog open={showExportOptions} onOpenChange={setShowExportOptions}>
        <AlertDialogContent className="max-w-md bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-[var(--medimo-text-primary)]">Export Medical Summary</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--medimo-text-secondary)]">Create a printable PDF for your doctor. Includes emergency summary and selected timeline events.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-2">

            {/* Important Notes Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--medimo-text-primary)]">
                Important Notes for Doctor (Optional)
              </label>
              <textarea
                value={importantNotes}
                onChange={(e) => setImportantNotes(e.target.value)}
                placeholder="E.g. Pregnant (due July), Appendectomy 2015, Metal hip implant..."
                className="w-full min-h-[80px] p-3 rounded-xl border border-[var(--medimo-border)] bg-[var(--medimo-bg-primary)] text-sm text-[var(--medimo-text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--medimo-accent)]/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--medimo-text-primary)]">
                Include Timeline Categories
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Medication', 'Appointment', 'Document', 'Vitals', 'Test', 'Other'].map(cat => (
                  <label key={cat} className="flex items-center gap-2 text-sm text-[var(--medimo-text-secondary)] cursor-pointer">
                    <Checkbox
                      checked={exportEventCategories.includes(cat)}
                      onCheckedChange={(checked: any) => {
                        setExportEventCategories(
                          checked ? [...exportEventCategories, cat] : exportEventCategories.filter(c => c !== cat)
                        );
                      }}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg border-[var(--medimo-border)]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { setShowExportOptions(false); handleExportTimeline(); }}
              className="rounded-lg bg-[var(--medimo-accent)] hover:bg-[var(--medimo-accent)]/90 text-white"
            >
              Export PDF
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-[var(--medimo-text-primary)]">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--medimo-text-secondary)]">
              {eventToDelete?.relatedId && (eventToDelete?.category === 'Appointment' || eventToDelete?.category === 'Medication')
                ? `This action will permanently delete the ${eventToDelete?.category.toLowerCase()} record and all its associated timeline entries.`
                : `This action will permanently delete the timeline entry: "${eventToDelete?.title}".`}
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEventToDelete(null)} className="rounded-lg border-[var(--medimo-border)]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteHandler} className="rounded-lg bg-[var(--medimo-critical)] hover:bg-[var(--medimo-critical)]/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TimelineScreen;
