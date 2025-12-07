#!/bin/bash
# Debug script to help diagnose Parallax cluster issues

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         Parallax Cluster Debug Information                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Get local IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
else
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

echo "📍 Your local IP: $LOCAL_IP"
echo ""

# Check host file
if [ -f ".parallax_host" ]; then
    SAVED_HOST=$(cat .parallax_host)
    echo "💾 Saved host IP: $SAVED_HOST"
else
    echo "⚠️  No saved host IP found (.parallax_host missing)"
fi
echo ""

# Check if Parallax scheduler is running
echo "🔍 Checking Parallax scheduler..."
if curl -s --connect-timeout 2 "http://localhost:3001/health" > /dev/null 2>&1; then
    echo "✅ Scheduler is running on localhost:3001"
    
    # Try to get status
    STATUS=$(curl -s "http://localhost:3001/health" 2>/dev/null)
    echo "   Status: $STATUS"
else
    echo "❌ Scheduler not accessible on localhost:3001"
fi
echo ""

# Check if Parallax node is running (client)
echo "🔍 Checking Parallax node..."
if curl -s --connect-timeout 2 "http://localhost:3000/health" > /dev/null 2>&1; then
    echo "✅ Node is running on localhost:3000"
else
    echo "❌ Node not accessible on localhost:3000"
fi
echo ""

# Check Python environment
echo "🐍 Checking Python environment..."
if [ -d "parallax/venv" ]; then
    echo "✅ Python venv found at parallax/venv"
    source parallax/venv/bin/activate
    
    PYTHON_VERSION=$(python --version 2>&1)
    echo "   Python: $PYTHON_VERSION"
    
    # Check if parallax is installed
    if command -v parallax &> /dev/null; then
        PARALLAX_VERSION=$(parallax --version 2>&1 || echo "unknown")
        echo "   Parallax: $PARALLAX_VERSION"
    else
        echo "   ⚠️  Parallax command not found in venv"
    fi
else
    echo "❌ Python venv not found"
fi
echo ""

# Check processes
echo "🔍 Checking running processes..."
PARALLAX_PROCS=$(ps aux | grep -i parallax | grep -v grep | wc -l | tr -d ' ')
if [ "$PARALLAX_PROCS" -gt 0 ]; then
    echo "✅ Found $PARALLAX_PROCS Parallax process(es)"
    ps aux | grep -i parallax | grep -v grep
else
    echo "⚠️  No Parallax processes running"
fi
echo ""

# Port usage
echo "🔌 Checking port usage..."
if command -v lsof &> /dev/null; then
    PORT_3000=$(lsof -i :3000 -sTCP:LISTEN -t 2>/dev/null)
    PORT_3001=$(lsof -i :3001 -sTCP:LISTEN -t 2>/dev/null)
    
    if [ -n "$PORT_3000" ]; then
        echo "✅ Port 3000 in use by PID: $PORT_3000"
    else
        echo "⚪ Port 3000 is free"
    fi
    
    if [ -n "$PORT_3001" ]; then
        echo "✅ Port 3001 in use by PID: $PORT_3001"
    else
        echo "⚪ Port 3001 is free"
    fi
else
    echo "⚠️  lsof not available, can't check ports"
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "Quick Tests:"
echo ""
echo "Test scheduler health:"
echo "  curl http://localhost:3001/health"
echo ""
echo "Test from another machine (replace IP):"
echo "  curl http://$LOCAL_IP:3001/health"
echo ""
echo "Start host:"
echo "  ./run-host.sh -n 4"
echo ""
echo "Start client (from another machine):"
echo "  ./run-client.sh $LOCAL_IP"
echo "═══════════════════════════════════════════════════════════"
