#!/bin/bash

set -e
echo "Building API"
docker build ./server --target prod-api

echo "Building worker"
docker build ./server --target prod-worker

echo "Building frontend"
docker build ./client --target prod
