FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY apps/club-backoffice-api/package.json ./apps/club-backoffice-api/
COPY packages/shared/package.json ./packages/shared/

RUN npm install --workspace=apps/club-backoffice-api --workspace=packages/shared

COPY packages/shared ./packages/shared
COPY apps/club-backoffice-api ./apps/club-backoffice-api

WORKDIR /app/packages/shared
RUN npm run build

WORKDIR /app/apps/club-backoffice-api
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
