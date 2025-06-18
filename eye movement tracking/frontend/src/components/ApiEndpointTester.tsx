import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { eyeTrackingApi } from '@/services/eyeTrackingApi';
import { Play, CircleStop, Eye, Settings, Database, FileText, Camera, Calendar, PowerOff } from 'lucide-react';

export const ApiEndpointTester = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [rawData, setRawData] = useState<any>(null);
  const { toast } = useToast();

  const startProcessing = async () => {
    try {
      console.log('Starting processing...');
      await eyeTrackingApi.startTracking();
      setIsProcessing(true);
      toast({
        title: "Processing Started",
        description: "Eye tracking processing has begun",
      });
    } catch (error) {
      console.error('Error starting processing:', error);
      toast({
        title: "Error",
        description: "Failed to start processing",
        variant: "destructive",
      });
    }
  };

  const stopProcessing = async () => {
    try {
      console.log('Stopping processing...');
      await eyeTrackingApi.stopTracking();
      setIsProcessing(false);
      setCurrentFrame(null);
      toast({
        title: "Processing Stopped",
        description: "Eye tracking processing has stopped",
      });
    } catch (error) {
      console.error('Error stopping processing:', error);
      toast({
        title: "Error",
        description: "Failed to stop processing",
        variant: "destructive",
      });
    }
  };

  const fetchFrame = async () => {
    if (!isProcessing) return;
    try {
      console.log('Fetching frame...');
      const frameUrl = await eyeTrackingApi.getFrame();
      console.log('Frame received:', frameUrl);
      setCurrentFrame(frameUrl);
    } catch (error) {
      console.error('Error fetching frame:', error);
    }
  };

  const fetchStatus = async () => {
    if (!isProcessing) return;
    try {
      console.log('Fetching status...');
      const statusData = await eyeTrackingApi.getStatus();
      console.log('Status received:', statusData);
      setStatus(statusData);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const fetchRawData = async () => {
    if (!isProcessing) return;
    try {
      console.log('Fetching raw data...');
      const rawData = await eyeTrackingApi.getRawData();
      console.log('Raw data received:', rawData);
      setRawData(rawData);
    } catch (error) {
      console.error('Error fetching raw data:', error);
    }
  };

  const startCalibration = async () => {
    try {
      console.log('Starting calibration...');
      await eyeTrackingApi.startCalibration();
      toast({
        title: "Calibration Started",
        description: "Eye tracking calibration has begun",
      });
    } catch (error) {
      console.error('Error starting calibration:', error);
      toast({
        title: "Error",
        description: "Failed to start calibration",
        variant: "destructive",
      });
    }
  };

  const resetCalibration = async () => {
    try {
      console.log('Resetting calibration...');
      await eyeTrackingApi.resetCalibration();
      toast({
        title: "Calibration Reset",
        description: "Eye tracking calibration has been reset",
      });
    } catch (error) {
      console.error('Error resetting calibration:', error);
      toast({
        title: "Error",
        description: "Failed to reset calibration",
        variant: "destructive",
      });
    }
  };

  const fetchSettings = async () => {
    try {
      console.log('Fetching settings...');
      const settings = await eyeTrackingApi.getSettings();
      console.log('Settings received:', settings);
      toast({
        title: "Settings Retrieved",
        description: <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(settings, null, 2)}</code>
        </pre>
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive",
      });
    }
  };

  const updateSettings = async () => {
    try {
      console.log('Updating settings...');
      const newSettings = {
        sensitivity: 0.8,
        threshold: 50
      };
      await eyeTrackingApi.updateSettings(newSettings);
      toast({
        title: "Settings Updated",
        description: "Eye tracking settings have been updated",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const shutdown = async () => {
    try {
      console.log('Shutting down...');
      await eyeTrackingApi.shutdown();
      toast({
        title: "Shutdown Initiated",
        description: "System shutdown has been initiated",
      });
    } catch (error) {
      console.error('Error during shutdown:', error);
      toast({
        title: "Error",
        description: "Failed to shutdown system",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isProcessing) {
      const frameInterval = setInterval(fetchFrame, 1000);
      const statusInterval = setInterval(fetchStatus, 2000);
      const rawDataInterval = setInterval(fetchRawData, 1000);

      return () => {
        clearInterval(frameInterval);
        clearInterval(statusInterval);
        clearInterval(rawDataInterval);
      };
    }
  }, [isProcessing]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">API Endpoint Tester</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={startProcessing}
                disabled={isProcessing}
                className="w-full"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Processing
              </Button>
              <Button
                onClick={stopProcessing}
                disabled={!isProcessing}
                variant="destructive"
                className="w-full"
              >
                <CircleStop className="mr-2 h-4 w-4" />
                Stop Processing
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={startCalibration} variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Start Calibration
              </Button>
              <Button onClick={resetCalibration} variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Reset Calibration
              </Button>
              <Button onClick={fetchSettings} variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Get Settings
              </Button>
              <Button onClick={updateSettings} variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Update Settings
              </Button>
              <Button onClick={shutdown} variant="destructive" className="col-span-2">
                <PowerOff className="mr-2 h-4 w-4" />
                Shutdown System
              </Button>
            </div>

            <Alert>
              <Eye className="h-4 w-4" />
              <AlertTitle>Processing Status</AlertTitle>
              <AlertDescription>
                {isProcessing ? "Active - Fetching frames and data" : "Inactive"}
              </AlertDescription>
            </Alert>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-2">Current Frame</h2>
          {currentFrame ? (
            <img 
              src={currentFrame} 
              alt="Current frame" 
              className="w-full rounded-lg"
            />
          ) : (
            <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              No frame available
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-2">Status Data</h2>
          <pre className="bg-gray-50 p-2 rounded text-sm overflow-auto max-h-48">
            {status ? JSON.stringify(status, null, 2) : 'No status data'}
          </pre>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-2">Raw Data</h2>
          <pre className="bg-gray-50 p-2 rounded text-sm overflow-auto max-h-48">
            {rawData ? JSON.stringify(rawData, null, 2) : 'No raw data'}
          </pre>
        </Card>
      </div>
    </div>
  );
};
