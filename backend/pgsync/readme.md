# SETUP
```
    pip3 install pgsync
```
#ENV VARIABLE
```
    ls -a
    sudo nano .bashrc 
    export PATH="/bin:/PATH_TO/.local/bin:$PATH"
    source .bashrc
```
# INDEX DB
```
    bootstrap --config /PATH_TO/schema.json
    pgsync
```
# LIST indices [ELASTICSEARCH]
```
     curl -X GET "localhost:9200/_cat/indices?pretty"
     
    green  open .geoip_databases HqTr6MczS9mLv-MLUcXNWA 1 0 41 0 38.8mb 38.8mb
    yellow open idxpkdb          URn8qBZgRG2BoFQ85bDf2g 1 1  0 0   226b   226b
    yellow open idxbtsdb         yE3w7FOET72dpwfIXx8HHg 1 1  0 0   226b   226b
    yellow open idxtfdb          xumCOkzKRnWCija-mBOQsQ 1 1  0 0   226b   226b
    yellow open idxpsndb         JjlRDtFqQyS1v19z8vZmvw 1 1  0 0   226b   226b
    yellow open idxwtdb          IEds6DkAR0OiW5W4sGGrBw 1 1  0 0   226b   226b

```
# GET SPECIFIC INDEX [ELASTICSEARCH]
```
    curl -XGET "https://localhost:9200/_idxbedb" -d'
    curl -XGET "https://localhost:9200/<index name>" -d'
```
# DELETE SPECIFIC INDEX 
```
    curl -XDELETE localhost:9200/idxtedb
    curl -XDELETE localhost:9200/<index name>
```
# DELETE SPECIFIC INDEX [POSTGRES]
```
    rm.postgre_idxtedb
    rm .<database name>_<index name>
```
