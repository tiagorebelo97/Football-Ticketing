FROM node:20-alpine as build

WORKDIR /app

COPY apps/pos-web/package.json ./
RUN npm install

COPY apps/pos-web ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY apps/pos-web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
