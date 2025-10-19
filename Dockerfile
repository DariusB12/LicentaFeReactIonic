FROM node:18.19.1

WORKDIR /app

COPY ./package*.json ./

COPY ./capacitor.config.json ./
COPY ./capacitor.config.ts ./
COPY ./cypress.config.ts ./
COPY ./eslint.config.js ./
COPY ./index.html ./
COPY ./ionic.config.json ./
COPY ./tsconfig.json ./
COPY ./tsconfig.node.json ./
COPY /vite.config.ts ./

RUN npm install

COPY ./src ./src
COPY ./public ./

EXPOSE 5173

CMD ["npm", "run","dev", "--", "--host", "0.0.0.0"]