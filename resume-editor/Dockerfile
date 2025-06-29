FROM node:20-slim

WORKDIR /app

COPY package*.json ./
# Install dependencies; use npm install since no package-lock.json is present
RUN npm install

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV AUTH_TRUST_HOST=true
ARG NEXTAUTH_URL
ARG NEXT_PUBLIC_API_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
