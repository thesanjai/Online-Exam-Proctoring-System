
import React, { useRef, useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { eyeTrackingApi } from '@/services/eyeTrackingApi';

interface WebcamFeedProps {
  onStreamReady?: (stream: MediaStream) => void;
  isTracking: boolean;
}

export const WebcamFeed: React.FC<WebcamFeedProps> = ({ onStreamReady, isTracking }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          onStreamReady?.(stream);
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    };

    startWebcam();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [onStreamReady]);

  useEffect(() => {
    if (!isTracking) {
      setFrameUrl(null);
      setFetchError(null);
      return;
    }

    let isMounted = true;
    const fetchFrameInterval = setInterval(async () => {
      if (!isTracking) return;
      
      try {
        const frameData = await eyeTrackingApi.getFrame();
        if (isMounted) {
          setFrameUrl(frameData);
          setFetchError(null);
        }
      } catch (error) {
        console.error('Error fetching frame:', error);
        if (isMounted) {
          setFetchError("Failed to fetch frame. Ensure tracking is started.");
        }
      }
    }, 500);
    
    return () => {
      isMounted = false;
      clearInterval(fetchFrameInterval);
    };
  }, [isTracking]);

  return (
    <Card className="relative overflow-hidden">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover rounded-lg"
        />
        {frameUrl && (
          <img 
            src={frameUrl}
            alt="Processed frame"
            className="absolute top-0 left-0 w-full h-full object-cover rounded-lg opacity-50"
          />
        )}
      </div>
      <div className="absolute top-4 right-4">
        <Camera className={`h-6 w-6 ${isTracking ? "text-green-500" : "text-white"}`} />
      </div>
      {fetchError && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white p-2 rounded opacity-80">
          {fetchError}
        </div>
      )}
      {!isTracking && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white">
          <p className="text-center px-4">Click "Start Tracking" to enable eye movement detection</p>
        </div>
      )}
    </Card>
  );
};
