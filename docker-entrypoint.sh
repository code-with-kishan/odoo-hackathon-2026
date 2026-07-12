#!/bin/sh
set -e

echo "Starting app entrypoint..."

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set. Please set it in docker-compose or environment." >&2
else
  echo "Waiting for database..."
  # simple wait loop
  n=0
  until nc -z db 5432 || [ $n -ge 20 ]; do
    n=$((n+1))
    echo "waiting for db... ($n)"
    sleep 1
  done

  echo "Pushing Prisma schema to database..."
  npx prisma db push --accept-data-loss || true
  echo "Generating Prisma client..."
  npx prisma generate || true
  echo "Running seed script..."
  npm run prisma:seed || true
fi

echo "Starting dev server"
npm run dev
