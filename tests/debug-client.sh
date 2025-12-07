#!/bin/bash
# Debug script to check client configuration

echo "=== Spark Client Debug ==="
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "1. Current directory: $SCRIPT_DIR"
echo ""

echo "2. Checking .parallax_host file:"
if [ -f ".parallax_host" ]; then
    HOST_CONTENT=$(cat .parallax_host)
    echo "   File exists with content: '$HOST_CONTENT'"
else
    echo "   ❌ File does NOT exist!"
    echo "   Run: ./run-client.sh <HOST_IP> to set it"
fi
echo ""

echo "3. Environment variables:"
echo "   SPARK_MODE: ${SPARK_MODE:-'(not set)'}"
echo "   PARALLAX_HOST: ${PARALLAX_HOST:-'(not set)'}"
echo ""

echo "4. Testing connection to host:"
HOST_IP=$(cat .parallax_host 2>/dev/null || echo "localhost")
echo "   Trying to reach $HOST_IP:3001..."
if curl -s --connect-timeout 3 "http://$HOST_IP:3001/health" > /dev/null 2>&1; then
    echo "   ✓ Host is reachable at $HOST_IP:3001"
else
    echo "   ❌ Cannot reach host at $HOST_IP:3001"
    echo "   Make sure the host is running and the IP is correct"
fi
echo ""

echo "5. Git status:"
git log --oneline -1
echo ""

echo "=== End Debug ==="
