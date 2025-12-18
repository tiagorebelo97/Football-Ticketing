FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY apps/fan-api/package.json ./apps/fan-api/
COPY packages/shared/package.json ./packages/shared/

RUN npm install --workspace=apps/fan-api --workspace=packages/shared

COPY packages/shared ./packages/shared
COPY apps/fan-api ./apps/fan-api

WORKDIR /app/packages/shared
RUN npm run build

WORKDIR /app/apps/fan-api
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
