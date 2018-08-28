FROM        node

# Required to install dependencies behind a proxy
ARG         http_proxy
ARG         https_proxy

WORKDIR     /app

RUN         apt-get update && apt-get install -y proxychains

COPY        package.json .
RUN         npm install

COPY        proxychains.conf .
COPY        run.sh .
COPY        *.js .
RUN         chmod +x run.sh

ENTRYPOINT  tail -f /dev/null

