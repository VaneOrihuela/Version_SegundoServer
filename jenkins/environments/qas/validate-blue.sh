#!/bin/bash

# curl green
CURL_COMMAND="curl -s -o /dev/null -w '%{http_code}' --request POST --url http://localhost:5001/api/token/validar-conexion --header 'User-Agent: insomnia/10.3.0' --header 'content-type: multipart/form-data' --form ="

# Execute the curl command and capture the HTTP status code
STATUS_CODE=$(eval "$CURL_COMMAND")

# Check if the status code is 200
if [ "$STATUS_CODE" -eq 200 ]; then
  echo "HTTP request successful (200 OK)"
  exit 0  # Success
else
  echo "HTTP request failed (status code: $STATUS_CODE)"
  exit 1  # Failure
fi