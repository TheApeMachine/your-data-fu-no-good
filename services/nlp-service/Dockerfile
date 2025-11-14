FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app.py .

# Expose port
EXPOSE 8001

# Run the service with increased timeouts and connection limits
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001", "--timeout-keep-alive", "75", "--limit-concurrency", "20"]

