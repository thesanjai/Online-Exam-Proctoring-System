import cv2
import mediapipe as mp
import numpy as np
import base64
from fastapi import FastAPI, UploadFile, File, WebSocket, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime
import os
import argparse
import asyncio
import threading
import queue
from pathlib import Path
from contextlib import asynccontextmanager

mp_face_detection = mp.solutions.face_detection
face_detection = mp_face_detection.FaceDetection(
    model_selection=1, 
    min_detection_confidence=0.2  
)

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=2,
    min_detection_confidence=0.2,
    min_tracking_confidence=0.2
)

camera = None
frame_queue = queue.Queue()
stop_event = threading.Event()
suspicious_detected = False
suspicious_start_time = None

class FaceDetectionResponse(BaseModel):
    face_count: int
    suspicious: bool
    faces: List[dict]
    annotated_image_base64: Optional[str] = None
    timestamp: str
    suspicious_duration: Optional[float] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    threading.Thread(target=camera_thread, daemon=True).start()
    yield
    stop_event.set()
    if camera is not None:
        camera.release()

app = FastAPI(title="AI Proctoring System", lifespan=lifespan)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def process_frame(frame):
    global suspicious_detected, suspicious_start_time
    
    ih, iw, _ = frame.shape
    
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    detection_results = face_detection.process(rgb_frame)
    mesh_results = face_mesh.process(rgb_frame)
    

    annotated_frame = frame.copy()
    faces = []
    
    if detection_results.detections:
        for detection in detection_results.detections:
            bboxC = detection.location_data.relative_bounding_box
            x, y, w, h = int(bboxC.xmin * iw), int(bboxC.ymin * ih), \
                         int(bboxC.width * iw), int(bboxC.height * ih)
            
            x = max(0, x)
            y = max(0, y)
            w = min(iw - x, w)
            h = min(ih - y, h)
            
            confidence = detection.score[0]
            faces.append({
                "box": [x, y, w, h],
                "confidence": float(confidence),
                "type": "full" 
            })
    
    if mesh_results.multi_face_landmarks:
        for face_landmarks in mesh_results.multi_face_landmarks:
            x_min = iw
            y_min = ih
            x_max = 0
            y_max = 0
            
            for landmark in face_landmarks.landmark:
                x, y = int(landmark.x * iw), int(landmark.y * ih)
                x_min = min(x_min, x)
                y_min = min(y_min, y)
                x_max = max(x_max, x)
                y_max = max(y_max, y)
            
            is_new_face = True
            for face in faces:
                fx, fy, fw, fh = face["box"]
                if (abs(x_min - fx) < 50 and abs(y_min - fy) < 50):
                    is_new_face = False
                    break
            
            if is_new_face:
                visible_landmarks = sum(1 for landmark in face_landmarks.landmark 
                                     if 0 <= landmark.x <= 1 and 0 <= landmark.y <= 1)
                confidence = visible_landmarks / len(face_landmarks.landmark)
                
                if confidence > 0.2: 
                    faces.append({
                        "box": [x_min, y_min, x_max - x_min, y_max - y_min],
                        "confidence": float(confidence),
                        "type": "partial"
                    })
    
    for face in faces:
        x, y, w, h = face["box"]
        confidence = face["confidence"]
        
        color = (0, 255, 0) if len(faces) == 1 else (0, 0, 255)
        cv2.rectangle(annotated_frame, (x, y), (x + w, y + h), color, 2)
        
        label = f'{confidence:.2f} ({face["type"]})'
        cv2.putText(annotated_frame, label, (x, y - 10),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
    
    if len(faces) > 1 or (len(faces) == 1 and faces[0]["confidence"] < 0.3):
        if not suspicious_detected:
            suspicious_detected = True
            suspicious_start_time = datetime.now()
            save_suspicious_frame(annotated_frame)
    else:
        suspicious_detected = False
        suspicious_start_time = None
    
    return faces, annotated_frame

def save_suspicious_frame(frame):
    os.makedirs("screenshots", exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"screenshots/suspicious_{timestamp}.jpg"
    
    # Save the frame
    cv2.imwrite(filename, frame)
    
    # Log the event
    log_suspicious_event(timestamp, filename)

def log_suspicious_event(timestamp, filename):
    log_entry = {
        "timestamp": timestamp,
        "screenshot": filename,
        "type": "suspicious_activity"
    }
    
    os.makedirs("logs", exist_ok=True)
    
    
    with open("logs/suspicious_events.log", "a") as f:
        f.write(json.dumps(log_entry) + "\n")

def encode_image_to_base64(frame):
    _, buffer = cv2.imencode('.jpg', frame)
    return base64.b64encode(buffer).decode('utf-8')

def camera_thread():
    global camera
    camera = cv2.VideoCapture(0)
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    camera.set(cv2.CAP_PROP_FPS, 30)
    camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)  
    
    while not stop_event.is_set():
        ret, frame = camera.read()
        if ret:
            frame_queue.put(frame)
        else:
            break
    
    camera.release()

@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/detect", response_model=FaceDetectionResponse)
async def detect_faces(file: UploadFile = File(...)):

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    faces, annotated_frame = process_frame(frame)
    
    suspicious_duration = None
    if suspicious_start_time is not None:
        suspicious_duration = (datetime.now() - suspicious_start_time).total_seconds()
    
    response = FaceDetectionResponse(
        face_count=len(faces),
        suspicious=len(faces) > 1 or (len(faces) == 1 and faces[0]["confidence"] < 0.3),
        faces=faces,
        annotated_image_base64=encode_image_to_base64(annotated_frame),
        timestamp=datetime.now().isoformat(),
        suspicious_duration=suspicious_duration
    )
    
    return response

@app.get("/video_feed")
async def video_feed():
    async def generate():
        while True:
            try:
                frame = frame_queue.get(timeout=1)
                faces, processed_frame = process_frame(frame)
                
                _, buffer = cv2.imencode('.jpg', processed_frame)
                frame_bytes = buffer.tobytes()
                
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                
            except queue.Empty:
                continue
            except Exception as e:
                print(f"Error in video feed: {e}")
                break
    
    return StreamingResponse(
        generate(),
        media_type='multipart/x-mixed-replace; boundary=frame'
    )

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            try:
                frame = frame_queue.get(timeout=1)
                faces, processed_frame = process_frame(frame)
                
                # Calculate suspicious duration if applicable
                suspicious_duration = None
                if suspicious_start_time is not None:
                    suspicious_duration = (datetime.now() - suspicious_start_time).total_seconds()
                
                # Send detection results
                await websocket.send_json({
                    "face_count": len(faces),
                    "suspicious": len(faces) > 1 or (len(faces) == 1 and faces[0]["confidence"] < 0.3),
                    "faces": faces,
                    "annotated_image_base64": encode_image_to_base64(processed_frame),
                    "timestamp": datetime.now().isoformat(),
                    "suspicious_duration": suspicious_duration
                })
                
            except queue.Empty:
                continue
            except Exception as e:
                print(f"Error in websocket: {e}")
                break
    finally:
        await websocket.close()

def parse_args():
    parser = argparse.ArgumentParser(description='AI Proctoring System')
    parser.add_argument('--port', type=int, default=8000,
                      help='Port to run the server on (default: 8000)')
    parser.add_argument('--host', type=str, default='0.0.0.0',
                      help='Host to run the server on (default: 0.0.0.0)')
    return parser.parse_args()

if __name__ == "__main__":
    import uvicorn
    
    args = parse_args()
    port = int(os.getenv('PORT', args.port))
    host = os.getenv('HOST', args.host)
    
    print(f"Starting server on {host}:{port}")
    uvicorn.run(app, host=host, port=port, ws_ping_interval=20, ws_ping_timeout=20) 