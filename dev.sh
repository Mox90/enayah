#!/bin/bash

HOST_IP=$(ipconfig getifaddr en0)

if [ -z "$HOST_IP" ]; then
    HOST_IP=$(ipconfig getifaddr en1)
fi

export DEV_HOST=http://$HOST_IP

echo ""
echo "=================================="
echo " Enayah Development"
echo " Host IP: $HOST_IP"
echo " URL: http://$HOST_IP"
echo "=================================="
echo ""

docker compose down

docker compose up --build