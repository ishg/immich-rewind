# Immich Rewind

Browse and clean up your [Immich](https://immich.app) photo library by day - see everything you've ever taken on a given month and day, across all years. Built for quickly culling duplicates and bad shots from the past

## Features

- Browse photos taken on any month/day across all years in your library
- Bulk select and move photos to the Immich trash
- Open any photo directly in Immich
- Video support
- Grouped by year, sorted newest first

## Quick start with Docker

```yaml
# docker-compose.yml
services:
  rewind:
    image: ghcr.io/ishg/immich-rewind:latest
    ports:
      - "3000:3000"
    environment:
      IMMICH_SERVER_URL: http://your-immich-host:2283
      IMMICH_API_KEY: your_api_key_here
    restart: unless-stopped
```

```bash
docker compose up -d
```

Then open [http://localhost:3000](http://localhost:3000).

## Getting an API key

In Immich: **Account Settings → API Keys → New API Key**.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `IMMICH_SERVER_URL` | Yes | Base URL of your Immich instance |
| `IMMICH_API_KEY` | Yes | Immich API key |

## Local development

```bash
# Install dependencies
npm install

# Create .env.local
echo "IMMICH_SERVER_URL=http://your-immich-host:2283" >> .env.local
echo "IMMICH_API_KEY=your_api_key_here" >> .env.local

# Start dev server
npm run dev
```

## Building from source

```bash
docker build -t immich-rewind .
docker run -p 3000:3000 \
  -e IMMICH_SERVER_URL=http://your-immich-host:2283 \
  -e IMMICH_API_KEY=your_api_key_here \
  immich-rewind
```
