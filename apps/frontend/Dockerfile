FROM node:18-alpine as builder

WORKDIR /app

# Copy package.json files and install dependencies
COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./
COPY libs/shared-utils/package.json ./libs/shared-utils/
COPY libs/shared-models/package.json ./libs/shared-models/
COPY apps/frontend/package.json ./apps/frontend/

RUN npm ci

# Copy the source code
COPY libs ./libs
COPY apps/frontend ./apps/frontend

# Build the application
RUN npx nx build frontend

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist/apps/frontend ./
COPY --from=builder /app/dist/apps/frontend/.next ./.next
COPY --from=builder /app/dist/apps/frontend/public ./public
COPY --from=builder /app/dist/apps/frontend/node_modules ./node_modules
COPY --from=builder /app/dist/apps/frontend/package.json ./package.json

# Expose the port
EXPOSE 3000

# Start the application in production mode
CMD ["npm", "start"]
