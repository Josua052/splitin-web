#!/usr/bin/env sh
set -eu

uvicorn app:app --host 0.0.0.0 --port "${PORT:-10000}"
