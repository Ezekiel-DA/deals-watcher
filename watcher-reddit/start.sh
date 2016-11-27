#!/bin/bash
set -eux # e : exit on error; u : no unbound variables ; x : log executed commands

env | egrep '^deals_' | cat - /tmp/crontab > /etc/cron.d/crontab

echo "[INFO] Reddit watcher running..."
cd /usr/src/watcher-reddit

if [ -v deals_watcher_reddit_debug ]
then
    echo "[INFO] Reddit watcher: DEBUG MODE IS ON. "
    /usr/local/bin/node --debug-brk=5858 watcher.js
else
    cron && tail -f /var/log/cron.log
fi
