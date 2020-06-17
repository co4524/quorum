#!/bin/bash
export PATH=$HOME/quorum/build/bin:$PATH
datadir=$1
ws_port=$2
rpc_port=$3
node_port=$4
block_time=$5

echo "genesis block init"
geth --datadir $datadir init "$datadir/genesis.json"
echo "start the node"
rm log
nohup geth --datadir $datadir --istanbul.blockperiod $block_time --syncmode full --mine --minerthreads=1 --networkid 10 --ws --wsaddr "0.0.0.0" --wsport $ws_port --wsapi "admin,db,eth,debug,miner,net,shh,txpool,personal,web3,quorum,istanbul" --wsorigins "*" --rpc --rpcaddr "0.0.0.0" --rpcport $rpc_port --rpcapi "admin,db,eth,debug,miner,net,shh,txpool,personal,web3,quorum,istanbul" --rpccorsdomain "*" --port $node_port --nodiscover > log 2> log < /dev/null &

sleep 3
quorum_pid=$(ps aux | grep "geth" | grep -v "grep" | awk '{ print $2 }')
echo "monitor PID $quorum_pid"
nohup python3 Monitor/Monitor.py $quorum_pid > /dev/null 2> /dev/null < /dev/null &
