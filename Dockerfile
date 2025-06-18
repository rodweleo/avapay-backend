# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install dependencies (include devDependencies)
COPY package-lock.json package.json ./
RUN npm ci

# Copy application code
COPY . .

# Compile TypeScript
RUN npm run build

# Final stage for app image
FROM base

# Set production environment in final image
ENV NODE_ENV=production

# Copy production dependencies
COPY package-lock.json package.json ./
RUN npm ci --omit=dev

# Copy built app
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD [ "npm", "run", "start" ]
