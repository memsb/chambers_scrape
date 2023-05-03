FROM --platform=linux/amd64 node:16
WORKDIR /app

COPY package* /app
RUN npm ci

COPY . /app

ENTRYPOINT ["node"]

CMD ["scrape_firms.js"]