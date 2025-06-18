
// Index.tsx - Home page showing live face detection

import FaceDetection from "@/components/FaceDetection";

const Index = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-indigo-100 p-4">
    <div className="space-y-8 w-full max-w-xl">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-indigo-900 drop-shadow">
          Live Multiple Face Detection Demo
        </h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          Place yourself in front of the camera. This app will detect faces in real time and warn you if multiple faces appear in the camera view.<br/><span className="text-xs">Powered by your FastAPI backend at <b>localhost:8000</b></span>
        </p>
      </div>
      <FaceDetection />
      <div className="text-center text-xs text-gray-400 mt-5">
        Your video stream never leaves your device except for detection. API results are shown live.
      </div>
    </div>
  </div>
);

export default Index;
