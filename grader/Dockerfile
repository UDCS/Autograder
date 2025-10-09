# ---------- Stage 1: build nsjail ----------
FROM ubuntu:24.04 AS nsjail-build
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    git make pkg-config g++ clang \
    libcap2-bin libcap-dev libprotobuf-dev protobuf-compiler \
    libnl-3-dev libnl-route-3-dev libseccomp-dev \
    flex bison ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /tmp/nsjail
RUN git clone --depth=1 https://github.com/google/nsjail . \
 && make -j"$(nproc)" CC=clang CXX=clang++ \
 && strip nsjail

# ---------- Stage 2: runtime ----------
FROM ubuntu:24.04
ENV DEBIAN_FRONTEND=noninteractive

# Python runtime + nsjail runtime libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-venv python3-pip \
    ca-certificates curl \
    libprotobuf32 \
    libcap2 \
    libnl-route-3-200 \
    libseccomp2 \
    openjdk-17-jdk \        
    racket \               
 && rm -rf /var/lib/apt/lists/*

# Copy nsjail from builder
COPY --from=nsjail-build /tmp/nsjail/nsjail /usr/local/bin/nsjail

# Create a virtualenv to avoid PEP 668 "externally managed" errors
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"

# Upgrade pip and install deps into the venv
RUN python -m pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir 'psycopg[binary]==3.2.1'

# App files
WORKDIR /app
COPY grader.py /app/grader.py

# Non-root
RUN useradd -m runner
USER runner

# Default: sandbox on (set NSJAIL=0 to disable)
ENV NSJAIL=1

ENTRYPOINT ["python", "/app/grader.py"]