import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TimelineEvent } from "@/types";
import { Calendar, FileText, Stethoscope, Clock, Info } from "lucide-react";
import { toast } from 'sonner';
import { useHealthData } from '@/contexts/HealthDataContext';
import { format } from 'date-fns';

interface EditGenericTimelineModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    event: TimelineEvent | null;
}

const CATEGORY_OPTIONS: { value: TimelineEvent['category']; label: string; icon: React.ReactNode }[] = [
    { value: 'Document', label: 'Document', icon: <FileText className="h-4 w-4" /> },
    { value: 'Test', label: 'Test/Lab', icon: <Stethoscope className="h-4 w-4" /> },
    { value: 'Other', label: 'Other', icon: <Clock className="h-4 w-4" /> },
];

const EditGenericTimelineModal: React.FC<EditGenericTimelineModalProps> = ({
    isOpen,
    onOpenChange,
    event
}) => {
    const { updateTimelineEvent } = useHealthData();

    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [category, setCategory] = useState<TimelineEvent['category']>('Other');
    const [date, setDate] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when event changes
    useEffect(() => {
        if (event) {
            setTitle(event.title);
            setDetails(event.details || '');
            setCategory(event.category);
            setDate(event.date ? format(new Date(event.date), 'yyyy-MM-dd') : '');
            setNotes(event.notes || '');
        }
    }, [event]);

    const handleSubmit = async () => {
        if (!event) return;

        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }

        setIsSubmitting(true);
        try {
            await updateTimelineEvent(event.id, {
                title: title.trim(),
                details: details.trim(),
                category,
                date: date ? new Date(date).toISOString() : event.date,
                notes: notes.trim() || undefined,
            });
            toast.success('Event updated successfully');
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to update event:', error);
            toast.error('Failed to update event');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSystemEvent = event?.isSystem === true;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-[var(--medimo-bg-elevated)] border-[var(--medimo-border)]">
                <DialogHeader>
                    <DialogTitle className="font-display flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[var(--medimo-accent)]" />
                        {isSystemEvent ? 'View Event' : 'Edit Timeline Event'}
                    </DialogTitle>
                    <DialogDescription>
                        {isSystemEvent
                            ? 'This is a system-generated event and cannot be edited.'
                            : 'Update the details of this timeline event.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* System Event Info Banner */}
                    {isSystemEvent && (
                        <div className="flex items-start gap-2 p-3 bg-[var(--hc-accent-info-soft)] rounded-lg border border-[var(--medimo-accent)]/20">
                            <Info className="h-4 w-4 text-[var(--medimo-accent)] mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-[var(--medimo-text-secondary)]">
                                System events are auto-generated from your health data and cannot be modified.
                            </p>
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Event title"
                            disabled={isSystemEvent}
                            className="border-[var(--medimo-border)] focus:border-[var(--medimo-accent)]"
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={category}
                            onValueChange={(val) => setCategory(val as TimelineEvent['category'])}
                            disabled={isSystemEvent}
                        >
                            <SelectTrigger className="border-[var(--medimo-border)]">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORY_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        <div className="flex items-center gap-2">
                                            {opt.icon}
                                            {opt.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            disabled={isSystemEvent}
                            className="border-[var(--medimo-border)] focus:border-[var(--medimo-accent)]"
                        />
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                        <Label htmlFor="details">Details</Label>
                        <Textarea
                            id="details"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Event details..."
                            rows={3}
                            disabled={isSystemEvent}
                            className="border-[var(--medimo-border)] focus:border-[var(--medimo-accent)] resize-none"
                        />
                    </div>

                    {/* Notes (user-entered, always editable for non-system) */}
                    {!isSystemEvent && (
                        <div className="space-y-2">
                            <Label htmlFor="notes">Personal Notes</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any personal notes about this event..."
                                rows={2}
                                className="border-[var(--medimo-border)] focus:border-[var(--medimo-accent)] resize-none"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-lg"
                    >
                        {isSystemEvent ? 'Close' : 'Cancel'}
                    </Button>
                    {!isSystemEvent && (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !title.trim()}
                            className="rounded-lg bg-[var(--medimo-accent)] hover:bg-[var(--medimo-accent)]/90"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditGenericTimelineModal;
