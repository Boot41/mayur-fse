FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directory for transcriptions
RUN mkdir -p transcriptions

# Download required model files
RUN python3 agent.py download-files

# Expose any necessary ports (adjust as needed)
EXPOSE 8080

# Command to run the application
CMD ["python3", "agent.py", "dev"]