
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { eyeTrackingApi } from '@/services/eyeTrackingApi';

interface GazeData {
  x: number;
  y: number;
  timestamp: number;
}

export const useGazeMonitor = (isTracking: boolean) => {
  const { toast } = useToast();
  const lastGazeRef = useRef<GazeData | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  const checkGazeDuration = (gazeData: any) => {
    const currentTime = Date.now();
    
    if (!lastGazeRef.current) {
      lastGazeRef.current = {
        x: gazeData.x,
        y: gazeData.y,
        timestamp: currentTime
      };
      return;
    }

    // Check if gaze position has significantly changed
    const distance = Math.sqrt(
      Math.pow(gazeData.x - lastGazeRef.current.x, 2) +
      Math.pow(gazeData.y - lastGazeRef.current.y, 2)
    );

    if (distance < 50) { // Threshold for considering gaze "fixed"
      const duration = currentTime - lastGazeRef.current.timestamp;
      
      if (duration > 5000 && !warningTimeoutRef.current && !warningShownRef.current) { // 5 seconds
        warningShownRef.current = true;
        warningTimeoutRef.current = setTimeout(() => {
          toast({
            title: "Eye Strain Warning",
            description: "You've been looking at the same spot for too long. Consider looking away briefly.",
            variant: "destructive"
          });
          warningTimeoutRef.current = null;
        }, 100);
      }
    } else {
      // Reset tracking for new position
      lastGazeRef.current = {
        x: gazeData.x,
        y: gazeData.y,
        timestamp: currentTime
      };
      
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      warningShownRef.current = false;
    }
  };

  useEffect(() => {
    if (!isTracking) {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      lastGazeRef.current = null;
      warningShownRef.current = false;
    }
  }, [isTracking]);

  return { checkGazeDuration };
};
