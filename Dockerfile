FROM node:22 AS base

FROM base as build
WORKDIR /app
COPY . ./
RUN npm ci
RUN npm run build

FROM base
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
EXPOSE 6020
CMD ["node","dist/main"]