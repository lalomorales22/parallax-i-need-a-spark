#!/bin/bash
# Docker entrypoint for Parallax Spark nodes

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║      ⚡ Parallax Spark - Docker Compute Node ⚡          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check command
case "$1" in
    join)
        echo "Mode: Join existing cluster"
        echo "Host: ${PARALLAX_HOST:-localhost}"
        echo ""
        
        # Wait for host to be available
        echo "Waiting for host to be available..."
        for i in {1..30}; do
            if curl -s --connect-timeout 2 "http://${PARALLAX_HOST}:3001/health" > /dev/null 2>&1; then
                echo "✓ Host is reachable!"
                break
            fi
            if [ $i -eq 30 ]; then
                echo "⚠ Could not reach host at ${PARALLAX_HOST}:3001"
                echo "  Make sure the host is running ./run-host.sh"
                exit 1
            fi
            sleep 2
        done
        
        # Get scheduler address from host
        echo "Getting scheduler address..."
        SCHEDULER_ADDR=$(curl -s "http://${PARALLAX_HOST}:3001/node/join/command" 2>/dev/null | \
            python3 -c "import sys,json; d=json.loads(sys.stdin.read()); cmd=d.get('data',{}).get('command',''); import re; m=re.search(r'12D3KooW[a-zA-Z0-9]+', cmd); print(m.group() if m else '')" 2>/dev/null || echo "")
        
        if [ -n "$SCHEDULER_ADDR" ]; then
            echo "✓ Scheduler address: $SCHEDULER_ADDR"
            echo ""
            echo "Joining cluster..."
            exec parallax join -s "$SCHEDULER_ADDR"
        else
            echo "Using relay servers for connection..."
            exec parallax join -r
        fi
        ;;
        
    shell)
        echo "Starting shell..."
        exec /bin/bash
        ;;
        
    *)
        echo "Unknown command: $1"
        echo "Available commands: join, shell"
        exit 1
        ;;
esac
