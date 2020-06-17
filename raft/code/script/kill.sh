#!/bin/sh

## setting
tx_rate=$1
path_configure=$HOME/benchmark_v2/configure.json
repeat=1
thread_num=1
test_time=1

consensus=$(cat $path_configure | jq -r '.setting.consensus')
path_testnet=$(cat $path_configure | jq -r ".$consensus.path.node_config")
path_rec=$(cat $path_configure | jq -r ".$consensus.path.rec_data")
path_log=$(cat $path_configure | jq -r '.node.log')
path_report=$(cat $path_configure | jq -r ".$consensus.path.report_path")
path_micro_data=$(cat $path_configure | jq -r '.node.micro_data')
duration_time=$(cat $path_configure | jq -r '.setting.duration_time')
sleep_time=$(cat $path_configure | jq -r '.setting.sleep_time')
node_num=$(cat $path_configure | jq -r '.setting.node_num')
model=$(cat $path_configure | jq -r '.setting.model')
instance_name=$(cat $path_configure | jq -r '.setting.instance_name')
dispatcher_name=$(cat $path_configure | jq -r '.setting.dispatcher_name')
region_setting=$(cat $path_configure | jq -r '.setting.region')
gcloud_proj_name=$(cat $path_configure | jq -r '.setting.gcloud_proj_name')
region_list=$(cat $path_configure | jq -r '.region' | jq 'keys')
region_num=$(cat $path_configure | jq -r '.region' | jq 'length')
block_time=$(cat $path_configure | jq -r '.setting.block_time')

iter=`expr $node_num - 1`

for node_index in $(seq 0 $iter)
do
    echo "transfer micro_data from $instance_name$node_index to $dispatcher_name"
    node_path=$path_rec/node$node_index
	if [ ! -d "$node_path" ]; then
		mkdir -p $node_path
	fi
    region_index=`expr $node_index % $region_num`
    region=$(echo $region_list | jq -r .[$region_index])
    if [ "$consensus" = "raft" ]; then
        gcloud compute --project "$gcloud_proj_name" ssh --zone "$region" "$instance_name$node_index" \
        --command="gcloud compute scp --recurse $path_log $dispatcher_name:$path_rec/node$node_index --zone asia-east1-b" 
        gcloud compute --project "$gcloud_proj_name" ssh --zone "$region" "$instance_name$node_index" \
        --command="sh killRaft.sh; gcloud compute scp --project $gcloud_proj_name --recurse $path_micro_data $dispatcher_name:$path_rec/node$node_index --zone asia-east1-b" &
    else
        gcloud compute --project "$gcloud_proj_name" ssh --zone "$region" "$instance_name$node_index" \
        --command="gcloud compute scp --recurse $path_log $dispatcher_name:$path_rec/node$node_index --zone asia-east1-b" 
        gcloud compute --project "$gcloud_proj_name" ssh --zone "$region" "$instance_name$node_index" \
        --command="sh killQuorum.sh; gcloud compute scp --project $gcloud_proj_name --recurse $path_micro_data $dispatcher_name:$path_rec/node$node_index --zone asia-east1-b" &
    fi
done
sleep 120

path=$path_report/$model/fail
if [ -d "$path" ]; then
    rm -r $path
fi
mkdir -p $path
cp -r $path_rec $path
mv process_log $path
