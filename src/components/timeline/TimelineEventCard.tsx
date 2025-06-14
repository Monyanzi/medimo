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

interface TimelineEventCardProps {
  event: TimelineEvent;
  onDelete: (eventId: string) => void;
  onEdit: (eventId: string, updates: Partial<TimelineEvent>) => void;
}

const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ event, onDelete, onEdit }) => {
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [editedTitle, setEditedTitle] = useState(event.title);
  const [editedDetails, setEditedDetails] = useState(event.details);

  const [isEditMedicationModalOpen, setIsEditMedicationModalOpen] = useState(false);
  const [isEditAppointmentModalOpen, setIsEditAppointmentModalOpen] = useState(false);

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
      case 'Test':
        return <Stethoscope className="h-4 w-4 text-orange-500" />;
      case 'Other':
        return <Clock className="h-4 w-4 text-gray-500" />;
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
      case 'Test':
        return 'border-l-orange-500 bg-orange-50';
      case 'Other':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this timeline event?')) {
      onDelete(event.id);
    }
  };

  const handleEditClick = () => {
    if (event.category === 'Medication' && event.relatedId) {
      setIsEditMedicationModalOpen(true);
    } else if (event.category === 'Appointment' && event.relatedId) {
      setIsEditAppointmentModalOpen(true);
    } else {
      setEditedTitle(event.title);
      setEditedDetails(event.details);
      setIsEditingInline(true);
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
      <Card className={`border-l-4 ${getCategoryColor(event.category)}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="mt-1">
                {getCategoryIcon(event.category)}
              </div>
              <div className="flex-1">
                {isEditingInline ? (
                  <div className="space-y-2">
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="text-sm"
                      placeholder="Event title"
                    />
                    <Textarea
                      value={editedDetails}
                      onChange={(e) => setEditedDetails(e.target.value)}
                      className="text-sm"
                      placeholder="Event details"
                      rows={2}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-text-primary">{event.title}</h4>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {event.category}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{event.details}</p>
                  </>
                )}
                <p className="text-xs text-gray-400">
                  {format(parseISO(event.date), 'h:mm a')}
                </p>
              </div>
            </div>
            <div className="flex space-x-1">
              {isEditingInline ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleSaveInlineEdit}
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCancelInlineEdit}
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleEditClick}
                  >
                    <Edit className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medication Edit Modal */}
      {event.category === 'Medication' && event.relatedId && (
        <EditMedicationTimelineModal
          isOpen={isEditMedicationModalOpen}
          onOpenChange={setIsEditMedicationModalOpen}
          event={event}
        />
      )}

      {/* Appointment Edit Modal */}
      {event.category === 'Appointment' && event.relatedId && (
        <EditAppointmentTimelineModal
          isOpen={isEditAppointmentModalOpen}
          onOpenChange={setIsEditAppointmentModalOpen}
          event={event}
        />
      )}
    </>
  );
};

export default TimelineEventCard;
