#!/bin/bash

docker build -t test . \
  && docker history --no-trunc test > /tmp/test \
  && cat /tmp/test | more \
;
