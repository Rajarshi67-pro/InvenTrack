#!/bin/bash
# InvenTrack Pro — Start Script
# Starts mock server + frontend dev server together

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  InvenTrack Pro — Starting Development Servers  ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Kill any existing instances
echo "→ Stopping any running servers..."
pkill -f "node server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1

# Start Mock API Server
echo "→ Starting Mock API Server on http://localhost:5001 ..."
cd "$(dirname "$0")/mock-server"
node server.js > /tmp/inventrack-mock.log 2>&1 &
MOCK_PID=$!
sleep 2

# Check mock server health
HEALTH=$(curl -s http://localhost:5001/health 2>/dev/null)
if echo "$HEALTH" | grep -q "OK"; then
  echo "  ✅ Mock server running (PID: $MOCK_PID)"
else
  echo "  ❌ Mock server failed to start! Check /tmp/inventrack-mock.log"
  exit 1
fi

# Start Frontend Dev Server
echo "→ Starting Frontend on http://localhost:3000 ..."
cd "$(dirname "$0")/frontend"
npm run dev > /tmp/inventrack-frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 4

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅ InvenTrack Pro is RUNNING                   ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║                                                  ║"
echo "║  Frontend:    http://localhost:3000              ║"
echo "║  Mock API:    http://localhost:5001              ║"
echo "║                                                  ║"
echo "║  Admin Login: admin@inventrack.com               ║"
echo "║  Password:    Admin@123                          ║"
echo "║                                                  ║"
echo "║  Press Ctrl+C to stop all servers               ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Keep script alive and handle Ctrl+C gracefully
trap "echo ''; echo 'Stopping servers...'; kill $MOCK_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
