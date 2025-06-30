# Deployment Guide

This guide explains how to deploy the Resume Editor application using GitHub Actions and GitHub Container Registry (GHCR).

## Prerequisites

1. **GitHub Repository**: Ensure your repository is set up with the necessary secrets
2. **EC2 Instance**: Running Ubuntu/Linux with Docker and Docker Compose installed
3. **GitHub Token**: For accessing GHCR images

## Required GitHub Secrets

Add the following secrets to your GitHub repository (Settings > Secrets and variables > Actions):

- `EC2_SSH_KEY`: Private SSH key for connecting to your EC2 instance
- `EC2_HOST`: Public IP or domain of your EC2 instance
- `GITHUB_TOKEN`: GitHub token with `read:packages` permission (automatically available)
- `NEXTAUTH_URL`: Your frontend URL (e.g., `https://yourdomain.com`)
- `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., `https://yourdomain.com:8000`)
- `AUTH_SECRET`: Secret key for NextAuth.js

## EC2 Instance Setup

### 1. Install Docker and Docker Compose

```bash
# Update package list
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. Clone Repository

```bash
git clone https://github.com/your-username/resume-editor.git ResumeFlow
cd ResumeFlow
```

### 3. Create Environment File

Create a `.env` file in the project root:

```bash
# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Backend API URL
API_URL=https://yourdomain.com:8000

# NextAuth secret
AUTH_SECRET=your-secret-key-here

# GitHub repository (for image names)
GITHUB_REPOSITORY=your-username/resume-editor
```

### 4. Set Up GitHub Token for Docker Login

The deployment script will automatically log in to GHCR using the provided GitHub token. Ensure your EC2 instance has access to pull images from your repository.

## Deployment Process

The deployment process works as follows:

1. **Build Phase**: GitHub Actions builds Docker images for both frontend and backend
2. **Push Phase**: Images are pushed to GitHub Container Registry with commit SHA tags
3. **Deploy Phase**: EC2 instance pulls the latest images and starts containers

### Manual Deployment

If you need to deploy manually:

```bash
# On your EC2 instance
cd ResumeFlow
export GITHUB_TOKEN=your-github-token
export GITHUB_ACTOR=your-github-username
export GITHUB_REPOSITORY=your-username/resume-editor
./deploy.sh <commit-sha>
```

## Image Naming Convention

Images are stored in GHCR with the following naming convention:
- Backend: `ghcr.io/your-username/resume-editor/backend:commit-sha`
- Frontend: `ghcr.io/your-username/resume-editor/frontend:commit-sha`

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure your GitHub token has `read:packages` permission
2. **Image Pull Failed**: Check that the EC2 instance can access GHCR
3. **Container Startup Issues**: Check logs with `docker-compose logs`

### Viewing Logs

```bash
# View all container logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
```

### Rolling Back

To roll back to a previous version:

```bash
# Deploy with a specific commit SHA
./deploy.sh <previous-commit-sha>
```

## Security Considerations

1. **GitHub Token**: Use a fine-grained personal access token with minimal permissions
2. **SSH Key**: Use a dedicated SSH key for deployment
3. **Environment Variables**: Never commit sensitive values to the repository
4. **Image Security**: Regularly update base images and dependencies 