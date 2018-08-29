FROM        node

# Required to install dependencies behind a proxy
ARG         http_proxy
ARG         https_proxy

WORKDIR     /app

RUN         apt-get update && apt-get install -y proxychains

COPY        package.json .
RUN         npm install

# Required to work around google api auth issue:
# https://github.com/google/google-api-nodejs-client/issues/998

COPY        proxychains.conf .
COPY        *.sh .
COPY        *.js .
RUN         chmod +x *.sh

ENTRYPOINT  exec ./setup.sh && exec tail -f /dev/null