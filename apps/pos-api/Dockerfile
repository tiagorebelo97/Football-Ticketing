FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY apps/pos-api/package.json ./apps/pos-api/
COPY packages/shared/package.json ./packages/shared/
RUN npm install --workspace=apps/pos-api --workspace=packages/shared
COPY packages/shared ./packages/shared
COPY apps/pos-api ./apps/pos-api
WORKDIR /app/packages/shared
RUN npm run build
WORKDIR /app/apps/pos-api
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
