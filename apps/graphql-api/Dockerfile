FROM node:18-alpine as builder

WORKDIR /app

# Copy package.json files and install dependencies
COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./
COPY libs/shared-utils/package.json ./libs/shared-utils/
COPY libs/shared-models/package.json ./libs/shared-models/
COPY apps/graphql-api/package.json ./apps/graphql-api/

RUN npm ci

# Copy the source code
COPY libs ./libs
COPY apps/graphql-api ./apps/graphql-api

# Build the application
RUN npx nx build graphql-api

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist/apps/graphql-api ./

# Install production dependencies only
RUN npm ci --only=production

# Expose the port
EXPOSE 4000

# Start the application
CMD ["node", "main.js"]
