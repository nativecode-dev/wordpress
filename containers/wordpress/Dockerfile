FROM wordpress:latest

RUN set -ex \
  && apt-get update \
  && apt-get -y upgrade \
  && apt-get -y install zlib1g-dev \
  && rm -rf /var/lib/apt/lists/* \
  && docker-php-ext-install zip  \
  && apt-get -y remove zlib1g-dev \
  && apt-get -y autoremove \
  && apt-get -y autoclean \
  ;
