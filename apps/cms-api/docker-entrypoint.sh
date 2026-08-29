#!/usr/bin/env bash
set -euo pipefail
# Container entrypoint: log readiness, then exec the cms-api binary.
# All real work (R2 hydrate, write-back loop, graceful shutdown) is in the Rust process.
echo "[entrypoint] cms-api starting; CMS_API_DATA_DIR=${CMS_API_DATA_DIR:-/var/lib/cms/data}"
exec "$@"