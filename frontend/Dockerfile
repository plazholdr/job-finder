FROM node:20-alpine

WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Start the application in development mode
CMD ["yarn", "dev"]
