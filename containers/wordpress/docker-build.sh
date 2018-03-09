#!/bin/bash

. ../../.env.sh

echo "Building: $DOCKER_TAG..."

$DOCKER build --rm --tag $DOCKER_TAG .
