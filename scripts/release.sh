#!/bin/bash

set -e
docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
docker build -t $BACKEND_IMAGE_TAG --target prod-api ./server
docker push $BACKEND_IMAGE_TAG
docker build -t $FRONTEND_IMAGE_TAG --target prod ./client
docker push $FRONTEND_IMAGE_TAG
docker build -t $WORKER_IMAGE_TAG --target prod-worker ./server
docker push $WORKER_IMAGE_TAG
