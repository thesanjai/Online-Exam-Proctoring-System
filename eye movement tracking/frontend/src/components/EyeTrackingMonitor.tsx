
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { WebcamFeed } from './WebcamFeed';
import { ControlPanel } from './ControlPanel';
import { ApiTester } from './ApiTester';
import { eyeTrackingApi } from '@/services/eyeTrackingApi';
import { useGazeMonitor } from '@/hooks/useGazeMonitor';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const EyeTrackingMonitor = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [initializingTracking, setInitializingTracking] = useState(false);
  const { checkGazeDuration } = useGazeMonitor(isTracking);
  const { toast } = useToast();

  const startTracking = async () => {
    if (isTracking || initializingTracking) return;
    
    setInitializingTracking(true);
    try {
      await eyeTrackingApi.startTracking();
      setIsTracking(true);
      toast({
        title: "Tracking Started",
        description: "Eye movement tracking is now active",
      });
    } catch (error) {
      console.error("Failed to start tracking:", error);
      toast({
        title: "Error",
        description: "Failed to start tracking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInitializingTracking(false);
    }
  };

  const stopTracking = async () => {
    if (!isTracking) return;
    
    try {
      await eyeTrackingApi.stopTracking();
      setIsTracking(false);
      toast({
        title: "Tracking Stopped",
        description: "Eye movement tracking has been stopped",
      });
    } catch (error) {
      console.error("Failed to stop tracking:", error);
      toast({
        title: "Error",
        description: "Failed to stop tracking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const statusQuery = useQuery({
    queryKey: ['status'],
    queryFn: eyeTrackingApi.getStatus,
    enabled: isTracking,
    refetchInterval: isTracking ? 1000 : false,
  });

  const rawDataQuery = useQuery({
    queryKey: ['rawData'],
    queryFn: eyeTrackingApi.getRawData,
    enabled: isTracking,
    refetchInterval: isTracking ? 500 : false,
  });

  useEffect(() => {
    if (rawDataQuery.data && isTracking) {
      checkGazeDuration(rawDataQuery.data);
    }
  }, [rawDataQuery.data, isTracking, checkGazeDuration]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold mb-6">Eye Movement Tracking</h1>
      
      {isTracking && (
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertTitle>Monitoring Active</AlertTitle>
          <AlertDescription>
            Your eye movements are being tracked. A warning will appear if you focus on one spot for more than 5 seconds.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <WebcamFeed isTracking={isTracking} />
          <ApiTester />
        </div>
        
        <div className="space-y-4">
          <ControlPanel 
            isTracking={isTracking} 
            initializingTracking={initializingTracking}
            onStartTracking={startTracking} 
            onStopTracking={stopTracking} 
          />
          
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-2">Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tracking Active:</span>
                <span className={isTracking ? "text-green-500" : "text-red-500"}>
                  {isTracking ? "Yes" : "No"}
                </span>
              </div>
              {statusQuery.data && (
                <div className="text-sm text-gray-600">
                  <pre className="overflow-auto max-h-48">
                    {JSON.stringify(statusQuery.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Card>

          {rawDataQuery.data && (
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-2">Raw Data</h2>
              <pre className="text-sm text-gray-600 overflow-auto max-h-48">
                {JSON.stringify(rawDataQuery.data, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
