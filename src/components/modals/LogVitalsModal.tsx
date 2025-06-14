
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LogVitalsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const LogVitalsModal: React.FC<LogVitalsModalProps> = ({ isOpen, onOpenChange }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Vitals</DialogTitle>
          <DialogDescription>
            Record your latest vital signs. This feature is under development.
          </DialogDescription>
        </DialogHeader>
        {/* Placeholder for form fields */}
        <div className="py-4">
          <p className="text-text-secondary">Vitals logging form will be here.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { /* Handle save */ onOpenChange(false); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogVitalsModal;
