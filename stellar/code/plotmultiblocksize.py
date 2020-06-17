import numpy as np
import matplotlib as mpl
mpl.use('Agg')
from matplotlib import pyplot as plt
import csv,sys

plot_name=sys.argv[1]
model_list=sys.argv[2:]

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
for i in range(len(model_list)):
    plt.errorbar(txrate[i],tps[i],marker='o',markersize=3,yerr=tpserr[i],capsize=5,label=title[i])
plt.xlabel("InputTxRate(txs/s)")
plt.ylabel("Throughput(txs/s)")
plt.xlim(0,500)
plt.ylim(0,500)
plt.title("InputTxRate/Throughput")
#plt.legend(bbox_to_anchor=(0.9, -0.04),ncol=2)
plt.legend(loc="upper left")
plt.savefig('{0}_Tps.png'.format(plot_name))

plt.figure(figsize=(12,7))
for i in range(len(model_list)):
    plt.errorbar(txrate[i],lantency[i],marker='o',markersize=3,yerr=latencyerr[i]/1000,capsize=5,label=title[i])
plt.xlabel("InputTxRate(txs/s)")
plt.ylabel("Latency(s)")
plt.xlim(0,500)
plt.ylim(0,15)
plt.yticks(np.arange(0,15,2))
plt.title("InputTxRate/Latency")
#plt.legend(bbox_to_anchor=(0.9, -0.04),ncol=2)
plt.legend(loc="upper left")
plt.savefig('{0}_Latency.png'.format(plot_name))
