PATH_CONFIGURE=$HOME/benchmark_v2/configure.json

array=(
100
200
300
400
500
)

DURATION_TIME=$(cat $PATH_CONFIGURE | jq -r '.setting.duration_time')
node_num=$(cat $PATH_CONFIGURE | jq -r '.setting.node_num')
model=$(cat $PATH_CONFIGURE | jq -r '.setting.model')
start=$(cat $PATH_CONFIGURE | jq -r '.setting.micro_graph.start')
end=$(cat $PATH_CONFIGURE | jq -r '.setting.micro_graph.end')
start2=$(cat $PATH_CONFIGURE | jq -r '.setting.micro_graph.start2')
end2=$(cat $PATH_CONFIGURE | jq -r '.setting.micro_graph.end2')
report_path=$(cat $PATH_CONFIGURE | jq -r '.stellar.path.result')

#str=$(cat report1.json | grep E3457BAD4DC783F45F6A4F60E7EFDDBFA24EC2EDD3C094029AC39ACB310D20D8)
#first_tx_time=$(echo $str | grep '[0-9]\{19,\}')
for i in "${array[@]}"
do
    path="$report_path/$model/R$i-T$DURATION_TIME/report1.json"    # testing time default : 1
    if [ -f "$path" ]; then
        node cal.js $node_num $i $DURATION_TIME $model
    else
        echo "path : $path doesnt exists"
    fi
done

rm -r /home/caideyi/report/$model/graph
mkdir -p /home/caideyi/report/$model/graph
for i in "${array[@]}"
do 
    path="$report_path/$model/R$i-T$DURATION_TIME/rec_data/node0/data"       # get micro data from node{0}  -> default 0
    if [ -d "$path" ]; then 
        len=$(cat $report_path/$model/R$i-T$DURATION_TIME/rec_data/node0/data/CpuMonitor | wc -l)
        echo $len
	    python3 cpuplot.py $start2 $len $i $model
    else
        echo "path : $path doesnt exists"
    fi
done

rm -r /home/caideyi/report/$model/graph_all_time
mkdir -p /home/caideyi/report/$model/graph_all_time
for i in "${array[@]}"
do 
    path="$report_path/$model/R$i-T$DURATION_TIME/rec_data/node0/data"       # get micro data from node{0}  -> default 0
    if [ -d "$path" ]; then 
        len=$(cat $report_path/$model/R$i-T$DURATION_TIME/rec_data/node0/data/CpuMonitor | wc -l)
        echo $len
	    python3 cpuplot.py $start $len $i $model
    else
        echo "path : $path doesnt exists"
    fi
done
