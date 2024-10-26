# Dockerfile
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml nest-cli.json ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies using pnpm (including devDependencies)
# Remove --production=false since we want all dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN NODE_ENV=development pnpm run build

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["pnpm", "run", "start:prod"]
