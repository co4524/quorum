#!/bin/bash
raft_pid=$(ps aux | grep "geth" | grep -v "grep" | awk '{ print $2 }')
kill -9 $raft_pid
echo "kill process $raft_pid, remove log, remove data"
rm -r data
rm log
sleep 5
