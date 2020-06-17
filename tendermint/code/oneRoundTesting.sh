PATH_CONFIGURE=$HOME/benchmark_v2/configure.json

TX_RATE=$1

# modify config file
node ../../modconfig.js

DURATION_TIME=$(cat $PATH_CONFIGURE | jq -r '.setting.duration_time')
REPEAT=1
SLEEP_TIME=60
SLICE=0
THREAD_NUM=4
TEST_TIME=1
let SPLIT_TX_RATE=TX_RATE/THREAD_NUM
let ONE_PERIOD=SPLIT_TX_RATE*DURATION_TIME

SLEEP_TIME=$(cat $PATH_CONFIGURE | jq -r '.setting.sleep_time')
NODE_NUM=$(cat $PATH_CONFIGURE | jq -r '.setting.node_num')
tendermint_core=$(cat $PATH_CONFIGURE | jq -r '.setting.core_name')
MODEL=$(cat $PATH_CONFIGURE | jq -r '.setting.model')
region_setting=$(cat $PATH_CONFIGURE | jq -r '.setting.region')
region_list=$(cat $PATH_CONFIGURE | jq -r '.region' | jq 'keys')
region_num=$(cat $PATH_CONFIGURE | jq -r '.region' | jq 'length')


# reset network
cd /home/caideyi/Benchmarking/t-tendermint/script
./command.sh active $NODE_NUM $tendermint_core
cd /home/caideyi/benchmark_v2/tendermint/code
#for ((i = 0 ; i < $NODE_NUM ;i++)){
#    gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "tendermint0" -- 'rm /home/caideyi/Benchmarking/t-tendermint/data/block_commit_time'
#}
echo -e "===Experiment Settings===\n"
echo -e "MODEL : $MODEL\nNODE_NUMBER : $NODE_NUM\nREGION : $region_setting $region_list"
echo  "============================"
sleep 10
# multi thread workload
echo -e "start Testing\nINPUTRATE : $TX_RATE\nDURATION_TIME : $DURATION_TIME"
for ((i = 1 ; i < $THREAD_NUM ; i++)){
    node ../../bin/workload.js "tendermint" $SPLIT_TX_RATE $DURATION_TIME $REPEAT $SLEEP_TIME $SLICE $i&
    let SLICE=SLICE+ONE_PERIOD
}
node ../../bin/workload.js "tendermint" $SPLIT_TX_RATE $DURATION_TIME $REPEAT $SLEEP_TIME $SLICE $THREAD_NUM
let SLICE=SLICE+ONE_PERIOD
sleep 5
cd /home/caideyi/benchmark_v2/tendermint/code
# calculate performance
node merge.js $THREAD_NUM
rm -r /home/caideyi/benchmark_v2/tendermint/rec_data/node*
for ((i = 0 ; i < $NODE_NUM ;i++)){
	node_path=/home/caideyi/benchmark_v2/tendermint/rec_data/node$i
	if [ ! -d "$node_path" ]; then
		mkdir -p $node_path
	fi
	let region_index=i%$region_num
	region=$(echo $region_list | jq -r .[$region_index])
	echo "transfer log from tendermint$i region $region"
    gcloud compute --project "caideyi" ssh --zone "$region" "tendermint$i" -- "./Benchmarking/t-tendermint/nodeScript/scp2.sh $i"
}
node post_process.js $TX_RATE $DURATION_TIME $REPEAT 0 $TEST_TIME
node ../../bin/calculate.js "tendermint" $TX_RATE $DURATION_TIME $REPEAT $TEST_TIME

# transfer micro performance data
cd /home/caideyi/Benchmarking/t-tendermint/script
./command.sh kill $NODE_NUM

sleep 120

for ((i = 0 ; i < $NODE_NUM ;i++)){
	let region_index=i%$region_num
	region=$(echo $region_list | jq -r .[$region_index])
	echo "transfer micro data from tendermint$i region $region"
	gcloud compute --project "caideyi" ssh --zone "$region" "tendermint$i" -- "./Benchmarking/t-tendermint/nodeScript/scp.sh $i" &
}
sleep 120

path=/home/caideyi/report/$MODEL/R$TX_RATE-T$DURATION_TIME  
rm -r $path
mkdir -p $path
cp -r /home/caideyi/benchmark_v2/tendermint/rec_data $path
