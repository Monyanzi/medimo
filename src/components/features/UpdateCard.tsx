
import React from 'react';
import { Calendar, Clock, MapPin, Pill } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Appointment, Medication } from '@/types';

interface UpdateCardProps {
  upcomingAppointment?: Appointment;
  activeMedications?: Medication[];
}

const UpdateCard: React.FC<UpdateCardProps> = ({ 
  upcomingAppointment, 
  activeMedications = [] 
}) => {
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  // Show upcoming appointment if exists
  if (upcomingAppointment) {
    const { date, time } = formatDateTime(upcomingAppointment.dateTime);
    
    return (
      <Card className="bg-surface-card border-border-divider shadow-md font-inter">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-text-primary flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary-action" />
            <span>Upcoming Appointment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-text-primary text-base mb-1">
              {upcomingAppointment.title}
            </h3>
            <p className="text-text-secondary text-sm">
              with {upcomingAppointment.doctorName}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-text-secondary" />
              <span className="text-text-primary font-medium">{date}</span>
              <span className="text-text-secondary">at</span>
              <span className="text-text-primary font-medium">{time}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-text-secondary" />
              <span className="text-text-primary">{upcomingAppointment.location}</span>
            </div>
          </div>

          {upcomingAppointment.notes && (
            <div className="p-3 bg-accent-success/10 rounded-lg">
              <p className="text-sm text-text-primary">
                <span className="font-medium">Notes:</span> {upcomingAppointment.notes}
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 border-border-divider hover:bg-accent-success/20"
            >
              Reschedule
            </Button>
            <Button 
              size="sm"
              className="flex-1 bg-primary-action hover:bg-primary-action/90 text-white"
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show medication reminder if no appointments but active medications exist
  if (activeMedications.length > 0) {
    const nextMedication = activeMedications[0]; // Simple logic - could be enhanced
    
    return (
      <Card className="bg-surface-card border-border-divider shadow-md font-inter">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-text-primary flex items-center space-x-2">
            <Pill className="h-5 w-5 text-primary-action" />
            <span>Medication Reminder</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-text-primary text-base mb-1">
              {nextMedication.name}
            </h3>
            <p className="text-text-secondary text-sm">
              {nextMedication.dosage} - {nextMedication.frequency}
            </p>
          </div>

          {nextMedication.instructions && (
            <div className="p-3 bg-accent-success/10 rounded-lg">
              <p className="text-sm text-text-primary">
                <span className="font-medium">Instructions:</span> {nextMedication.instructions}
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 border-border-divider hover:bg-accent-success/20"
            >
              Snooze
            </Button>
            <Button 
              size="sm"
              className="flex-1 bg-primary-action hover:bg-primary-action/90 text-white"
            >
              Mark Taken
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  return (
    <Card className="bg-surface-card border-border-divider shadow-md font-inter">
      <CardContent className="py-8 text-center">
        <div className="space-y-3">
          <div className="h-12 w-12 bg-accent-success/20 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="h-6 w-6 text-primary-action" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary mb-1">
              You're all caught up!
            </h3>
            <p className="text-text-secondary text-sm">
              No upcoming tasks or appointments. Enjoy your day!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpdateCard;
