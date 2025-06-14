
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

interface AddMedicationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const AddMedicationModal: React.FC<AddMedicationModalProps> = ({ isOpen, onOpenChange }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Medication</DialogTitle>
          <DialogDescription>
            Fill in the details of the new medication. This feature is under development.
          </DialogDescription>
        </DialogHeader>
        {/* Placeholder for form fields */}
        <div className="py-4">
          <p className="text-text-secondary">Medication form will be here.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { /* Handle save */ onOpenChange(false); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMedicationModal;
