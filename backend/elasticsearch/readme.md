## 1.1 Setup
```sh
Install elasticsearch version >= 7.0 as fror pgsync intergration with postgres 14.
Older elasticsearch versions are single threaded and this introduces blocking which is not good for a distributed production system.
```
## 1.2 Dependencies
```sh
curl -fsSL https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee -a /etc/apt/sources.list.d/elastic-7.x.list
sudo apt update
```
## 1.3 Install
```sh
sudo apt install elasticsearch

```
## 1.4 Coditions
```sh
#[ENABLE] elasticsearch service
   sudo systemctl enable elasticsearch
#[RESTART] elasticsearch service
   sudo systemctl restart elasticsearch
#[STOP] elasticsearch service
   sudo systemctl stop elasticsearch
#[STATUS] elasticsearch service
   sudo systemctl status elasticsearch
```
## 1.5 Version
```sh
elasticsearch --version
```
## 1.7 Config 
```sh
sudo nano /etc/elasticsearch/elasticsearch.yml
#NETWORK CONFIGURATION
    network.host: 0.0.0.0
    http.port: 9200
    transport.host: localhost
    transport.tcp.port: 9300

sudo nano /etc/elasticsearch/jvm.options
#MEMORY CONFIGURATIONS
## IMPORTANT: JVM heap size
################################################################
##
## The heap size is automatically configured by Elasticsearch
## based on the available memory in your system and the roles
## each node is configured to fulfill. If specifying heap is
## required, it should be done through a file in jvm.options.d,
## and the min and max should be set to the same value. For
## example, to set the heap to 4 GB, create a new file in the
## jvm.options.d directory containing these lines:
## see https://medium.com/trendyol-tech/how-to-configure-elasticsearch-heap-size-to-change-max-memory-size-cb9ca016ce06
#For more information
-Xms4g 
-Xmx4g
#RESTART
   sudo systemctl restart elasticsearch 
#STATUS
   sudo systemctl status elasticsearch 
```
## 1.8 Ports 
```sh
elasticsearch --9200
sudo ufw allow 9200/tcp
sudo ufw allow 9200/udp
```
## 1.9 Testing
```sh
curl -X GET 'http://localhost:9200'
```
