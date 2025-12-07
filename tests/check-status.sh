#!/bin/bash
# Check Parallax cluster status

echo "=== Checking Parallax Cluster Status ==="
echo ""

echo "1. Scheduler Health:"
curl -s http://localhost:3001/health | python3 -m json.tool 2>/dev/null || echo "Could not connect"
echo ""

echo "2. Checking host logs for errors..."
echo "Look for lines with 'ERROR' or 'model' in recent output"
echo ""

echo "3. Check if model is being loaded..."
echo "The nodes show 'waiting' status - this usually means:"
echo "  - Model is still downloading/loading"
echo "  - OR nodes are waiting for model shards to be distributed"
echo ""

echo "4. Quick fix to try:"
echo "   The model Qwen/Qwen3-0.6B is small (0.6B parameters)"
echo "   It should load quickly on your Mac Mini"
echo ""
echo "   Try using an even smaller model or wait 30-60 seconds"
echo "   for the current model to finish loading."
echo ""

echo "5. Alternative: Try without specifying node count"
echo "   ./run-host.sh"
echo "   This won't wait for a specific number of nodes"
echo ""
