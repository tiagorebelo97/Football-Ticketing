FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY apps/super-admin-api/package.json ./apps/super-admin-api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm install --workspace=apps/super-admin-api --workspace=packages/shared

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/super-admin-api ./apps/super-admin-api

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Build API
WORKDIR /app/apps/super-admin-api
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
