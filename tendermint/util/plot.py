import numpy as np
import matplotlib.pyplot as plt
import csv

all_test_data = []
with open('/home/caideyi/benchmark_v2/tendermint/res/graph',newline='') as csvfile: 
    rows = csv.reader(csvfile)
    for row in rows:
        all_test_data.append(row)

title = all_test_data[0][0]
txrate = [str(i) for i in all_test_data[1][1:]]
txlen = [i+1 for i in range(len(txrate))]
tps = [float(i) for i in all_test_data[2][1:]]
lantency = [float(i) for i in all_test_data[3][1:]]
tpsvar = [float(i) for i in all_test_data[4][1:]]
lantencyvar = [float(i) for i in all_test_data[5][1:]]
tpserr = np.sqrt(tpsvar)
latencyerr = np.sqrt(lantencyvar)


plt.figure(figsize=(12,5))
plt.title('Benchmarking')
plt.subplot(121) 
plt.errorbar(txrate,tps,yerr=tpserr,label="TPS:TxRate")
plt.xlabel("TxRate(txs/s)")
plt.ylabel("TPS(txs/s)")
plt.title(title)
plt.scatter(txrate,tps,s=30, c='red', alpha=.7)
plt.ylim(0,13000)
plt.legend(loc='lower right')
plt.savefig("latency",dpi=600)


plt.subplot(122)
plt.errorbar(txrate,lantency,yerr=latencyerr,label="Latency:TxRate")
plt.xlabel("TxRate(txs/s)")
plt.ylabel("Latency(ms)")
plt.title(title)
plt.scatter(txrate,lantency,s=30, c='red', alpha=.7)
plt.legend(loc='lower right')
plt.savefig("tps",dpi=600)