FROM node:20-alpine as build

WORKDIR /app

COPY apps/super-admin-dashboard/package.json ./
RUN npm install --legacy-peer-deps

COPY apps/super-admin-dashboard ./
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY apps/super-admin-dashboard/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
