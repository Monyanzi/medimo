import React, { useState, useMemo } from 'react';
import Header from '@/components/shared/Header';
import BottomNavigation from '@/components/shared/BottomNavigation';
import FAB from '@/components/shared/FAB';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Clock, Search, Filter, Calendar, Pill, FileText, Activity, Stethoscope, Edit, Trash2, Download } from 'lucide-react';
import { useHealthData } from '@/contexts/HealthDataContext';
import { TimelineEvent } from '@/types';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

const TimelineScreen: React.FC = () => {
  const { timelineEvents, updateTimelineEvent, deleteTimelineEvent } = useHealthData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const getCategoryIcon = (category: TimelineEvent['category']) => {
    switch (category) {
      case 'Medication':
        return <Pill className="h-4 w-4 text-blue-500" />;
      case 'Appointment':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'Document':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'Vitals':
        return <Activity className="h-4 w-4 text-red-500" />;
      case 'Lab Result':
        return <Stethoscope className="h-4 w-4 text-orange-500" />;
      case 'Observation':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'Treatment':
        return <Stethoscope className="h-4 w-4 text-indigo-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: TimelineEvent['category']) => {
    switch (category) {
      case 'Medication':
        return 'border-l-blue-500 bg-blue-50';
      case 'Appointment':
        return 'border-l-purple-500 bg-purple-50';
      case 'Document':
        return 'border-l-green-500 bg-green-50';
      case 'Vitals':
        return 'border-l-red-500 bg-red-50';
      case 'Lab Result':
        return 'border-l-orange-500 bg-orange-50';
      case 'Observation':
        return 'border-l-gray-500 bg-gray-50';
      case 'Treatment':
        return 'border-l-indigo-500 bg-indigo-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

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

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this timeline event?')) {
      await deleteTimelineEvent(eventId);
    }
  };

  const handleExportTimeline = () => {
    const exportData = filteredAndSortedEvents.map(event => ({
      Date: format(parseISO(event.date), 'MMM d, yyyy h:mm a'),
      Category: event.category,
      Title: event.title,
      Details: event.details
    }));

    const csvContent = [
      ['Date', 'Category', 'Title', 'Details'].join(','),
      ...exportData.map(row => [
        `"${row.Date}"`,
        `"${row.Category}"`,
        `"${row.Title}"`,
        `"${row.Details}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `medical_timeline_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const eventGroups = groupEventsByDate(filteredAndSortedEvents);

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
                disabled={filteredAndSortedEvents.length === 0}
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters and Search */}
            <div className="space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search timeline events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Medication">Medications</SelectItem>
                      <SelectItem value="Appointment">Appointments</SelectItem>
                      <SelectItem value="Document">Documents</SelectItem>
                      <SelectItem value="Vitals">Vitals</SelectItem>
                      <SelectItem value="Lab Result">Lab Results</SelectItem>
                      <SelectItem value="Observation">Observations</SelectItem>
                      <SelectItem value="Treatment">Treatments</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Past Week</SelectItem>
                      <SelectItem value="month">Past Month</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

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
                  <div key={dateKey}>
                    <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-divider pb-2">
                      {format(parseISO(dateKey), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <div className="space-y-3">
                      {events.map((event) => (
                        <Card key={event.id} className={`border-l-4 ${getCategoryColor(event.category)}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className="mt-1">
                                  {getCategoryIcon(event.category)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-medium text-text-primary">{event.title}</h4>
                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                      {event.category}
                                    </span>
                                  </div>
                                  <p className="text-sm text-text-secondary mb-2">{event.details}</p>
                                  <p className="text-xs text-gray-400">
                                    {format(parseISO(event.date), 'h:mm a')}
                                  </p>
                                </div>
                              </div>
                              {event.isEditable !== false && (
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDeleteEvent(event.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
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
