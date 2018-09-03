#!/bin/bash
if [ -z "$HTTP_PROXY_IP" ] && [ -z "$HTTP_PROXY_PORT" ]; then
  exec node gsheet-tagfetch.js $@
else
  echo "http ${HTTP_PROXY_IP} ${HTTP_PROXY_PORT}" >> ./proxychains.conf
  exec proxychains node gsheet-tagfetch.js $@ | tail -n +2 # drop proxychains noise
fi
