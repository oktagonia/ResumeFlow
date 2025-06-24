FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV AUTH_TRUST_HOST=true
ENV NEXTAUTH_URL=http://localhost:3000

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
