FROM node:22

WORKDIR /app

COPY  package*.json ./

RUN npm ci --only=production

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD [ "node", "api/index.js" ]