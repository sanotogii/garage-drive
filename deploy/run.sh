#!/usr/bin/env bash
# Runs inside proot Ubuntu. exec keeps the same PID so Termux can stop it later.
cd /root/garage-drive || exit 1
echo $$ > app.pid
set -a; . ./.env.local; set +a
export PORT=3000 HOSTNAME=0.0.0.0
exec node app/server.js
