FROM node:18.19.1

WORKDIR /app

COPY ./licenta/frontend/package*.json ./

COPY ./licenta/frontend/capacitor.config.json ./
COPY ./licenta/frontend/capacitor.config.ts ./
COPY ./licenta/frontend/cypress.config.ts ./
COPY ./licenta/frontend/eslint.config.js ./
COPY ./licenta/frontend/index.html ./
COPY ./licenta/frontend/ionic.config.json ./
COPY ./licenta/frontend/tsconfig.json ./
COPY ./licenta/frontend/tsconfig.node.json ./
COPY ./licenta/frontend/vite.config.ts ./

RUN npm install

COPY ./licenta/frontend/src ./src
COPY ./licenta/frontend/public ./

EXPOSE 5173

CMD ["npm", "run","dev", "--", "--host", "0.0.0.0"]