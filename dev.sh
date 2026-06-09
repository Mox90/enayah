#!/usr/bin/env bash
set -e

OS="$(uname -s)"

HOST_IP=""

case "$OS" in
    Darwin)
        HOST_IP=$(ipconfig getifaddr en0 2>/dev/null)

        if [ -z "$HOST_IP" ]; then
            HOST_IP=$(ipconfig getifaddr en1 2>/dev/null)
        fi
        ;;

    Linux)
        HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}')

        if [ -z "$HOST_IP" ]; then
            HOST_IP=$(ip route get 1 2>/dev/null | awk '{print $7; exit}')
        fi
        ;;

    MINGW*|MSYS*|CYGWIN*)
        HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}')

        if [ -z "$HOST_IP" ]; then
            HOST_IP=$(ipconfig.exe | grep -A 4 "Wireless LAN adapter" | grep "IPv4" | awk '{print $NF}')
        fi
        ;;
esac

if [ -z "$HOST_IP" ]; then
    echo "❌ Unable to determine local IP address."
    exit 1
fi

export DEV_HOST="http://$HOST_IP"

echo ""
echo "=================================="
echo " Enayah Development"
echo " Host IP : $HOST_IP"
echo " URL     : http://$HOST_IP"
echo "=================================="
echo ""

docker compose down --remove-orphans

docker compose up --build