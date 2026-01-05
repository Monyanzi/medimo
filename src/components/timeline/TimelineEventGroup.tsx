
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
  const date = parseISO(dateKey);

  return (
    <div>
      {/* Elegant date header - minimal and refined */}
      <div className="flex items-baseline gap-2 mb-4">
        <h3 className="font-display text-lg font-semibold text-[var(--medimo-text-primary)]">
          {format(date, 'EEEE')}
        </h3>
        <span className="text-sm text-[var(--medimo-text-muted)]">
          {format(date, 'MMMM d')}
        </span>
      </div>
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
