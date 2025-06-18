# Screen Detector API

A FastAPI-based application that detects the number of screens (monitors) connected to the system and provides warnings for multiple monitors.

## Setup

### Option 1: Local Setup
1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

### Option 2: Docker Setup
1. Build the Docker image:
```bash
docker-compose up --build
```

## Running the API

### Local Run
Start the server:
```bash
python main.py
```

### Docker Run
The container will automatically start the server when run.

The API will be available at `http://localhost:8001`

## API Endpoints

### GET /screen-count
Returns the total number of screens currently connected to the system and a warning message if multiple monitors are detected.

Example responses:

Single monitor:
```json
{
    "screen_count": 1,
    "warning": null
}
```

Multiple monitors:
```json
{
    "screen_count": 2,
    "warning": "Please disconnect additional monitors before starting the interview"
}
```

## API Documentation

Once the server is running, you can access:
- Interactive API documentation: `http://localhost:8001/docs`
- Alternative API documentation: `http://localhost:8001/redoc` 
