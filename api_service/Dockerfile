FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

# Create data directory
RUN mkdir -p /app/data

# Copy data file if it exists (provided during scheduled builds)
# If not provided, the app will use existing data or mount from PVC
COPY data/ditto_insurance_data.csv /app/data/ditto_insurance_data.csv

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

