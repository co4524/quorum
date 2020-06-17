path_configure=$HOME/benchmark_v2/configure.json
transaction_rate=$(cat $path_configure | jq -r '.setting.transaction_rate')
consensus=$(cat $path_configure | jq -r '.setting.consensus')
path_report=$(cat $path_configure | jq -r ".$consensus.path.report_path")
duration_time=$(cat $path_configure | jq -r '.setting.duration_time')
node_num=$(cat $path_configure | jq -r '.setting.node_num')
model=$(cat $path_configure | jq -r '.setting.model')
region_setting=$(cat $path_configure | jq -r '.setting.region')
region_list=$(cat $path_configure | jq -r '.region' | jq 'keys')

iter=$(cat $path_configure | jq -r '.setting.transaction_rate' |  jq 'length')
iter=`expr $iter - 1`


Benchmark() {
    echo "Start testing"
    echo "==============================="
    echo "Transaction_list :\n$transaction_rate"
    printf "%-15s%-15s\n" "Consensus" ":  $consensus"
    printf "%-15s%-15s\n" "Model" ":  $model"
    printf "%-15s%-15s\n" "Node_number" ":  $node_num"
    printf "%-15s%-15s\n" "RegionSetting" ":  $region_setting"
    printf "%-15s%-15s\n" "Region_list" ":  $region_list"
    path=$path_report/$model/
    if [ ! -d "$path" ]; then
        mkdir -p $path
    fi
    rm process_log
    sleep 10
	for index in $(seq 0 $iter)
    do
        echo "==============================="
        tx_rate=$(echo $transaction_rate | jq -r ".[$index]")
        printf "[%-8s] StartTesting : Input_rate %-5d Duration_time %-5s\n" $(date +%X) $tx_rate $duration_time 
        # nohup sh oneRoundTest.sh $tx_rate > process_log
        nohup sh oneRoundTest-doc.sh $tx_rate > process_log
        mv process_log $path_report/$model/R$tx_rate-T$duration_time
        cp -f $path_configure $path_report/$model
        printf "[%-8s] EndTesting Report_path: %-30s:\n" $(date +%X) $path_report/$model/R$tx_rate-T$duration_time
	done
}

Benchmark
