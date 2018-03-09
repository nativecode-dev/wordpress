#!/bin/bash

. ../../.env.sh

if [ $1 ]; then
  APPCMD=$1
fi

$DOCKER run \
  --name $DOCKER_NAME \
  $DOCKER_ARGS \
  --rm \
  $DOCKER_TAG \
;
