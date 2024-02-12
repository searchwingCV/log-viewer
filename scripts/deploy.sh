#!/bin/bash

set -e

echo "deploying app in $ENVIRONMENT"

docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
echo "Deploying Backend App $CAPROVER_BACKEND_APP on CapRover $CAPROVER_URL"
docker run caprover/cli-caprover:latest caprover deploy --caproverUrl $CAPROVER_URL --appToken $CAPROVER_BACKEND_APP_TOKEN --caproverApp $CAPROVER_BACKEND_APP --imageName $BACKEND_IMAGE_TAG
echo "Deploying Worker App $CAPROVER_BACKEND_APP on CapRover $CAPROVER_URL"
docker run caprover/cli-caprover:latest caprover deploy --caproverUrl $CAPROVER_URL --appToken $CAPROVER_WORKER_APP_TOKEN --caproverApp $CAPROVER_WORKER_APP --imageName $WORKER_IMAGE_TAG
echo "Deploying Frontend App $CAPROVER_FRONTEND_APP on CapRover $CAPROVER_URL"
docker run caprover/cli-caprover:latest caprover deploy --caproverUrl $CAPROVER_URL --appToken $CAPROVER_FRONTEND_APP_TOKEN --caproverApp $CAPROVER_FRONTEND_APP --imageName $FRONTEND_IMAGE_TAG
