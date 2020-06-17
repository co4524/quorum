import psutil,time,os,sys
pids = sys.argv[1:] #-----set PIDs-----
processes = []
fp = open('/home/caideyi/microData/ProcessMonitor', 'w') #-----set Processlog Path-----
fcpu = open('/home/caideyi/microData/CpuMonitor', 'w') #-----set Cpulog Path-----
fio = open('/home/caideyi/microData/IoMonitor', 'w') #-----set IOlog Path-----
fn = open('/home/caideyi/microData/WebMonitor', 'w') #-----set Weblog Path-----
fcpum = open('/home/caideyi/microData/CmpSCP.txt','a') #for compare with GCP
count = 0                      #for compare with GCP
cpusum = 0                     #for compare with GCP
for pid in pids:
    processes.append(psutil.Process(int(pid)))
ioread = psutil.disk_io_counters().read_bytes
iowrite = psutil.disk_io_counters().write_bytes
netsent = psutil.net_io_counters().bytes_sent
netrecv = psutil.net_io_counters().bytes_recv
t = int(time.time())
print('start monitor')
while(1):
    if int(time.time())==t+1:
        timestamp = time.time()
        t = int(timestamp)
        for process in processes:
            fp.write("{time},{name},{cpu},{mem}\n".format(time=round(timestamp,3), name=process.name(),cpu=process.cpu_percent(),mem=process.memory_percent()))
        cpu_per = psutil.cpu_percent()
        fcpu.write("{time},{cpu}\n".format(time=t,cpu=cpu_per))
        #for compare with GCP ↓↓↓↓↓↓↓↓↓↓
        count+=1
        cpusum +=cpu_per
        if count==60:
            fcpum.write("{time} CPU : {cpu}\n".format(time=time.asctime(time.localtime(timestamp)),cpu=cpusum/60))
            count = 0
            cpusum = 0
        #for compare with GCP ↑↑↑↑↑↑↑↑↑↑
        ioreadtemp = psutil.disk_io_counters().read_bytes
        iowritetemp = psutil.disk_io_counters().write_bytes
        fio.write("{time},{r:>7},{w:>7}\n".format(time=round(timestamp,3), r=ioreadtemp - ioread,w=iowritetemp - iowrite))
        ioread = ioreadtemp
        iowrite = iowritetemp
        netsenttemp = psutil.net_io_counters().bytes_sent
        netrecvtemp = psutil.net_io_counters().bytes_recv
        fn.write("{time},{s},{r}\n".format(time=round(timestamp,3),s=netsenttemp - netsent,r=netrecvtemp - netrecv))
        netsent = netsenttemp
        netrecv = netrecvtemp
    time.sleep(0.1)
