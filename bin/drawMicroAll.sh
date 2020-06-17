txRate=$1
dir=$2
model_name=$3
node_number=$4
iter=`expr $node_number - 1`

for node_index in $(seq 0 $iter)
do  
    node modconfig.js $node_index $dir $model_name $node_number
    sh drawFail.sh "$txRate-NODE$node_index-$model_name"
done
