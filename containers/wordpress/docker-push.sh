#!/bin/bash

set -e

. ../../.env.sh

TRAVIS_BRANCH=${TRAVIS_BRANCH:-$BRANCH}

if [ $BRANCH = "master" ] || [ $TRAVIS_BRANCH = "master" ]; then

  # Create docker images first.
  sh docker-build.sh

  # LATEST
  $DOCKER tag $DOCKER_TAG $DOCKER_REPO:latest
  $DOCKER image push $DOCKER_TAG
  $DOCKER image push $DOCKER_REPO:latest

else

  echo "Current branch ($BRANCH/$TRAVIS_BRANCH) is not master. Refusing to push docker images."

fi
