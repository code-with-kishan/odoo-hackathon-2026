FROM node:20-bullseye

WORKDIR /usr/src/app

# Install Python and build deps for SciPy (optimizer) and system tools
RUN apt-get update \
  && apt-get install -y python3 python3-pip build-essential gfortran libatlas-base-dev --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Install Python libs for optimizer
RUN python3 -m pip install --upgrade pip setuptools wheel
RUN python3 -m pip install numpy scipy || true

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install node deps
RUN npm ci --legacy-peer-deps || npm install

# Copy rest of the app
COPY . .

# Generate Prisma client (if DATABASE_URL present at build time this helps)
RUN npx prisma generate || true

EXPOSE 3000

COPY ./docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

CMD ["/usr/local/bin/docker-entrypoint.sh"]
