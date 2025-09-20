# Use Node.js 22 (compatible with config@^4 which requires >=20)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies (include dev deps for dev workflow)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
 && adduser -S nodejs -u 1001 \
 && chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3030

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["yarn", "start"]
