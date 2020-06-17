array=(
100
200
300
400
500
600
700
800
900
1000
1100
1200
)

DURATION_TIME=60
Benchmark() {
	for i in "${array[@]}"
	do
		./oneRoundTesting.sh $i 
	done
}

Benchmark
#DURATION_TIME=120
#Benchmark
