import numpy as np
import matplotlib as mpl
mpl.use('Agg')
from matplotlib import pyplot as plt
import csv,sys

inargv = sys.argv
start = int(inargv[1])
end = int(inargv[2])
input_rate = int(inargv[3])
model = inargv[4]

#處理data
process_data = []
cpu_data=[]
io_data=[]
web_data=[]
f = open('Mean.txt', 'w', encoding = 'UTF-8')
with open('/home/caideyi/report/{0}/R{1}-T60/rec_data/node0/data/ProcessMonitor'.format(model, input_rate),newline='') as processfile:  ##讀取data
    rows = csv.reader(processfile)
    for row in rows:
        process_data.append(row)
with open('/home/caideyi/report/{0}/R{1}-T60/rec_data/node0/data/CpuMonitor'.format(model, input_rate),newline='') as cpufile:  ##讀取data
    rows = csv.reader(cpufile)
    for row in rows:
        cpu_data.append(row)
with open('/home/caideyi/report/{0}/R{1}-T60/rec_data/node0/data/IoMonitor'.format(model, input_rate),newline='') as iofile:  ##讀取data
    rows = csv.reader(iofile)
    for row in rows:
        io_data.append(row)
with open('/home/caideyi/report/{0}/R{1}-T60/rec_data/node0/data/WebMonitor'.format(model, input_rate),newline='') as webfile:  ##讀取data
    rows = csv.reader(webfile)
    for row in rows:
        web_data.append(row)
t=[]
cpu=[]
mem=[]
process_name = process_data[0][1]
total_cpu=[]
io_read=[]
io_write=[]
web_sent=[]
web_recv=[]
shift = start
for i in range(end-start):
    t.append(i)
    cpu.append(float(process_data[i+shift][2]))
    mem.append(float(process_data[i+shift][3]))
    total_cpu.append(float(cpu_data[i+shift][1]))
    io_read.append(float(io_data[i+shift][1])/1000)
    io_write.append(float(io_data[i+shift][2])/1000)
    web_sent.append(float(web_data[i+shift][1])/1000)
    web_recv.append(float(web_data[i+shift][2])/1000)

#處理data
    
#輸出區間平均
f.write('{start},{end}\n'.format(start=start,end=end))
f.write('{process_name},{cpu},{mem}\n'.format(process_name=process_name,cpu=np.mean(cpu),mem=np.mean(mem)))
f.write('{tcpu}\n'.format(tcpu=np.mean(total_cpu)))
f.write('{tread},{twrite}\n'.format(tread=np.mean(io_read),twrite=np.mean(io_write)))
f.write('{tsent},{trecv}\n'.format(tsent=np.mean(web_sent),trecv=np.mean(web_recv)))
f.close()


#畫圖
plt.figure(figsize=(12,7))
plt.subplot(221) #size為 row:2 col:2 共4張圖
plt.plot(t,cpu,label="CPU%(Single CPU)")
plt.title('{0}/R{1}-T60'.format(model, input_rate))
plt.legend(loc='upper right')

plt.subplot(222) #size為 row:2 col:2 共4張圖
plt.plot(t,total_cpu,label="CPU%(Total)")
plt.plot(t,mem,label="MEM%")
ytick = np.arange(0,105,5)
plt.yticks(ytick)
plt.title("Total CPU%")
plt.legend(loc='upper right')

plt.subplot(223) #size為 row:2 col:2 共4張圖
plt.plot(t,io_read,color="blue",label="read(Kbyte)")
plt.plot(t,io_write,color="green",label="write(Kbyte)")
plt.xlabel("Time(s)")
plt.title("Total I/O")
plt.legend(loc='upper right')

plt.subplot(224) #size為 row:2 col:2 共4張圖
plt.plot(t,web_sent,label="sent(Kbyte)")
plt.plot(t,web_recv,label="recv(Kbyte)")
plt.xlabel("Time(s)")
plt.title("Total Network")
plt.legend(loc='upper right')

#plt.show()
if (start==0):
    plt.savefig('/home/caideyi/report/{0}/graph_all_time/R{1}-T60.png'.format(model, input_rate))
    plt.savefig('graph_all_time/R{0}-T60.png'.format(input_rate))

else:
    plt.savefig('/home/caideyi/report/{0}/graph/R{1}-T60.png'.format(model, input_rate))
    plt.savefig('graph/R{0}-T60.png'.format(input_rate))
