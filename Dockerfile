FROM        node

# Required to install dependencies behind a proxy
ARG         http_proxy
ARG         https_proxy

WORKDIR     /app

# Required to work around google api auth issue:
# https://github.com/google/google-api-nodejs-client/issues/998

COPY        proxychains.conf .
RUN         apt-get update && apt-get install -y proxychains

COPY        package.json .
RUN         npm install

COPY        *.sh .
COPY        *.js .
RUN         chmod +x *.sh

ENTRYPOINT  ./setup.sh && tail -f /dev/null
