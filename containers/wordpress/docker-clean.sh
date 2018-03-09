#!/bin/bash

. ../../.env.sh

$DOCKER ps -aq --no-trunc | xargs docker rm
$DOCKER images -q --filter dangling=true | xargs docker rmi
$DOCKER rmi $DOCKER_TAG
