import numpy as np
import json
import matplotlib as mpl
mpl.use('Agg')
from matplotlib import pyplot as plt
import csv,sys

with open('../configure.json' , 'r') as reader:
    config = json.loads(reader.read())

consensus = config['setting']['consensus']
report_path = config[consensus]['path']['result']
duration_time = config['setting']['duration_time']
inargv = sys.argv
start = int(inargv[1])
end = int(inargv[2])
input_rate = inargv[3]
model = inargv[4]
path = inargv[5]

process_data = []
cpu_data=[]
io_data=[]
web_data=[]

with open('{0}/ProcessMonitor'.format(path),newline='') as processfile:
    rows = csv.reader(processfile)
    for row in rows:
        process_data.append(row)
with open('{0}/CpuMonitor'.format(path),newline='') as cpufile:
    rows = csv.reader(cpufile)
    for row in rows:
        cpu_data.append(row)
with open('{0}/IoMonitor'.format(path),newline='') as iofile:
    rows = csv.reader(iofile)
    for row in rows:
        io_data.append(row)
with open('{0}/WebMonitor'.format(path),newline='') as webfile:
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


plt.figure(figsize=(12,7))
plt.subplot(221) 
plt.plot(t,cpu,label="CPU%(Single CPU)")
plt.title('{0}/R{1}-T{2}'.format(model, input_rate, duration_time))
plt.legend(loc='upper right')

plt.subplot(222) 
plt.plot(t,total_cpu,label="CPU%(Total)")
plt.plot(t,mem,label="MEM%")
ytick = np.arange(0,105,5)
plt.yticks(ytick)
plt.title("Total CPU%")
plt.legend(loc='upper right')

plt.subplot(223)
plt.plot(t,io_read,color="blue",label="read(Kbyte)")
plt.plot(t,io_write,color="green",label="write(Kbyte)")
plt.xlabel("Time(s)")
plt.title("Total I/O")
plt.legend(loc='upper right')

plt.subplot(224) 
plt.plot(t,web_sent,label="sent(Kbyte)")
plt.plot(t,web_recv,label="recv(Kbyte)")
plt.xlabel("Time(s)")
plt.title("Total Network")
plt.legend(loc='upper right')

plt.savefig('{0}/{1}/graph/R{2}-T{3}.png'.format(report_path, model, input_rate, duration_time))
plt.savefig('graph/R{0}-T{1}.png'.format(input_rate, duration_time))

