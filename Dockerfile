FROM node:26.13.0-bookworm-slim AS base
WORKDIR /app

FROM base AS development
COPY package.json package-lock.json ./
RUN npm ci
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
CMD ["npm", "run", "start:dev"]

FROM development AS build
RUN npm run build

FROM base AS runtime-dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --omit=optional && npm cache clean --force

FROM base AS production
ENV NODE_ENV=production
COPY --from=runtime-dependencies /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
