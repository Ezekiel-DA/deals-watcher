#!/bin/bash
set -eux # e : exit on error; u : no unbound variables ; x : log executed commands

env | egrep '^deals_' | cat - /tmp/crontab > /etc/cron.d/crontab

echo "[INFO] notifier running..."
cd /usr/src/notifier

if [ -v deals_notifier_debug ]
then
    echo "[INFO] notifier: DEBUG MODE IS ON. "
    /usr/local/bin/node --debug-brk=5858 notifier.js
else
    cron && tail -f /var/log/cron.log
fi
