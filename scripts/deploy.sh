#!/bin/bash

set -e
echo "Building app for environment $ENVIRONMENT"
docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
docker build -t $BACKEND_IMAGE_TAG --target prod-api ./server
docker push $BACKEND_IMAGE_TAG
docker build -t $FRONTEND_IMAGE_TAG --target prod ./client
docker push $FRONTEND_IMAGE_TAG
docker build -t $WORKER_IMAGE_TAG --target prod-worker ./server
docker push $WORKER_IMAGE_TAG
echo "Deploying Backend App $CAPROVER_BACKEND_APP on CapRover $CAPROVER_URL"
docker run caprover/cli-caprover:latest caprover deploy --caproverUrl $CAPROVER_URL --appToken $CAPROVER_BACKEND_APP_TOKEN --caproverApp $CAPROVER_BACKEND_APP --imageName $BACKEND_IMAGE_TAG
echo "Deploying Worker App $CAPROVER_BACKEND_APP on CapRover $CAPROVER_URL"
docker run caprover/cli-caprover:latest caprover deploy --caproverUrl $CAPROVER_URL --appToken $CAPROVER_WORKER_APP_TOKEN --caproverApp $CAPROVER_WORKER_APP --imageName $WORKER_IMAGE_TAG
echo "Deploying Frontend App $CAPROVER_FRONTEND_APP on CapRover $CAPROVER_URL"
docker run caprover/cli-caprover:latest caprover deploy --caproverUrl $CAPROVER_URL --appToken $CAPROVER_FRONTEND_APP_TOKEN --caproverApp $CAPROVER_FRONTEND_APP --imageName $FRONTEND_IMAGE_TAG
