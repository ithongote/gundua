#include <array>
#include <thread>
#include <stdio.h>
#include <chrono>
#include <vector>
#include <time.h>
#include <cstdlib>
#include <spawn.h>
#include <iostream>
#include <iterator>
#include <unistd.h>
#include "stdlib.h"
#include <mutex>
#include <condition_variable>

#include <string>
#include <cstring>
#include <sstream>
#include <fstream>
#include <algorithm> 

#include <stdlib.h>
#include <sys/stat.h>
#include <sys/types.h>

#include <cstdint>
#include <memory>
#include <curl/curl.h>
#include <json/json.h>


#include "QrToPng.h"

#include <experimental/filesystem>

#include <tbb/parallel_for.h>
#include "tbb/concurrent_queue.h"
#include "tbb/concurrent_hash_map.h"


using namespace std;
using namespace tbb;
using namespace std::chrono_literals;

static size_t WriteCallback(void *contents, size_t size, size_t nmemb, void *userp)
{
    ((std::string*)userp)->append((char*)contents, size * nmemb);
    return size * nmemb;
}

namespace
{
    std::size_t callback(
            const char* in,
            std::size_t size,
            std::size_t num,
            std::string* out)
    {
        const std::size_t totalBytes(size * num);
        out->append(in, totalBytes);
        return totalBytes;
    }
}

struct  QR_STRING{
   std::string  *qrsting;
};

