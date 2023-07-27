FROM --platform=$TARGETPLATFORM node:20.5

ENV NODE_ENV=production
WORKDIR /app

COPY [ "build/src/", "package*.json", "/app/" ]
COPY static /app/static/

RUN npm ci

CMD [ "node", "index.js" ]