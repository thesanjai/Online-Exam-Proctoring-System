from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from screeninfo import get_monitors, ScreenInfoError
from typing import Dict
from pydantic import BaseModel
import os

class ScreenResponse(BaseModel):
    screen_count: int
    warning: str | None = None

app = FastAPI(
    title="Screen Detector API",
    description="API to detect the number of connected screens and provide warnings",
    version="1.0.0"
)

#to enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/screen-count", response_model=ScreenResponse)
async def get_screen_count() -> ScreenResponse:
    """
    Returns the total number of screens currently connected to the system.
    If multiple screens are detected, includes a warning message.
    If running in a container, uses SCREEN_COUNT environment variable if set.
    """
    try:
        env_screen_count = os.getenv('SCREEN_COUNT')
        if env_screen_count is not None:
            screen_count = int(env_screen_count)
        else:
            monitors = get_monitors()
            screen_count = len(monitors)

        response = ScreenResponse(
            screen_count=screen_count,
            warning="Please disconnect additional monitors before starting the interview" if screen_count > 1 else None
        )
    except (ScreenInfoError, ValueError):
        response = ScreenResponse(
            screen_count=1,
            warning=None
        )

    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
