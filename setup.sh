#!/bin/bash
if [ -z "$HTTP_PROXY_IP" ] && [ -z "$HTTP_PROXY_PORT" ]; then
  echo "http ${HTTP_PROXY_IP} ${HTTP_PROXY_PORT}" >> ./proxychains.conf
fi
