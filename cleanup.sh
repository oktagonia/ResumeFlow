#!/bin/bash

# Simple Docker cleanup script
# Run this periodically to free up space

echo "$(date): Starting Docker cleanup..."

# Remove unused containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f

# Remove build cache
docker builder prune -a -f

echo "$(date): Docker cleanup completed" 