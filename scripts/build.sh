#!/bin/bash

set -e
echo "Building backend"
docker build ./server

echo "Building frontend"
docker build ./client
