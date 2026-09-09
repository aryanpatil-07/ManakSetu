import time
from fastapi import Request, HTTPException, status
from starlette.middleware.cors import CORSMiddleware
from app.core.config import settings

# In-memory sliding window rate limiter
_request_counts: dict[str, list[float]] = {}

def check_rate_limit(request: Request) -> bool:
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    window_start = current_time - 60

    # Clean old requests
    if client_ip not in _request_counts:
        _request_counts[client_ip] = []
    
    _request_counts[client_ip] = [
        t for t in _request_counts[client_ip] if t > window_start
    ]

    if len(_request_counts[client_ip]) >= settings.RATE_LIMIT_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Try again in a minute."
        )

    _request_counts[client_ip].append(current_time)
    return True

def setup_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
