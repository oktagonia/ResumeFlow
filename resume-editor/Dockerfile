FROM node:20-alpine

# Install dependencies needed for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev) for build
RUN npm ci

# Copy source code
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV AUTH_TRUST_HOST=true
ENV NODE_ENV=production

# Build arguments
ARG NEXTAUTH_URL
ARG NEXT_PUBLIC_API_URL
ARG AUTH_SECRET

# Set runtime environment variables
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV AUTH_SECRET=$AUTH_SECRET

# Build the application
RUN npm run build

# Remove dev dependencies for smaller image
RUN npm prune --production

EXPOSE 3000

CMD ["npm", "start"]