int main() {

        #pragma region

            int QUERY_COUNT = 1;

            concurrent_queue<QR_STRING> *qput;

            vector<concurrent_queue<QR_STRING>*>QR_QUEUE;

            std::string IN_STRING[QUERY_COUNT ];
            std::string OUT_STRING[QUERY_COUNT ];

            struct QR_STRING *QR_STRUCTS = ( struct QR_STRING  *) malloc(QUERY_COUNT * sizeof(struct QR_STRING));

            for(int i; i < QUERY_COUNT; i ++){
                qput = new concurrent_queue<QR_STRING>;
                QR_QUEUE.push_back(qput);
            }

        #pragma endregion

        #pragma region

            auto  GRAB_QUERY = [&IN_STRING,&QR_QUEUE,&OUT_STRING](const std::string& K){
                while (true)
                {
                    #pragma region

                        //usleep(1);
                        const std::string url("http://127.0.0.1:5008/api/qrcode/create");

                        CURL* curl = curl_easy_init();

                        // Set remote URL.
                        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());

                        // Don't bother trying IPv6, which would increase DNS resolution time.
                        curl_easy_setopt(curl, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);

                        // Don't wait forever, time out after 10 seconds.
                        curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10);

                        // Follow HTTP redirects if necessary.
                        curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);

                        // Response information.
                        long httpCode(0);
                        std::unique_ptr<std::string> httpData(new std::string());

                        // Hook up data handling function.
                        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, callback);

                        // Hook up data container (will be passed as the last parameter to the
                        // callback handling function).  Can be any pointer type, since it will
                        // internally be passed as a void pointer.
                        curl_easy_setopt(curl, CURLOPT_WRITEDATA, httpData.get());

                        // Run our HTTP GET command, capture the HTTP response code, and clean up.
                        curl_easy_perform(curl);
                        curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &httpCode);
                        curl_easy_cleanup(curl);

                    #pragma endregion

                    #pragma region

                    if (httpCode == 200)
                    {
                        //std::cout << "\nGot successful response from " << url << std::endl;

                        // Response looks good - done using Curl now.  Try to parse the results
                        // and print them out.
                        Json::Value jsonData;
                        Json::Reader jsonReader;

                        if (jsonReader.parse(*httpData.get(), jsonData))
                        {
                            //METRICS
                            const std::string captured_data(jsonData["result"].asString());
                            std::string QUERY = captured_data;
                            
                            if(QUERY=="SIGNAL_OFF"){
                                //std::cout << " QUED ---I--- DATA " << captured_data  << std::endl;
                            }else{

                                std::cout << " QUED ---I--- DATA " << captured_data  << std::endl;
                                
                                IN_STRING[0] = captured_data;

                                QR_STRING _QR_STRING ={&IN_STRING[0]};
                                QR_QUEUE[0]->push(_QR_STRING);
                              
                            }
                        }
                        else
                        {
                            std::cout << "Could not parse HTTP data as JSON" << std::endl;
                            std::cout << "HTTP data was:\n" << *httpData.get() << std::endl;
                        // return 1;
                        }
                    }
                    else
                    {
                        std::cout << "Couldn't GET from " << url << " - exiting" << std::endl;
                        //return 1;
                    }
                    #pragma endregion
                }
            };

        #pragma endregion

        #pragma region

            auto  QRCODE = [&QR_QUEUE,&QR_STRUCTS](const std::string& K){
            
                while (true){
                    if(QR_QUEUE.size() > 0){
                        bool ok = QR_QUEUE[0]->try_pop(QR_STRUCTS[0]);
                        if(ok){

                            #pragma region

                                //QRCODE_PARAM
                                std::string QRCODE_NAME_METRIC = *(QR_STRUCTS[0]).qrsting;

                                std::cout << " QRCODE_NAME_METRIC " << QRCODE_NAME_METRIC << std::endl;
                                //QRCODE_DESC
                                int QRCODE_NAME_POS = QRCODE_NAME_METRIC.find(":");
                                std::string QRCODE_NAME = QRCODE_NAME_METRIC.substr(0 , QRCODE_NAME_POS);
                                std::string QRCODE_NAME_ERASE= QRCODE_NAME + ":";
                                //QRCODE_DEST
                                std::string QRCODE_DEST_METRIC=QRCODE_NAME_METRIC.erase(0,QRCODE_NAME_ERASE.length());
                                int QRCODE_DEST_POS = QRCODE_DEST_METRIC.find(":");
                                std::string QRCODE_DEST = QRCODE_DEST_METRIC.substr(0 , QRCODE_DEST_POS);
                                std::string QRCODE_DEST_ERASE= QRCODE_DEST + ":";
                                //QRCODE_IMG
                                std::string QRCODE_IMG_METRIC=QRCODE_DEST_METRIC.erase(0,QRCODE_DEST_ERASE.length());
                                int QRCODE_IMG_POS = QRCODE_IMG_METRIC.find(":");
                                std::string QRCODE_IMG = QRCODE_IMG_METRIC.substr(0 , QRCODE_IMG_POS);
                                std::string QRCODE_IMG_ERASE= QRCODE_IMG + ":";

                                std::cout << " NAME  " << QRCODE_NAME   << std::endl;
                                std::cout << " DEST  " << QRCODE_DEST   << std::endl;
                                std::cout << " IMAGE " << QRCODE_IMG    << std::endl;
                                //SCHEDULAR_TIME_MIN
                                
                                std::string qrText = QRCODE_DEST;
                                std::string fileName = QRCODE_IMG+".png";

                                int imgSize = 1080;
                                int minModulePixelSize = 20;
                                auto exampleQrPng1 = QrToPng(fileName, imgSize, minModulePixelSize, qrText, true, qrcodegen::QrCode::Ecc::MEDIUM);

                                std::cout << "Writing Example QR code 1 (normal) to " << fileName << " with text: '" << qrText << "', size: " <<
                                        imgSize << "x" << imgSize << ", qr module pixel size: " << minModulePixelSize << ". " << std::endl;
                                if (exampleQrPng1.writeToPNG())
                                    std::cout << "Success!" << std::endl;
                                else
                                    std::cerr << "Failure..." << std::endl;
                                
                            #pragma endregion
                            
                            ok = QR_QUEUE[0]->try_pop(QR_STRUCTS[0]);
                            QR_QUEUE[0]->clear();
                        }
                        
                    }
                }
                };

        #pragma endregion

    #pragma region
        
        //THREADS
        thread I(std::thread(GRAB_QUERY, "GET_QR_STRING_FROM_UI"));
        thread Q(std::thread(QRCODE, "GENERATE_QRCODE_FROM_QUERY_UI"));
        I.join();
        Q.join();

    #pragma endregion
    return 0;
}