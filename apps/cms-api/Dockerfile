# syntax=docker/dockerfile:1.7
# Build the Rust CMS API binary for the Cloudflare Containers (lite) runtime.
# The lite instance has only 256 MB of memory and 0.0625 vCPU, so the release
# binary must be small. `cargo build --release --locked` enforces the lockfile
# so we don't accidentally bump a transitive dep during a build.
#
# Pinned to 1.88 because the latest transitive deps of `image 0.25`
# (`image@0.25.10`, `time@0.3.55`, `time-core@0.1.9`) all require rustc
# 1.88.0; older tags (1.83, 1.85) fail the manifest parse or the
# minimum-rustc-version check at build time. The host toolchain file
# (`rust-toolchain.toml`) is `stable`, which already resolves to 1.88+
# locally, so this tag matches the developer environment.
FROM rust:1.88-bookworm AS builder
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