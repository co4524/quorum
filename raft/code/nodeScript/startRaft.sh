#!/bin/bash
export PATH=$HOME/quorum/build/bin:$PATH
datadir=$1
ws_port=$2
rpc_port=$3
node_port=$4
check_point_port=$5

echo "genesis block init"
geth --datadir $datadir init "$datadir/genesis.json"
echo "start the node"
rm log
nohup geth --datadir $datadir --nodiscover --verbosity 5 --networkid 10 --raft --raftport $node_port --rpc --rpcaddr 0.0.0.0 --rpcport $rpc_port --rpcapi "admin,db,eth,debug,miner,net,shh,txpool,personal,web3,quorum,raft" --rpccorsdomain "*" --ws --wsaddr "0.0.0.0" --wsport $ws_port --wsapi "admin,db,eth,debug,miner,net,shh,txpool,personal,web3,quorum,raft" --wsorigins "*" --emitcheckpoints --port $check_point_port > log 2> log < /dev/null &

sleep 3
raft_pid=$(ps aux | grep "geth" | grep -v "grep" | awk '{ print $2 }')
echo "monitor PID $raft_pid"
nohup python3 Monitor/Monitor.py $raft_pid > /dev/null 2> /dev/null < /dev/null &
