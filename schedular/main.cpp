#pragma once
#include <set>
#include <array>
#include <thread>
#include <chrono>
#include <vector>
#include <time.h>
#include <string>
#include <stdio.h>
#include <iterator>
#include <unistd.h>
#include "stdlib.h"
#include <numeric>
#include <fstream>
#include <iostream>
#include <stdlib.h>
#include <sys/stat.h>
#include <curl/curl.h>
#include <sys/types.h>
#include <condition_variable>
#include <experimental/filesystem>
#include <sw/redis++/redis++.h>

#include <date/date.h>
#include "include/libcron/Cron.h"
#include "include/libcron/CronData.h"

#include <tbb/parallel_for.h>
#include "tbb/concurrent_queue.h"
#include "tbb/concurrent_hash_map.h"

using namespace libcron;
using namespace date;
using namespace std;
using namespace tbb;
using namespace std::chrono;
using namespace sw::redis;

struct  ADVERT{
  std::string  msg;
};

static size_t WriteCallback(void *contents, size_t size, size_t nmemb, void *userp)
{
    ((std::string*)userp)->append((char*)contents, size * nmemb);
    return size * nmemb;
}

libcron::Cron cron;
Redis *_redis = new Redis("tcp://127.0.0.1:6379");

int main()
{ 
  #pragma region
    int ADVERT_COUNT = 1;  
    concurrent_queue<ADVERT> *Input;
    std::vector<concurrent_queue<ADVERT>*>IN_QUEUE;
    struct ADVERT *INPUT_STRUCTS = ( struct ADVERT  *) malloc(ADVERT_COUNT * sizeof(struct ADVERT));
    for(int i; i < ADVERT_COUNT; i ++){
      Input = new concurrent_queue<ADVERT>;
      IN_QUEUE.push_back(Input);
    }
    std::string IN_STRING[ADVERT_COUNT ];
    std::string OUT_STRING[ADVERT_COUNT ];
  #pragma endregion

  #pragma region
    auto  GRAB_QUERY = [&IN_STRING,&IN_QUEUE,&INPUT_STRUCTS,&OUT_STRING](const std::string& K){
          auto sub = _redis->subscriber();
          sub.unsubscribe("broadcast");
          sub.on_message([&IN_STRING,&IN_QUEUE,&INPUT_STRUCTS,&OUT_STRING](std::string channel, std::string msg) {

          if(channel=="broadcast"){
            msg.erase(std::remove(msg.begin(), msg.end(), '"'), msg.end());
            ADVERT _IN_ADVERT ={msg};
            IN_QUEUE[0]->push(_IN_ADVERT);

          }
        });
        // Subscribe to multiple channels
          sub.subscribe({"broadcast"});

          // Consume messages in a loop.
          while (true) {
              try {
                  sub.consume();
              } catch (...) {
                  // Handle exceptions.
              }
          }
    };
  #pragma endregion

  #pragma region
    auto  SCHEDULE_ADS = [&IN_QUEUE,&INPUT_STRUCTS](const std::string& K){
      
          while (true){
              //if(IN_QUEUE.size() > 0){
                  bool ok = IN_QUEUE[0]->try_pop(INPUT_STRUCTS[0]);
                  if(ok){
         
                      #pragma region

                          //ADVERT_TYPE
                          std::string SCHEDULAR_NAME_METRIC = INPUT_STRUCTS[0].msg;
                          int SCHEDULAR_NAME_POS = SCHEDULAR_NAME_METRIC.find(":");
                          std::string SCHEDULAR_NAME = SCHEDULAR_NAME_METRIC.substr(0 , SCHEDULAR_NAME_POS);
                          std::string SCHEDULAR_NAME_ERASE= SCHEDULAR_NAME + ":";
                          //SCHEDULAR_TIME_SEC
                          std::string SCHEDULAR_TIME_SEC_METRIC=SCHEDULAR_NAME_METRIC.erase(0,SCHEDULAR_NAME_ERASE.length());
                          int SCHEDULAR_TIME_SEC_POS = SCHEDULAR_TIME_SEC_METRIC.find(":");
                          std::string SCHEDULAR_TIME_SEC = SCHEDULAR_TIME_SEC_METRIC.substr(0 , SCHEDULAR_TIME_SEC_POS);
                          std::string SCHEDULAR_TIME_SEC_ERASE= SCHEDULAR_TIME_SEC + ":";
                          //SCHEDULAR_TIME_MIN
                          std::string SCHEDULAR_TIME_MIN_METRIC=SCHEDULAR_TIME_SEC_METRIC.erase(0,SCHEDULAR_TIME_SEC_ERASE.length());
                          int SCHEDULAR_TIME_MIN_POS = SCHEDULAR_TIME_MIN_METRIC.find(":");
                          std::string SCHEDULAR_TIME_MIN = SCHEDULAR_TIME_MIN_METRIC.substr(0 , SCHEDULAR_TIME_MIN_POS);
                          std::string SCHEDULAR_TIME_MIN_ERASE= SCHEDULAR_TIME_MIN + ":";
                          //SCHEDULAR_TIME_HRS
                          std::string SCHEDULAR_TIME_HRS_METRIC=SCHEDULAR_TIME_MIN_METRIC.erase(0,SCHEDULAR_TIME_MIN_ERASE.length());
                          int SCHEDULAR_TIME_HRS_POS = SCHEDULAR_TIME_HRS_METRIC.find(":");
                          std::string SCHEDULAR_TIME_HRS = SCHEDULAR_TIME_HRS_METRIC.substr(0 , SCHEDULAR_TIME_HRS_POS);
                          std::string SCHEDULAR_TIME_HRS_ERASE= SCHEDULAR_TIME_HRS + ":";
                          //SCHEDULAR_TIME_DOM
                          std::string SCHEDULAR_TIME_DOM_METRIC=SCHEDULAR_TIME_HRS_METRIC.erase(0,SCHEDULAR_TIME_HRS_ERASE.length());
                          int SCHEDULAR_TIME_DOM_POS = SCHEDULAR_TIME_DOM_METRIC.find(":");
                          std::string SCHEDULAR_TIME_DOM = SCHEDULAR_TIME_DOM_METRIC.substr(0 , SCHEDULAR_TIME_DOM_POS);
                          std::string SCHEDULAR_TIME_DOM_ERASE= SCHEDULAR_TIME_DOM + ":";
                          //SCHEDULAR_TIME_MNT
                          std::string SCHEDULAR_TIME_MNT_METRIC=SCHEDULAR_TIME_DOM_METRIC.erase(0,SCHEDULAR_TIME_DOM_ERASE.length());
                          int SCHEDULAR_TIME_MNT_POS = SCHEDULAR_TIME_MNT_METRIC.find(":");
                          std::string SCHEDULAR_TIME_MNT = SCHEDULAR_TIME_MNT_METRIC.substr(0 , SCHEDULAR_TIME_MNT_POS);
                          std::string SCHEDULAR_TIME_MNT_ERASE= SCHEDULAR_TIME_MNT + ":";
                          //SCHEDULAR_TIME_DOW
                          std::string SCHEDULAR_TIME_DOW_METRIC=SCHEDULAR_TIME_MNT_METRIC.erase(0,SCHEDULAR_TIME_MNT_ERASE.length());
                          int SCHEDULAR_TIME_DOW_POS = SCHEDULAR_TIME_DOW_METRIC.find(":");
                          std::string SCHEDULAR_TIME_DOW = SCHEDULAR_TIME_DOW_METRIC.substr(0 , SCHEDULAR_TIME_DOW_POS);
                          std::string SCHEDULAR_TIME_DOW_ERASE= SCHEDULAR_TIME_DOW + ":";
                          //BILLBOARD_IP
                          std::string BILLBOARD_IP_METRIC = SCHEDULAR_TIME_DOW_METRIC.erase(0,SCHEDULAR_TIME_DOW_ERASE.length());
                          int BILLBOARD_IP_POS = BILLBOARD_IP_METRIC.find(":");
                          std::string BILLBOARD_IP = BILLBOARD_IP_METRIC.substr(0 , BILLBOARD_IP_POS);
                          std::string BILLBOARD_IP_ERASE= BILLBOARD_IP + ":";
                          //BILLBOARD_QUERY
                          std::string BILLBOARD_QUERY=BILLBOARD_IP_METRIC.erase(0,BILLBOARD_IP_ERASE.length());
                          //"3 * * * * ?"
                          std::string SCHEDULES = SCHEDULAR_TIME_SEC + " " + SCHEDULAR_TIME_MIN + " " + SCHEDULAR_TIME_HRS + " "+ SCHEDULAR_TIME_DOM + " " + SCHEDULAR_TIME_MNT + " " + SCHEDULAR_TIME_DOW;
                          std::cout<< " BILLBOARD_QUERY " << BILLBOARD_QUERY << " SCHEDULES " << SCHEDULES <<" BILLBOARD _IP " << BILLBOARD_IP << " SCHEDULAR_NAME " << SCHEDULAR_NAME<< std::endl;
                          
                          cron.add_schedule(SCHEDULAR_NAME,SCHEDULES , [=](auto&) {
                            
                            CURL *curl;
                            CURLcode res;
                            std::string readBuffer;
                            curl_global_init(CURL_GLOBAL_ALL);
                            curl = curl_easy_init();
                            std::string url = "http://"+BILLBOARD_IP+":5007/api/billboard/ads/submit";
                            std::string data = "{'query':'"+BILLBOARD_QUERY+"'}";

                            if(curl) {
                              curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
                              struct curl_slist* chunk = NULL;
                              chunk = curl_slist_append(chunk, "Content-Type: application/json; charset: utf-8");
                              chunk = curl_slist_append(chunk, "Accept: application/json");

                              curl_easy_setopt(curl, CURLOPT_HTTPHEADER, chunk);
                              curl_easy_setopt(curl, CURLOPT_POST, 1L);
                              curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data.c_str());
                              curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
                              curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
                              res = curl_easy_perform(curl);
                              curl_easy_cleanup(curl);

                              std::cout << " BYE " << readBuffer << std::endl;
                              std::cout << " =======BILLBOARD IP==== " << BILLBOARD_IP <<std::endl;
                            }
                            curl_global_cleanup();
                              
                          });
                          //cron.tick();
                          //std::this_thread::sleep_for(500ms);
                        
                      #pragma endregion

                      ok = IN_QUEUE[0]->try_pop(INPUT_STRUCTS[0]);
                      IN_QUEUE[0]->clear();
                  }
                  cron.tick();
              //}
          }
    };
  #pragma endregion

  #pragma region
    auto  CRON_TICKER = [](const std::string& K){
        cron.tick();
        std::this_thread::sleep_for(500ms);
    };
  #pragma endregion

#pragma region
  
  //THREADS

  thread Q(std::thread(GRAB_QUERY, "QUERY_CHANNEL"));
  thread P(std::thread(SCHEDULE_ADS, "ADS_CHANNEL"));
  //thread O(std::thread(CRON_TICKER,"CRON_CHANNEL"));
  // join all the threads
  Q.join();
  P.join();
  //O.join();

#pragma endregion

  return 0;
}