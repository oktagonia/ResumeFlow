#!/bin/bash

# Exit on any error
set -e

# Get the commit SHA from command line argument or use 'latest'
IMAGE_TAG=${1:-latest}
GITHUB_REPOSITORY=${GITHUB_REPOSITORY:-your-username/resume-editor}

echo "Deploying with image tag: $IMAGE_TAG"
echo "GitHub repository: $GITHUB_REPOSITORY"

# Export environment variables for docker-compose
export IMAGE_TAG=$IMAGE_TAG
export GITHUB_REPOSITORY=$GITHUB_REPOSITORY

# Change to the project directory
cd ResumeFlow

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Login to GitHub Container Registry
echo "Logging in to GitHub Container Registry..."
echo "$GITHUB_TOKEN" | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin

# Stop existing containers
echo "Stopping containers..."
docker-compose down

# Pull latest images (this will pull the latest available if not rebuilt)
echo "Pulling latest images..."
docker-compose pull || {
    echo "Warning: Some images might not exist yet, continuing with deployment..."
}

# Start containers
echo "Starting containers..."
docker-compose --env-file .env up -d

echo "Deployment completed successfully!" 