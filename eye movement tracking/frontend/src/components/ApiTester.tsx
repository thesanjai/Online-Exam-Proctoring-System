
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { eyeTrackingApi } from '@/services/eyeTrackingApi';
import { AlertTriangle } from 'lucide-react';

export const ApiTester = () => {
  const { toast } = useToast();

  const handleApiCall = async (endpoint: string, method: string) => {
    try {
      let response;
      switch (endpoint) {
        case 'start':
          response = await eyeTrackingApi.startTracking();
          break;
        case 'stop':
          response = await eyeTrackingApi.stopTracking();
          break;
        case 'status':
          response = await eyeTrackingApi.getStatus();
          break;
        case 'raw_data':
          response = await eyeTrackingApi.getRawData();
          break;
        case 'start_calibration':
          response = await eyeTrackingApi.startCalibration();
          break;
        case 'reset_calibration':
          response = await eyeTrackingApi.resetCalibration();
          break;
        case 'settings':
          if (method === 'GET') {
            response = await eyeTrackingApi.getSettings();
          } else {
            response = await eyeTrackingApi.updateSettings({
              sensitivity: 0.8,
              threshold: 50
            });
          }
          break;
        default:
          throw new Error('Invalid endpoint');
      }
      
      toast({
        title: 'API Response',
        description: (
          <pre className="mt-2 w-full max-h-40 overflow-auto rounded bg-slate-950 p-4">
            {JSON.stringify(response, null, 2)}
          </pre>
        ),
      });
    } catch (error) {
      toast({
        title: 'API Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        <h2 className="text-lg font-semibold">API Endpoint Tester</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Button onClick={() => handleApiCall('start', 'POST')} variant="outline">
          Start Tracking
        </Button>
        <Button onClick={() => handleApiCall('stop', 'POST')} variant="outline">
          Stop Tracking
        </Button>
        <Button onClick={() => handleApiCall('status', 'GET')} variant="outline">
          Get Status
        </Button>
        <Button onClick={() => handleApiCall('raw_data', 'GET')} variant="outline">
          Get Raw Data
        </Button>
        <Button onClick={() => handleApiCall('start_calibration', 'POST')} variant="outline">
          Start Calibration
        </Button>
        <Button onClick={() => handleApiCall('reset_calibration', 'POST')} variant="outline">
          Reset Calibration
        </Button>
        <Button onClick={() => handleApiCall('settings', 'GET')} variant="outline">
          Get Settings
        </Button>
        <Button onClick={() => handleApiCall('settings', 'POST')} variant="outline">
          Update Settings
        </Button>
      </div>
    </Card>
  );
};
