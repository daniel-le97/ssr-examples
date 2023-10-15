# Stage 1: Build the application
FROM oven/bun as builder

WORKDIR /app

# Copy the entire project into the image
COPY . .

# Install dependencies and build the application
RUN bun install && bun run build

# Stage 2: Create the production image
FROM oven/bun

WORKDIR /app

# Copy only the built artifacts and necessary files from the builder stage
COPY --from=builder /app /app

# Set the NODE_ENV to production
ENV PORT 3000
ENV NODE_ENV production

# Define the command to start your application
CMD ["bun", "run", "serve"]

