# 1. Base Image
FROM node:18-alpine AS base

# 2. Set working directory
WORKDIR /app

# 3. Install pnpm
RUN npm install -g pnpm

# 4. Copy dependency files
COPY package.json pnpm-lock.yaml ./

# 5. Install dependencies
RUN pnpm install --frozen-lockfile

# 6. Copy all other files
COPY . .

# 7. Build the application
RUN pnpm build

# 8. Production Image
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=base /app/package.json /app/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
