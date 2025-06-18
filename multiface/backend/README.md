# AI Proctoring System

A real-time face detection system for proctoring online exams, built with FastAPI and MediaPipe. The system can detect multiple faces, including partially visible and side-facing faces, to prevent cheating during online exams.

## Features

- Real-time face detection with high accuracy
- Detection of partially visible faces (as little as 20% visibility)
- Side-facing face detection
- Multiple face detection
- Automatic suspicious activity detection
- Screenshot capture of suspicious events
- WebSocket support for real-time monitoring
- Detailed face detection statistics
- Confidence scoring for each detection
- Optimized for M1 Mac performance

## Requirements

- Python 3.11+
- OpenCV
- MediaPipe
- FastAPI
- WebSocket support
- Camera access

## Installation

### Local Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-proctoring-system
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Docker Installation

1. Build the Docker image:
```bash
docker build -t ai-proctoring-system .
```

2. Run the container:
```bash
docker run -p 8000:8000 -v $(pwd)/screenshots:/app/screenshots -v $(pwd)/logs:/app/logs ai-proctoring-system
```

## Usage

1. Start the server:
```bash
python main.py
```

2. Open your browser and navigate to:
```
http://localhost:8000
```

3. The system will automatically:
   - Start the camera feed
   - Detect faces in real-time
   - Show detection statistics
   - Alert on suspicious activity
   - Save screenshots of suspicious events

## Detection Features

- **Full Face Detection**: Detects complete faces with high confidence
- **Partial Face Detection**: Can detect faces even when only 20% visible
- **Side-Facing Detection**: Identifies faces at various angles
- **Multiple Face Detection**: Alerts when more than one face is detected
- **Confidence Scoring**: Shows detection confidence for each face
- **Suspicious Activity Logging**: Automatically logs and captures suspicious events

## API Endpoints

- `GET /`: Main web interface
- `GET /video_feed`: Live video feed with face detection
- `POST /detect`: API endpoint for face detection
- `WS /ws`: WebSocket endpoint for real-time updates

## Response Format

```json
{
    "face_count": 2,
    "suspicious": true,
    "faces": [
        {
            "box": [x, y, width, height],
            "confidence": 0.95,
            "type": "full"
        },
        {
            "box": [x, y, width, height],
            "confidence": 0.35,
            "type": "partial"
        }
    ],
    "annotated_image_base64": "base64_encoded_image",
    "timestamp": "2024-03-14T12:00:00Z",
    "suspicious_duration": 5.2
}
```

## Performance Optimization

The system is optimized for:
- M1 Mac architecture
- Low latency face detection
- Efficient resource usage
- Real-time processing

## Troubleshooting

1. **Camera not working**:
   - Check camera permissions
   - Ensure no other application is using the camera
   - Try restarting the application

2. **Face detection issues**:
   - Ensure good lighting conditions
   - Check camera focus
   - Adjust camera angle if needed

3. **Connection problems**:
   - Check WebSocket connection status
   - Refresh the page if disconnected
   - Ensure proper network connectivity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 