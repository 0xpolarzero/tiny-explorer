#!/bin/bash

# Parse command line arguments
CI_MODE=false
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --ci) CI_MODE=true ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
  shift
done

# Start services first
if [ "$CI_MODE" = true ]; then
  docker-compose -f docker-compose.cache.yml up -d &
else
  docker-compose -f docker-compose.cache.yml up &
fi

# Store the process ID of the background docker-compose up command
COMPOSE_PID=$!

# Define the health check endpoints
DRAGONFLY_HEALTH_CHECK_URL="http://localhost:6379/"

# Define the number of retries and delay between checks
RETRIES=100
DELAY=5

# Function to check Dragonfly health
check_dragonfly_health() {
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $DRAGONFLY_HEALTH_CHECK_URL)
  [ "$RESPONSE" -eq 200 ]
}

# Wait for Dragonfly to be healthy
echo "Waiting for Dragonfly to be healthy..."
for ((i=1; i<=$RETRIES; i++)); do
  DRAGONFLY_HEALTHY=false

  if check_dragonfly_health; then
    DRAGONFLY_HEALTHY=true
    echo "Dragonfly is healthy!"
  fi

  if [ "$DRAGONFLY_HEALTHY" = true ]; then
    echo "All services are healthy!"

    break
  else
    echo "Health check failed. Retrying in $DELAY seconds..."
    sleep $DELAY
  fi

  # If this is the last retry, print failure message and cleanup
  if [ "$i" -eq "$RETRIES" ]; then
    echo "Services did not become healthy after $RETRIES attempts. Exiting..."
    docker-compose down --volumes --remove-orphans
    exit 1
  fi
done

# Trap SIGINT (Ctrl+C) and SIGHUP (terminal close)
trap 'echo "Stopping containers..."; docker-compose -f docker-compose.cache.yml down --volumes --remove-orphans; exit' SIGINT SIGHUP

# Wait for docker-compose
wait $COMPOSE_PID