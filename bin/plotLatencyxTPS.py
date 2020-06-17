import numpy as np
import matplotlib as mpl
mpl.use('Agg')
from matplotlib import pyplot as plt
import csv,sys
import json
with open('../configure.json' , 'r') as reader:
    config = json.loads(reader.read())

mark = ['o' , '^' , 's' , '*' , 'X' , '8' , 'P' , 'D' , 'h' , 'x']

x_axis_extend_ratio=float(config['setting']['x_axis_extend_ratio'])
y_axis_extend_ratio=float(config['setting']['y_axis_extend_ratio'])
result_path=sys.argv[1]
plot_name=sys.argv[2]
model_list=sys.argv[3:]

#處理data
all_test_data = []
title = []
txrate = []
txlen = []
tps = []
latency = []
tpsvar = []
latencyvar = []
tpserr = []
latencyerr = []
for i in range(len(model_list)):
    all_test_data.append([])
    with open(model_list[i],newline='') as csvfile:  ##讀取data
        rows = csv.reader(csvfile)
        for row in rows:
            all_test_data[i].append(row)
    title.append(all_test_data[i][0][0])
    txrate.append([int(i) for i in all_test_data[i][1][1:]])
    txlen.append([i+1 for i in range(len(txrate))])
    tps.append([float(i) for i in all_test_data[i][2][1:]])
    latency.append([float(i)/1000 for i in all_test_data[i][3][1:]])
    tpsvar.append([float(i) for i in all_test_data[i][4][1:]])
    latencyvar.append([float(i) for i in all_test_data[i][5][1:]])
    tpserr.append(np.sqrt(tpsvar[i]))
    latencyerr.append(np.sqrt(latencyvar[i]))
#處理data

#畫圖
plt.figure(figsize=(12,7))
x_lim=1000
y_lim=0
#plt.subplot(121) #size為 row:1 col:2 共2張圖
for i in range(len(model_list)):
    plt.errorbar(tps[i],latency[i],marker=mark[i],markersize=10,capsize=5,label=title[i])
for i in range(len(model_list)):
    for j in range(len(latency[i])):
        plt.text(tps[i][j],latency[i][j],str(txrate[i][j]), fontsize=8)
        if(x_lim<int(txrate[i][j])):
            x_lim=int(txrate[i][j])
        if(y_lim<float(latency[i][j])):
            y_lim=float(latency[i][j])

plt.ylabel("Latency(s)")
plt.xlabel("Throughput(txs/s)")
plt.ylim(0,y_lim*y_axis_extend_ratio)
plt.yticks(np.arange(0,y_lim*y_axis_extend_ratio,y_lim*y_axis_extend_ratio/10))
plt.xlim(0,x_lim*x_axis_extend_ratio)
plt.title("Throughput/Latency")
plt.legend(bbox_to_anchor=(1.0, -0.04),ncol=2)
#plt.show()
plt.savefig('{0}/{1}_LatencyxThroughput.png'.format(result_path, plot_name))
plt.savefig('graph/{0}_LatencyxThroughput.png'.format(plot_name))