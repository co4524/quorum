#!/bin/sh

# Global variables

HELPER_BIN=$(pwd)/bin/update-configs
DEFAULT_CONSENSUS_PROTOCOL="IBFT"
DEFAULT_NODES_PATH=../.nodes
DEFAULT_NODES_AMOUNT=4

# Customized input

CONSENSUS_PROTOCOL=${1:-$DEFAULT_CONSENSUS_PROTOCOL}
NODES_PATH=`/usr/bin/realpath ${2:-$DEFAULT_NODES_PATH}`
NODES_AMOUNT=${3:-$DEFAULT_NODES_AMOUNT}
LEADER_NODE_ID=${4:-0}

MAX_NODE_ID=`expr $NODES_AMOUNT - 1`

if [ $MAX_NODE_ID -lt $LEADER_NODE_ID ]
then
  echo "Invalid leader node id"
  exit
fi

# Main script

NODE_LIST=`/usr/bin/seq 0 $MAX_NODE_ID`

if [ -d $NODES_PATH ]
then
  /bin/rm -rf $NODES_PATH
fi

## Create working directories

for nid in $NODE_LIST
do
  /bin/mkdir -p $NODES_PATH/node$nid/data/geth
done

## Create initial configurations for all nodes

cd $NODES_PATH/node$LEADER_NODE_ID
istanbul setup --num $NODES_AMOUNT --nodes --quorum --save --verbose

## Initial accounts

# for nid in $NODE_LIST
# do
#   geth --datadir $NODES_PATH/node$nid/data account new
# done

## Update static-nodes.json and genesis.json

node $HELPER_BIN $CONSENSUS_PROTOCOL $NODES_PATH $LEADER_NODE_ID

## Copy the needed configurations

for nid in $NODE_LIST
do
  cd $NODES_PATH/node$nid

  /bin/cp -i $NODES_PATH/node$LEADER_NODE_ID/genesis.json ./data/
  /bin/cp -i $NODES_PATH/node$LEADER_NODE_ID/static-nodes.json ./data/
  /bin/cp -i $NODES_PATH/node$LEADER_NODE_ID/static-nodes.json ./data/permissioned-nodes.json
  /bin/cp -i $NODES_PATH/node$LEADER_NODE_ID/$nid/nodekey ./data/geth
done