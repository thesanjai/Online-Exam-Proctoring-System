
import { useState } from 'react';
import { Play, Pause, Eye, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { eyeTrackingApi } from '@/services/eyeTrackingApi';

interface ControlPanelProps {
  isTracking: boolean;
  initializingTracking: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  isTracking, 
  initializingTracking,
  onStartTracking, 
  onStopTracking 
}) => {
  const { toast } = useToast();

  const handleStartCalibration = async () => {
    try {
      await eyeTrackingApi.startCalibration();
      toast({
        title: "Calibration Started",
        description: "Please follow the on-screen instructions",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start calibration",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex gap-2">
        <Button 
          onClick={isTracking ? onStopTracking : onStartTracking}
          variant={isTracking ? "destructive" : "default"}
          className="w-full"
          disabled={initializingTracking}
        >
          {initializingTracking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initializing...
            </>
          ) : isTracking ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Stop Tracking
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Tracking
            </>
          )}
        </Button>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={handleStartCalibration}
          variant="secondary"
          className="w-full"
          disabled={!isTracking}
        >
          <Eye className="mr-2 h-4 w-4" />
          Calibrate
        </Button>
        <Button variant="outline" className="w-full">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    </Card>
  );
};
