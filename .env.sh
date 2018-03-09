#!/bin/bash

# Get the current branch.
export BRANCH=`git rev-parse --abbrev-ref HEAD`

# Set up docker config info.
export DOCKER=`which docker`
export DOCKER_RUN="${DOCKER_RUN:-false}"
export DOCKER_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')

# Set up container config.
export DOCKER_NAME="wordpress"
export DOCKER_REPO="nativecode/$DOCKER_NAME"
export DOCKER_TAG="$DOCKER_REPO:$DOCKER_VERSION"

export DOCKER_ARGS << EOM
  -p 8080:80
  -e WORDPRESS_DB_CREATOR_USER="root"
  -e WORDPRESS_DB_CREATOR_PASSWORD="m3-r00t-u-j4n3"
  -e WORDPRESS_DB_USER="root"
  -e WORDPRESS_DB_PASSWORD="m3-r00t-u-j4n3"
EOM

export DOCKER_BUILD_ARGS << EOM
EOM
