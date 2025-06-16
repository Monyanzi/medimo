
import React from 'react';
import { TimelineEvent } from '@/types';
import { format, parseISO } from 'date-fns';
import TimelineEventCard from './TimelineEventCard';

interface TimelineEventGroupProps {
  dateKey: string;
  events: TimelineEvent[];
  onDeleteEvent: (event: TimelineEvent) => void; // Changed to pass full event
  onEditEvent: (eventId: string, updates: Partial<TimelineEvent>) => void;
}

const TimelineEventGroup: React.FC<TimelineEventGroupProps> = ({
  dateKey,
  events,
  onDeleteEvent, // Prop name is kept, but its signature is effectively changed by TimelineScreen
  onEditEvent
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-divider pb-2">
        {format(parseISO(dateKey), 'EEEE, MMMM d, yyyy')}
      </h3>
      <div className="space-y-3">
        {events.map((event) => (
          <TimelineEventCard
            key={event.id}
            event={event}
            onDelete={onDeleteEvent}
            onEdit={onEditEvent}
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineEventGroup;
