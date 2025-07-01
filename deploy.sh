#!/bin/bash

# Exit on any error
set -e

GITHUB_REPOSITORY=${GITHUB_REPOSITORY:-your-username/resume-editor}

echo "Deploying latest images from: $GITHUB_REPOSITORY"

# Export environment variables for docker-compose
export GITHUB_REPOSITORY=$GITHUB_REPOSITORY

# Change to the project directory
cd ResumeFlow

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Login to GitHub Container Registry
echo "Logging in to GitHub Container Registry..."
echo "$GITHUB_TOKEN" | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin

# Pull latest images
echo "Pulling latest images..."
docker-compose pull

# Restart containers
echo "Restarting containers..."
docker-compose down
docker-compose up -d

echo "Deployment completed successfully!" 