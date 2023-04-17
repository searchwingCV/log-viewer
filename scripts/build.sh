#!/bin/bash

set -e
echo "Building backend"
docker build ./server --target prod

echo "Building frontend"
docker build ./client --target prod
