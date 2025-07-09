FROM mambaorg/micromamba:1.5.7

# Evita interação e define ambiente
ENV MAMBA_DOCKERFILE_ACTIVATE=1
ENV DEBIAN_FRONTEND=noninteractive

# Cria env climada
RUN micromamba create -n climada -c conda-forge python=3.11 \
    fastapi uvicorn climada geopandas fiona

# Copia código
WORKDIR /app
COPY . .

# Ativa ambiente e inicia
CMD ["micromamba", "run", "-n", "climada", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
