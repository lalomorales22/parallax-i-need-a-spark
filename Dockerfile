# Parallax Spark - Docker Client Node
# This Dockerfile creates a compute node that joins a Parallax cluster
# Use for: Raspberry Pi, Linux machines, headless servers
# NOT for: Host with GUI (use native install)

FROM python:3.12-slim-bookworm

LABEL maintainer="Parallax Spark Team"
LABEL description="Distributed AI compute node for Parallax Spark"

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    build-essential \
    portaudio19-dev \
    ffmpeg \
    libasound2-dev \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Clone Parallax SDK
RUN git clone --depth 1 https://github.com/GradientHQ/parallax.git /app/parallax

# Install Parallax SDK
WORKDIR /app/parallax
RUN pip install --no-cache-dir -e '.' || pip install --no-cache-dir -e '.[cpu]' || true

# Install voice assistant dependencies
RUN pip install --no-cache-dir \
    SpeechRecognition \
    edge-tts \
    requests \
    zeroconf \
    psutil \
    huggingface-hub

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

WORKDIR /app

# Expose Parallax node port
EXPOSE 3000

# Default: join a Parallax cluster
# Override PARALLAX_HOST environment variable to specify host IP
ENV PARALLAX_HOST=localhost

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["join"]
