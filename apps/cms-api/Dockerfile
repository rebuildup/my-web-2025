# syntax=docker/dockerfile:1.7
# Build the Rust CMS API binary for the Cloudflare Containers (lite) runtime.
# The lite instance has only 256 MB of memory and 0.0625 vCPU, so the release
# binary must be small. `cargo build --release --locked` enforces the lockfile
# so we don't accidentally bump a transitive dep during a build.
#
# Pinned to 1.95 because the AWS SDK transitive deps (`aws-smithy-xml
# 0.62.0`, `aws-types 1.5.0`) require rustc 1.94.1+, and `crc-fast 1.10.0`
# + `font-types 0.12.2` require 1.89. Older tags (1.83/1.85/1.88) trip the
# minimum-rustc-version check at build time. The host toolchain file
# (`rust-toolchain.toml`) is `stable`, which already resolves to ≥ 1.95
# locally, so this tag matches the developer environment. When the
# Cargo.lock floors move again, bump this number in lockstep.
FROM rust:1.95-bookworm AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY assets ./assets
COPY src ./src
RUN cargo build --release --locked

FROM debian:bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/cms-api /usr/local/bin/cms-api
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
ENV CMS_API_DATA_DIR=/var/lib/cms/data
EXPOSE 3001
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["cms-api"]