import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TimelineEvent } from '@/types';
import { format, parseISO } from 'date-fns';
import { Pill, Calendar, FileText, Activity, Stethoscope, Clock, Trash2, Edit, Check, X } from 'lucide-react';
import EditMedicationTimelineModal from '@/components/modals/EditMedicationTimelineModal';
import EditAppointmentTimelineModal from '@/components/modals/EditAppointmentTimelineModal';
import EditVitalsTimelineModal from '@/components/modals/EditVitalsTimelineModal';
import EditGenericTimelineModal from '@/components/modals/EditGenericTimelineModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TimelineEventCardProps {
  event: TimelineEvent;
  onDelete: (event: TimelineEvent) => void; // Changed to pass full event
  onEdit: (eventId: string, updates: Partial<TimelineEvent>) => void;
}

const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ event, onDelete, onEdit }) => {
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [editedTitle, setEditedTitle] = useState(event.title);
  const [editedDetails, setEditedDetails] = useState(event.details);

  const [isEditMedicationModalOpen, setIsEditMedicationModalOpen] = useState(false);
  const [isEditAppointmentModalOpen, setIsEditAppointmentModalOpen] = useState(false);
  const [isEditVitalsModalOpen, setIsEditVitalsModalOpen] = useState(false);
  const [isEditGenericModalOpen, setIsEditGenericModalOpen] = useState(false);

  const getCategoryIcon = (category: TimelineEvent['category']) => {
    switch (category) {
      case 'Medication':
        return <Pill className="h-5 w-5 text-blue-600" />;
      case 'Appointment':
        return <Calendar className="h-5 w-5 text-violet-600" />;
      case 'Document':
        return <FileText className="h-5 w-5 text-emerald-600" />;
      case 'Vitals':
        return <Activity className="h-5 w-5 text-rose-600" />;
      case 'Test':
        return <Stethoscope className="h-5 w-5 text-amber-600" />;
      case 'Other':
        return <Clock className="h-5 w-5 text-slate-500" />;
      default:
        return <Clock className="h-5 w-5 text-slate-500" />;
    }
  };

  const getCategoryBackground = (category: TimelineEvent['category']) => {
    switch (category) {
      case 'Medication':
        return 'bg-blue-50';
      case 'Appointment':
        return 'bg-violet-50';
      case 'Document':
        return 'bg-emerald-50';
      case 'Vitals':
        return 'bg-rose-50';
      case 'Test':
        return 'bg-amber-50';
      case 'Other':
        return 'bg-slate-50';
      default:
        return 'bg-slate-50';
    }
  };

  const handleEditClick = () => {
    // Always use structured modals - no more free-text inline editing
    if (event.category === 'Medication' && event.relatedId) {
      setIsEditMedicationModalOpen(true);
    } else if (event.category === 'Appointment' && event.relatedId) {
      setIsEditAppointmentModalOpen(true);
    } else if (event.category === 'Vitals' && event.relatedId) {
      setIsEditVitalsModalOpen(true);
    } else {
      // Generic modal for Document, Test, Other, or orphaned events
      // System events will open in read-only mode
      setIsEditGenericModalOpen(true);
    }
  };

  const handleSaveInlineEdit = () => {
    onEdit(event.id, {
      title: editedTitle,
      details: editedDetails
    });
    setIsEditingInline(false);
  };

  const handleCancelInlineEdit = () => {
    setEditedTitle(event.title);
    setEditedDetails(event.details);
    setIsEditingInline(false);
  };

  return (
    <>
      <Card className="bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] rounded-2xl overflow-hidden transition-all duration-200 group hover:border-[var(--medimo-accent)]/30 hover:shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon Container - Color indicates alert level */}
            <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${getCategoryBackground(event.category)}`}>
              {getCategoryIcon(event.category)}
              {/* Alert indicator - subtle dot */}
              {event.systemType === 'threshold' && (
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[var(--medimo-bg-elevated)]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {isEditingInline ? (
                <div className="space-y-2">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-sm rounded-lg"
                    placeholder="Event title"
                  />
                  <Textarea
                    value={editedDetails}
                    onChange={(e) => setEditedDetails(e.target.value)}
                    className="text-sm rounded-lg"
                    placeholder="Event details"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveInlineEdit} className="rounded-lg bg-[var(--medimo-accent)]">
                      <Check className="h-4 w-4 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelInlineEdit} className="rounded-lg">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {/* Title and time on same line */}
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-semibold text-[var(--medimo-text-primary)] truncate">
                          {event.title}
                        </h4>
                        <span className="text-xs text-[var(--medimo-text-muted)] whitespace-nowrap">
                          {format(parseISO(event.date), 'h:mm a')}
                        </span>
                      </div>
                    </div>

                    {/* Actions - Hidden until hover */}
                    <div className="flex items-center -mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-[var(--medimo-accent-soft)]"
                        onClick={handleEditClick}
                      >
                        <Edit className="h-4 w-4 text-[var(--medimo-text-muted)] hover:text-[var(--medimo-accent)]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-rose-50"
                        onClick={() => onDelete(event)}
                      >
                        <Trash2 className="h-4 w-4 text-[var(--medimo-text-muted)] hover:text-rose-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Details - Elegant and minimal */}
                  {event.details && (
                    <p className="text-sm text-[var(--medimo-text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">
                      {event.details}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medication Edit Modal */}
      {event.category === 'Medication' && (
        <EditMedicationTimelineModal
          isOpen={isEditMedicationModalOpen}
          onOpenChange={setIsEditMedicationModalOpen}
          event={event}
        />
      )}
      {event.category === 'Appointment' && (
        <EditAppointmentTimelineModal
          isOpen={isEditAppointmentModalOpen}
          onOpenChange={setIsEditAppointmentModalOpen}
          event={event}
        />
      )}
      {event.category === 'Vitals' && (
        <EditVitalsTimelineModal
          isOpen={isEditVitalsModalOpen}
          onOpenChange={setIsEditVitalsModalOpen}
          event={event}
        />
      )}
      {/* Generic modal for Document, Test, Other, system events, and orphaned events */}
      <EditGenericTimelineModal
        isOpen={isEditGenericModalOpen}
        onOpenChange={setIsEditGenericModalOpen}
        event={event}
      />
    </>
  );
};

export default TimelineEventCard;
