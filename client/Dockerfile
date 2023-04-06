
# Install development only when needed
FROM node:18-alpine AS development
RUN apk add --no-cache libc6-compat
WORKDIR /nextapp
COPY nextapp/package*.json ./
RUN npm install --legacy-peer-deps
CMD [ "npm", "run", "dev"]


# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /nextapp
COPY --from=development /nextapp/node_modules ./node_modules
COPY --from=development /nextapp/package*.json ./

COPY nextapp .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build


# Production image, copy all the files and run next
FROM node:18-alpine AS prod
WORKDIR /nextapp

ENV NODE_ENV production

ENV NEXT_TELEMETRY_DISABLED 1

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder /nextapp/next.config.js ./
COPY --from=builder /nextapp/next-i18next.config.js ./
COPY --from=builder /nextapp/public ./public
COPY --from=builder /nextapp/pages ./pages
COPY --from=builder /nextapp/.next ./.next
COPY --from=builder /nextapp/node_modules ./node_modules
COPY --from=builder /nextapp/package.json ./package.json

COPY nextapp/docker-entrypoint.sh .
COPY nextapp/.env.production .

RUN apk add --no-cache --upgrade bash
RUN ["chmod", "+x", "docker-entrypoint.sh"]

ENTRYPOINT ["./docker-entrypoint.sh"]


EXPOSE 3000

ENV PORT 3000


CMD ["node_modules/.bin/next", "start"]
