# Stage 1: Build Backend
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend .
RUN npx prisma generate
RUN npm run build

# Stage 2: Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Production Environment
FROM node:20-alpine
WORKDIR /app

# Install Nginx and PM2
RUN apk add --no-cache nginx gettext
RUN npm install -g pm2

# Copy Backend output
COPY --from=backend-build /app/backend/package*.json ./backend/
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/prisma ./backend/prisma

# Copy Frontend output
COPY --from=frontend-build /app/frontend/package*.json ./frontend/
COPY --from=frontend-build /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-build /app/frontend/.next ./frontend/.next
COPY --from=frontend-build /app/frontend/public ./frontend/public

# Copy deployment configurations
COPY ecosystem.config.js .
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY start.sh .

RUN chmod +x start.sh

# Start using the shell script
CMD ["/app/start.sh"]
