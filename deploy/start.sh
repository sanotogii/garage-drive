#!/usr/bin/env bash
# Runs in Termux (over SSH). Unpacks the new build and starts the app inside proot Ubuntu.
export PATH=/data/data/com.termux/files/usr/bin:$PATH
cd ~/garage-drive || exit 1
[ -f app.pid ] && kill "$(cat app.pid)" 2>/dev/null
sleep 1
rm -rf app && mkdir app && tar xzf garage-drive.tgz -C app
nohup proot-distro login ubuntu --bind "$HOME/garage-drive:/root/garage-drive" -- bash /root/garage-drive/run.sh > app.log 2>&1 < /dev/null &
sleep 3
echo "garage-drive started in proot ubuntu"
