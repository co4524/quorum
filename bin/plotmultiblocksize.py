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

all_test_data = []
title = []
txrate = []
txlen = []
tps = []
lantency = []
tpsvar = []
lantencyvar = []
tpserr = []
latencyerr = []
for i in range(len(model_list)):
    all_test_data.append([])
    with open(model_list[i],newline='') as csvfile:  
        rows = csv.reader(csvfile)
        for row in rows:
            all_test_data[i].append(row)
    title.append(all_test_data[i][0][0])
    txrate.append([float(i) for i in all_test_data[i][1][1:]])
    txlen.append([i+1 for i in range(len(txrate))])
    tps.append([float(i) for i in all_test_data[i][2][1:]])
    lantency.append([float(i)/1000 for i in all_test_data[i][3][1:]])
    tpsvar.append([float(i) for i in all_test_data[i][4][1:]])
    lantencyvar.append([float(i) for i in all_test_data[i][5][1:]])
    tpserr.append(np.sqrt(tpsvar[i]))
    latencyerr.append(np.sqrt(lantencyvar[i]))



plt.figure(figsize=(12,7))
x_lim=0
tps_y_lim=0
for i in range(len(model_list)):
    plt.errorbar(txrate[i],tps[i],marker=mark[i],markersize=10,yerr=tpserr[i],capsize=5,label=title[i])
    for j in range(len(txrate[i])):
        if(x_lim<int(txrate[i][j])):
            x_lim=int(txrate[i][j])
        if(tps_y_lim<int(tps[i][j])):
            tps_y_lim=int(tps[i][j])
plt.xlabel("InputTxRate(txs/s)")
plt.ylabel("Throughput(txs/s)")
plt.xlim(0,x_lim*1.2)
plt.ylim(0,tps_y_lim*1.2)
plt.title("InputTxRate/Throughput")
#plt.legend(bbox_to_anchor=(0.9, -0.04),ncol=2)
plt.legend(loc="upper left")
plt.savefig('graph/{0}_Tps.png'.format(plot_name))
plt.savefig('{0}/{1}_Tps.png'.format(result_path, plot_name))

plt.figure(figsize=(12,7))
latency_y_limit=0
for i in range(len(model_list)):
    plt.errorbar(txrate[i],lantency[i],marker=mark[i],markersize=10,yerr=latencyerr[i]/1000,capsize=5,label=title[i])
    for j in range(len(lantency[i])):
        if(latency_y_limit<float(lantency[i][j])):
            latency_y_limit=float(lantency[i][j])
plt.xlabel("InputTxRate(txs/s)")
plt.ylabel("Latency(s)")
plt.xlim(0,x_lim*x_axis_extend_ratio)
plt.ylim(0,latency_y_limit*y_axis_extend_ratio)
plt.yticks(np.arange(0,latency_y_limit*y_axis_extend_ratio,latency_y_limit*y_axis_extend_ratio/10))
plt.title("InputTxRate/Latency")
#plt.legend(bbox_to_anchor=(0.9, -0.04),ncol=2)
plt.legend(loc="upper left")
plt.savefig('graph/{0}_Latency.png'.format(plot_name))
plt.savefig('{0}/{1}_Latency.png'.format(result_path, plot_name))
