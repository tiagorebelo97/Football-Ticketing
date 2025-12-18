FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY apps/entry-api/package.json ./apps/entry-api/
COPY packages/shared/package.json ./packages/shared/

RUN npm install --workspace=apps/entry-api --workspace=packages/shared

COPY packages/shared ./packages/shared
COPY apps/entry-api ./apps/entry-api

WORKDIR /app/packages/shared
RUN npm run build

WORKDIR /app/apps/entry-api
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
