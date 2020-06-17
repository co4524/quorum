#!/bin/bash
#
# all ${value} defined in ~/benchmark_v2/configure.json
# ----------------------------------------------------------------------------------------------------------------
# command : $sh drawGraph            => draw all model defined in configure.json ${setting.model_list} & ${setting.node_number_list})
# command : $sh drawGraph $tx_rate   => calculate one model $tx_rate defined in configure.json ${setting.model} & ${setting.node_num})
#
# input data path -> report.json         : "${consensus.path.result}/${setting.model_list}/R${setting.transaction_rate}-T${setting.duration_time}/rec_data/report1.json"
#                 -> micro_data          : "${consensus.path.result}/${setting.model_list}/R${setting.transaction_rate}-T${setting.duration_time}/rec_data/${ref_node}"
#                 -> graph_raw_data.txt  : "${consensus.path.result}/${setting.model_list}/graph_raw_data.txt"
#
# output data path -> micro_graph        : "${consensus.path.result}/${setting.model_list}/graph
#                     graph_raw_data.txt : "${consensus.path.result}/${setting.model_list}/graph_raw_data.txt"
#                     performance_graph  : "${consensus.path.result}/
# ----------------------------------------------------------------------------------------------------------------

## read setting from config

path_configure=$HOME/benchmark_v2/configure.json
if [ $# -eq 0 ]; then
        calculate_all=true # true for calculate_all
        transaction_rate=$(cat $path_configure | jq -r '.setting.transaction_rate')
        txRate_iter=$(cat $path_configure | jq -r '.setting.transaction_rate' |  jq 'length')
        txRate_iter=`expr $txRate_iter - 1`
    else
        calculate_all=false # false for calculate single
        graph_name="fail$1"
fi

python=$(cat $path_configure | jq -r '.setting.python_version')
consensus=$(cat $path_configure | jq -r '.setting.consensus')
DURATION_TIME=$(cat $path_configure | jq -r '.setting.duration_time')
node_num=$(cat $path_configure | jq -r '.setting.node_num')
model=$(cat $path_configure | jq -r '.setting.model')
start=$(cat $path_configure | jq -r '.setting.micro_graph.start')
end=$(cat $path_configure | jq -r '.setting.micro_graph.end')  # 0 for default setting 0~end
ref_node=$(cat $path_configure | jq -r '.setting.micro_graph.ref_node')
report_path=$(cat $path_configure | jq -r ".$consensus.path.result")
model_list=$(cat $path_configure | jq -r '.setting.model_list')
node_number_list=$(cat $path_configure | jq -r '.setting.node_number_list')
model_iter=$(cat $path_configure | jq -r '.setting.model_list' |  jq 'length')
model_iter=`expr $model_iter - 1`
fail_dir=$(cat $path_configure | jq -r '.setting.fail_dir')
test_time=1

## draw the graph from "micro" data

# get minxium time bound
getMaxTimeBound(){
    if [ "$end" = "0" ]; then
        init=true
        for micro_data in CpuMonitor IoMonitor ProcessMonitor WebMonitor
        do
            if [ "$init" = true ]; then
                max=$(cat $1/$2/$fail_dir/rec_data/$3/$micro_data | wc -l)
                init=false
            else
                value=$(cat $1/$2/$fail_dir/rec_data/$3/$micro_data | wc -l)
                if [ $max -gt $value ]; then
                max=$value
                fi
            fi
        done
    else
        max=$end
    fi
    echo $max
}

# draw micro data graph

if [ ! -d "./graph" ]; then
    mkdir ./graph
fi

if [ "$calculate_all" = true ]; then
    for model_index in $(seq 0 $model_iter)
    do
        model=$(echo $model_list | jq -r ".[$model_index]")
        if [ -d "$report_path/$model" ]; then
            if [ ! -d "$report_path/$model/graph" ]; then
                mkdir $report_path/$model/graph
            fi
            for tr_index in $(seq 0 $txRate_iter)
            do
                tx_rate=$(echo $transaction_rate | jq -r ".[$tr_index]")
                input_path="$report_path/$model/R$tx_rate-T$DURATION_TIME/rec_data/$ref_node"
                if [ -d "$input_path" ]; then
                    echo "draw micro graph $model-R$tx_rate-T$DURATION_TIME"
                    end=$( getMaxTimeBound $report_path $model $ref_node )
                    $python cpuplot.py $start $end $tx_rate $model $input_path
                else
                    echo "path : $input_path doesnt exists"
                fi
            done
        fi
    done
    else
        if [ ! -d "$report_path/$model/graph" ]; then
            mkdir $report_path/$model/graph
        fi
        input_path="$report_path/$model/$fail_dir/rec_data/$ref_node"
        echo "$report_path $model $ref_node"
        end=$( getMaxTimeBound $report_path $model $ref_node )
        echo "END:$end"
        $python cpuplot.py $start $end $graph_name $model $input_path
fi

