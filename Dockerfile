FROM node:20-slim

WORKDIR /app

# Install system dependencies for DuckDB
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 8787

# Run the application
CMD ["npm", "run", "start"]

