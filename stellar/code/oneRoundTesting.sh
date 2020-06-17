PATH_CONFIGURE=$HOME/benchmark_v2/configure.json

# modify config file
node ../../modconfig.js

inputRate=$1

REPEAT=1
THREAD_NUM=4
TEST_TIME=1

DURATION_TIME=$(cat $PATH_CONFIGURE | jq -r '.setting.duration_time')
SLEEP_TIME=$(cat $PATH_CONFIGURE | jq -r '.setting.sleep_time')
NODE_NUM=$(cat $PATH_CONFIGURE | jq -r '.setting.node_num')
MODEL=$(cat $PATH_CONFIGURE | jq -r '.setting.model')
region_setting=$(cat $PATH_CONFIGURE | jq -r '.setting.region')
region_list=$(cat $PATH_CONFIGURE | jq -r '.region' | jq 'keys')
region_num=$(cat $PATH_CONFIGURE | jq -r '.region' | jq 'length')

let SPLIT_TX_RATE=inputRate/THREAD_NUM
let ONE_PERIOD=SPLIT_TX_RATE*DURATION_TIME
# reset stellarNetwork
cd /home/caideyi/Benchmarking/t-stellar/script/
#./killprocess.sh 
./active.sh 

# create testing account
cd /home/caideyi/benchmark_v2/stellar/code/
node createAccount.js
sleep 10

echo -e "===Experiment Settings===\n"
echo -e "MODEL : $MODEL\nNODE_NUMBER : $NODE_NUM\nREGION : $region_setting $region_list"
echo  "============================"

# reset horizon => reset transaction_log at node0
gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "stellar0" --command="nohup ./resetHorizon.sh > /dev/null 2> /dev/null < /dev/null &"
sleep 5

echo -e "start Testing\nINPUTRATE : $TX_RATE\nDURATION_TIME : $DURATION_TIME"

# workload---send transaction
slice=0
for ((i=0 ; i < $THREAD_NUM ; i ++)){
    node workload $SPLIT_TX_RATE $DURATION_TIME $REPEAT $SLEEP_TIME $slice &
    let slice=slice+ONE_PERIOD
}

# active monitor - check all transaction done
node monitor.js $inputRate $DURATION_TIME $REPEAT

rm -r /home/caideyi/benchmark_v2/stellar/rec_data/node*
for ((i=0 ; i < $NODE_NUM ;i ++)){
	node_path=/home/caideyi/benchmark_v2/stellar/rec_data/node$i
	if [ ! -d "$node_path" ]; then
		mkdir -p $node_path
	fi
	let region_index=i%$region_num
	region=$(echo $region_list | jq -r .[$region_index])
	echo "transfer log from stellar$i region $region"
	gcloud compute --project "caideyi" ssh --zone "$region" "stellar$i" --command="gcloud compute scp transaction_log s-workloader:~/benchmark_v2/stellar/rec_data/node$i"
}

# post_process
node post_process.js 

# calculate performance
cd /home/caideyi/benchmark_v2/bin/
node calculate.js 'stellar' $inputRate $DURATION_TIME $REPEAT $TEST_TIME

cd /home/caideyi/Benchmarking/t-stellar/script/
./killprocess.sh

for ((i = 0 ; i < $NODE_NUM ;i++)){
	let region_index=i%$region_num
	region=$(echo $region_list | jq -r .[$region_index])
	echo "transfer micro data from tendermint$i region $region"
	gcloud compute --project "caideyi" ssh --zone "$region" "stellar$i" -- "gcloud compute scp --recurse Monitor/data/ s-workloader:~/benchmark_v2/stellar/rec_data/node$i/"
}


path=/home/caideyi/report/$MODEL/R$inputRate-T$DURATION_TIME
rm -r $path
mkdir -p $path
cp -r /home/caideyi/benchmark_v2/stellar/rec_data $path
cp -r /home/caideyi/benchmark_v2/stellar/res/report1.json $path
