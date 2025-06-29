FROM node:20-slim

WORKDIR /app

COPY package*.json ./
# Install all dependencies (using lockfile)
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV AUTH_TRUST_HOST=true
## Expect build args for production API URLs and require them
ARG NEXTAUTH_URL
ARG NEXT_PUBLIC_API_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN if [ -z "$NEXTAUTH_URL" ] || [ -z "$NEXT_PUBLIC_API_URL" ]; then \
    echo "Error: build args NEXTAUTH_URL and NEXT_PUBLIC_API_URL must be provided" >&2; \
    exit 1; \
  fi && npm run build

EXPOSE 3000

CMD ["npm", "start"]
