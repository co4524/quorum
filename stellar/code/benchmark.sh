array=(
100
200
300
400
500
)
DURATION_TIME=60
Benchmark() {
	for i in "${array[@]}"
	do
		./oneRoundTesting.sh $i
	done
}

Benchmark
