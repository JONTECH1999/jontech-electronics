FROM node:22-alpine

WORKDIR /srv/kitflow

COPY package.json package-lock.json ./
COPY app/package.json app/package.json
COPY app/backend/package.json app/backend/package.json
COPY app/frontend/package.json app/frontend/package.json
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]
