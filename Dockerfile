FROM oven/bun:1.3.10-debian AS base

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN mkdir -p data/contents

EXPOSE 3010

CMD ["bun", "--bun", "next", "dev", "-p", "3010"]
