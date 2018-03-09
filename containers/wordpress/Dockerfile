FROM wordpress:fpm-alpine

RUN set -ex \
  && apk update \
    && apk upgrade \
    && apk add zlib-dev \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install zip  \
    && apk del zlib-dev \
;
