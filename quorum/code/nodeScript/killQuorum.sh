#!/bin/bash
quorum_pid=$(ps aux | grep "geth" | grep -v "grep" | awk '{ print $2 }')
kill -9 $quorum_pid
echo "kill process $quorum_pid, remove log, remove data"
rm -r data
rm log
sleep 5
