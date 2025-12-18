FROM node:20-alpine as build

WORKDIR /app

COPY apps/club-backoffice/package.json ./
RUN npm install

COPY apps/club-backoffice ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY apps/club-backoffice/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
