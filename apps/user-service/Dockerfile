FROM node:18-alpine as builder

WORKDIR /app

# Copy package.json files and install dependencies
COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./
COPY libs/shared-utils/package.json ./libs/shared-utils/
COPY libs/shared-models/package.json ./libs/shared-models/
COPY apps/user-service/package.json ./apps/user-service/

RUN npm ci

# Copy the source code
COPY libs ./libs
COPY apps/user-service ./apps/user-service

# Build the application
RUN npx nx build user-service

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist/apps/user-service ./

# Install production dependencies only
RUN npm ci --only=production

# Expose the port
EXPOSE 3333

# Start the application
CMD ["node", "main.js"]
