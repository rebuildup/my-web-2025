FROM rust:1.89-bookworm

WORKDIR /app/apps/cms-api

COPY apps/cms-api/Cargo.toml apps/cms-api/Cargo.lock ./
COPY apps/cms-api/src ./src

RUN cargo build

EXPOSE 3001

CMD ["cargo", "run"]
