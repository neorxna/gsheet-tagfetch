#!/bin/bash
if [ -z "$HTTP_PROXY_IP" ] && [ -z "$HTTP_PROXY_PORT" ]; then
  proxychains node ./gsheet-tagfetch.js
else
  node ./gsheet-tagfetch.js
fi

