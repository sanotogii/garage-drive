#!/usr/bin/env bash
# Runs on the phone (Termux). Unpacks the new build and restarts the app.
cd ~/garage-drive || exit 1
pkill -f "node app/server.js" 2>/dev/null
rm -rf app && mkdir app && tar xzf garage-drive.tgz -C app
set -a; . ./.env.local; set +a
PORT=3000 HOSTNAME=0.0.0.0 nohup node app/server.js > app.log 2>&1 < /dev/null &
sleep 2
echo "garage-drive started"
