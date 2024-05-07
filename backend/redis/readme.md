# SETUP
```
Install redis-server version >= 6.0 as multithreading is mandatory.
Older redis-server versions are single threaded and this introduces blocking which is not good for a distributed production system.
```
# Dependencies
```
sudo apt install default-jre
sudo apt install pkg-config
sudo add-apt-repository ppa:chris-lea/redis-server
sudo apt-get update 
```
# INSTALL
```
sudo apt-get install redis-server -y
```
# CONDITIONS 
```
#[ENABLE] redis-server service
   sudo systemctl enable redis-server.service
#[RESTART] redis-server service
   sudo systemctl restart redis-server.service
#[STOP] redis-server service
   sudo systemctl stop redis-server.service
#[STATUS] redis-server service
   sudo systemctl status redis-server.service
```
# VERSION
```
redis-server --version
```
# CONFIG 
```
sudo nano /etc/redis/redis.conf
#REMOTE CONNECTION
   [BEFORE] bind 127.0.0.1
   [AFTER]  bind 0.0.0.0
#MULTHTHREADING
   [BEFORE] # io-threads 4
   [AFTER]  io-threads [TOTAL THREADS - 2]
#READS
   [BEFORE] io-threads-do-reads no
   [AFTER]  io-threads-do-reads yes
#RESTART
   sudo systemctl restart redis-server.service 
#STATUS
   sudo systemctl status redis-server.service 
```
# PORTS 
```
redis --6379
sudo ufw allow 6379/tcp
sudo ufw allow 6379/udp
```

#  hiredis
```
git clone https://github.com/redis/hiredis.git
cd hiredis
make
sudo make install
```

#  redis-plus-plus
```
git clone https://github.com/sewenew/redis-plus-plus.git
cd redis-plus-plus
mkdir build
cd build
cmake ..
make
sudo make install
```
