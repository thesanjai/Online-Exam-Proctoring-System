import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Check, Camera, X } from "lucide-react";
import { toast } from "sonner";

type DetectionResponse = {
  num_faces: number;
  multiple_people: boolean;
  cheating_detected: boolean;
  cheating_duration: number;
  annotated_frame?: string;
  timestamp?: string;
};

type StatusType = "good" | "warning" | "error" | "idle" | "noFace";
type PermissionState = "prompt" | "granted" | "denied" | "checking";

const API_URL = "http://localhost:8000/detect"; // Adjust if backend differs

const STATUS_MESSAGES: Record<StatusType, string> = {
  good: "Only one face detected",
  warning: "Multiple faces detected! Warning!",
  error: "Error: Could not process frame.",
  idle: "Loading camera...",
  noFace: "No face detected", // Added new status message
};

const STATUS_COLORS: Record<StatusType, string> = {
  good: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  error: "bg-red-100 text-red-800",
  idle: "bg-gray-100 text-gray-700",
  noFace: "bg-blue-100 text-blue-800", // Added new status color
};

export default function FaceDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<StatusType>("idle");
  const [numFaces, setNumFaces] = useState<number | null>(null);
  const [loadingCamera, setLoadingCamera] = useState(true);
  const [cameraPermission, setCameraPermission] = useState<PermissionState>("checking");
  
  // Check and request camera permission
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Check if the browser supports permissions API
        if (navigator.permissions && navigator.permissions.query) {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
          
          setCameraPermission(permissionStatus.state as PermissionState);
          
          permissionStatus.onchange = () => {
            setCameraPermission(permissionStatus.state as PermissionState);
          };
        } else {
          // Fallback for browsers that don't support permissions API
          setCameraPermission("prompt");
        }
      } catch (error) {
        console.error("Error checking camera permission:", error);
        setCameraPermission("prompt");
      }
    };
    
    checkPermission();
  }, []);

  // Open webcam when permission is granted
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const getCamera = async () => {
      if (cameraPermission !== "granted" && cameraPermission !== "prompt") {
        return;
      }
      
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          }, 
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraPermission("granted");
        }
        
        setLoadingCamera(false);
        toast.success("Camera connected successfully");
      } catch (e) {
        console.error("Camera access error:", e);
        setCameraPermission("denied");
        setStatus("error");
        setLoadingCamera(false);
        toast.error("Could not access camera. Please check permissions.");
      }
    };
    
    if (cameraPermission === "granted" || cameraPermission === "prompt") {
      getCamera();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraPermission]);

  // Request camera permission manually
  const requestCameraAccess = () => {
    setCameraPermission("prompt");
    toast.info("Requesting camera access...");
  };

  // Detection loop
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const sendFrame = async () => {
      if (!videoRef.current || cameraPermission !== "granted") return;
      const video = videoRef.current;

      if (video.readyState < 2) {
        // Wait for video to load
        setTimeout(sendFrame, 200);
        return;
      }

      try {
        // Draw video frame to canvas
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context not available");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to a Blob
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85)
        );

        if (!blob) throw new Error("Could not create image blob");

        const formData = new FormData();
        formData.append("file", blob, "frame.jpg");

        const resp = await fetch(API_URL, {
          method: "POST",
          body: formData,
        });

        if (!resp.ok) throw new Error(`API error ${resp.status}`);

        const data: DetectionResponse = await resp.json();
        setNumFaces(data.num_faces);

        if (data.num_faces === 1) {
          setStatus("good");
        } else if (data.num_faces > 1) {
          setStatus("warning");
        } else if (data.num_faces === 0) { // Handle no face detected
          setStatus("noFace");
        } else {
          setStatus("idle");
        }
      } catch (err) {
        console.error("Frame processing error:", err);
        setStatus("error");
      }
    };

    if (!loadingCamera && status !== "error" && cameraPermission === "granted") {
      sendFrame();
      interval = setInterval(sendFrame, 1000); // 1 frame per sec
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadingCamera, status, cameraPermission]);

  return (
    <Card className="mx-auto w-full max-w-lg p-0 shadow-xl">
      <div className="relative">
        {cameraPermission === "granted" ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            width={640}
            height={480}
            className="block w-full rounded-t-lg bg-black aspect-video"
            style={{ objectFit: "cover" }}
            aria-label="Webcam video stream"
          />
        ) : (
          <div className="w-full rounded-t-lg bg-gray-900 aspect-video flex items-center justify-center">
            {cameraPermission === "denied" ? (
              <div className="text-center p-4">
                <X size={48} className="mx-auto mb-2 text-red-500" />
                <h3 className="text-white text-xl mb-2">Camera Access Denied</h3>
                <p className="text-gray-300 mb-4">Please allow camera access in your browser settings to use this application.</p>
                <button
                  onClick={requestCameraAccess}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="text-center p-4">
                <Camera size={48} className="mx-auto mb-2 text-blue-500" />
                <h3 className="text-white text-xl mb-2">Camera Access Required</h3>
                <p className="text-gray-300 mb-4">This app needs access to your camera to detect faces.</p>
                <button
                  onClick={requestCameraAccess}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Allow Camera Access
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* STATUS BAR */}
        <div
          className={`absolute top-0 left-0 right-0 flex items-center gap-2 px-4 py-2 ${STATUS_COLORS[status]} transition-colors duration-300 rounded-t-lg z-10 bg-opacity-75`}
          style={{ minHeight: 52 }}
        >
          {status === "good" && <Check size={28} className="text-green-500" />}
          {status === "warning" && <AlertTriangle size={28} className="text-amber-500" />}
          {status === "error" && <AlertTriangle size={28} className="text-red-500" />}
          {status === "idle" && <span className="loader h-4 w-4 rounded-full bg-gray-300 animate-pulse inline-block"></span>}
          {status === "noFace" && <AlertTriangle size={28} className="text-blue-500" />}

          <div className="flex flex-col">
            <div className="font-semibold text-base">
              {STATUS_MESSAGES[status]}
            </div>
            <div className="text-sm text-gray-500">
              Number of faces:{" "}
              {numFaces !== null && status !== "idle" ? (
                <span>{numFaces}</span>
              ) : (
                <span>...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
