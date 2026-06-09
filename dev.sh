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
            #HOST_IP=$(ipconfig.exe | grep -A 4 "Wireless LAN adapter" | grep "IPv4" | awk '{print $NF}')
            HOST_IP=$(ipconfig.exe | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' | grep -v '^127\.' | grep -v '^169\.254\.' | head -n1)
        fi
        ;;
esac

if [ -z "$HOST_IP" ]; then
    echo "❌ Unable to determine local IP address."
    exit 1
fi


# Validate IP format and reject invalid ranges
if ! echo "$HOST_IP" | grep -Eq '^([0-9]{1,3}\.){3}[0-9]{1,3}$'; then
    echo "❌ Invalid IP address format: $HOST_IP"
    exit 1
fi

if echo "$HOST_IP" | grep -Eq '^(127\.|169\.254\.)'; then
    echo "❌ Localhost or link-local IP detected: $HOST_IP"
    echo "   Please ensure you have a valid network connection."
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