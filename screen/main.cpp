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

#include <opencv2/core.hpp>
#include <condition_variable>
#include <opencv2/opencv.hpp>
#include "opencv2/imgcodecs.hpp"

#include <experimental/filesystem>

#include <tbb/parallel_for.h>
#include "tbb/concurrent_queue.h"
#include "tbb/concurrent_hash_map.h"

#include <boost/thread.hpp>
#include <boost/thread/mutex.hpp>
#include <boost/thread/thread.hpp>
#include <boost/signals2/signal.hpp>
#include <boost/asio/io_service.hpp>
#include <boost/thread/condition_variable.hpp>
#include <boost/interprocess/shared_memory_object.hpp>
#include <boost/interprocess/mapped_region.hpp>

extern "C" {
#include <libavutil/opt.h>
#include <libavcodec/avcodec.h>
#include <libavutil/channel_layout.h>
#include <libavutil/common.h>
#include <libavutil/imgutils.h>
#include <libavutil/mathematics.h>
#include <libavutil/samplefmt.h>
#include <libavformat/avformat.h>
#include <libswscale/swscale.h>
#include <libswresample/swresample.h>
#include <libavutil/hwcontext.h>
}

boost::mutex mut;
using namespace cv;
bool ready = false;
using namespace std;
using namespace tbb;
boost::condition_variable cond;
using namespace boost::interprocess;
using namespace std::chrono_literals;

int face_count = 0;
int frames_validator;
std::string frame_rate;
std::string frame_number;
std::string frame_position;
std::string frame_position_time;

namespace fs = std::experimental::filesystem;

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

struct  IN_ADVERT{
   std::string  *desc;
};

struct  OUT_ADVERT{
   cv::Mat   *Frame;
   int  *Frame_Rate;
   int  *Frame_Width;
   int  *Frame_Count;
   int  *Frame_Height;
   long *Frame_Position;
   std::string *Margin_Top;
   std::string *Margin_Left;
   int *Frame_Volume;
   int *Frame_Processed;
   int *Status;
   std::string *Display_Slot;
   std::string *Media_Display_Pos;
};

struct  PUB_SMS{
   int  *Status;
   int  *Frame_Width;
   int  *Frame_Height;
   std::string *Margin_Top;
   std::string *Margin_Left;
   std::string *Display_Slot;
   std::string *Media_Display_Pos;
};

struct  PUB_TANGAZO{
   std::string tangazo;
};

struct  HLS_STREAM{
   cv::Mat   *stream;
};

class XDELETE
{
  public :
    void operator()(string &msg) const
    {
        std::cout << msg << "\n";
    }
};

int main(int argc, char* argv[])
{
    if(std::string_view(argv[1])=="START" && std::string_view(argv[2])!="0" && std::string_view(argv[3])!="0" && std::string_view(argv[4])!="0"){
        #pragma region
        
            #pragma region
                concurrent_queue<IN_ADVERT> *Input;
                concurrent_queue<OUT_ADVERT> *Output;
                concurrent_queue<PUB_SMS> *Broadcast;
                concurrent_queue<PUB_TANGAZO> *Tangaza;
                concurrent_queue<HLS_STREAM> *hls_obj;

                vector<concurrent_queue<IN_ADVERT>*>IN_QUEUE;
                vector<concurrent_queue<OUT_ADVERT>*>OUT_QUEUE;
                vector<concurrent_queue<PUB_SMS>*>SMS_QUEUE;
                vector<concurrent_queue<PUB_TANGAZO>*>TANGAZO_QUEUE;

                vector<concurrent_queue<HLS_STREAM>*>HLS_QUEUE;

                int SCREEN_COUNT = std::stoi(argv[2]);
                int STREAM_COUNT = 1;
                int FRAME_RATE[SCREEN_COUNT ];
                int FRAME_COUNT[SCREEN_COUNT ];
                int FRAME_WIDTH[SCREEN_COUNT ];
                int FRAME_HEIGHT[SCREEN_COUNT ];
                int DISPLAY_COUNT[SCREEN_COUNT];
                int STATUS_SIGNAL[SCREEN_COUNT];
                int FRAME_VOLUME[SCREEN_COUNT ];
                int FRAME_PROCESSED[SCREEN_COUNT];
                long FRAME_POSITION[SCREEN_COUNT ];
                
                int BW = std::stoi(argv[3]);
                int BH = std::stoi(argv[4]);
                int DISPLAY_FRAME_WIDTH = BW;
                int DISPLAY_FRAME_HEIGHT = BH;
                int HLS_FRAME_RATE =20;
                std::string IN_STRING[SCREEN_COUNT ];
                std::string OUT_STRING[SCREEN_COUNT ];
                std::cout << argv[1] << " SCREEN SIZE " << argv[3] << " CONTAINER SIZE " << SCREEN_COUNT << std::endl;
                vector<string> *CAPTURE_CONTAINER= new vector<string>(SCREEN_COUNT);
                cv::Mat **FRAME =(cv::Mat  **) malloc(SCREEN_COUNT * sizeof(cv::Mat  *));
                cv::Mat **RESIZED_FRAME =(cv::Mat  **) malloc(SCREEN_COUNT * sizeof(cv::Mat  *));
                std::vector<uint8_t>* FRAMEBUF = new std::vector<uint8_t>(DISPLAY_FRAME_HEIGHT * DISPLAY_FRAME_WIDTH * SCREEN_COUNT * 12 + 16);
                cv::Mat* DISPLAY_FRAME = new cv::Mat(DISPLAY_FRAME_HEIGHT, DISPLAY_FRAME_WIDTH, CV_8UC3, FRAMEBUF->data(), DISPLAY_FRAME_WIDTH * 3);
                cv::Mat* BILLBOARD_FRAME = new cv::Mat(DISPLAY_FRAME_HEIGHT, DISPLAY_FRAME_WIDTH, CV_8UC3, FRAMEBUF->data(), DISPLAY_FRAME_WIDTH * 3);
                VideoCapture **CAPTURE = (VideoCapture **) malloc(SCREEN_COUNT * sizeof(VideoCapture *));
                struct IN_ADVERT *INPUT_STRUCTS = ( struct IN_ADVERT  *) malloc(SCREEN_COUNT * sizeof(struct IN_ADVERT));
                struct OUT_ADVERT *OUTPUT_STRUCTS = ( struct OUT_ADVERT  *) malloc(SCREEN_COUNT * sizeof(struct OUT_ADVERT));
                struct PUB_SMS *SMS_STRUCTS = ( struct PUB_SMS  *) malloc(SCREEN_COUNT * sizeof(struct PUB_SMS));
                struct PUB_TANGAZO *TANGAZO_STRUCTS = ( struct PUB_TANGAZO *) malloc(SCREEN_COUNT * sizeof(struct PUB_TANGAZO));

                struct HLS_STREAM *HLS_STRUCTS = ( struct HLS_STREAM *) malloc(SCREEN_COUNT * sizeof(struct HLS_STREAM));

                for(int i; i < SCREEN_COUNT; i ++){

                    Input = new concurrent_queue<IN_ADVERT>;
                    IN_QUEUE.push_back(Input);

                    Output = new concurrent_queue<OUT_ADVERT>;
                    OUT_QUEUE.push_back(Output);

                    Broadcast   = new concurrent_queue<PUB_SMS>;
                    SMS_QUEUE.push_back(Broadcast);

                    Tangaza   = new concurrent_queue<PUB_TANGAZO>;
                    TANGAZO_QUEUE.push_back(Tangaza);

                    hls_obj = new concurrent_queue<HLS_STREAM>;
                    HLS_QUEUE.push_back(hls_obj);

                    Mat* frame = new Mat(); 
                    FRAME[i] = frame;
                    RESIZED_FRAME[i] = frame;
                }

                boost::signals2::signal<void(string &msg)> SIG;
                SIG.connect(XDELETE());

            #pragma endregion

        #pragma endregion

        #pragma region

            auto  GRAB_QUERY = [&IN_STRING,&IN_QUEUE,&INPUT_STRUCTS,&OUT_STRING,&OUT_QUEUE,&OUTPUT_STRUCTS](const std::string& K){
                while (true)
                {
                    #pragma region

                        //usleep(1);
                        const std::string url("http://127.0.0.1:5007/api/billboard/ads/submit");

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
                                //std::cout << " QUED ---I--- DATA " << captured_data << " SCREEN SIZE " << SCREEN_COUNT << std::endl;
                            }else{
                                //QUERY_INDEXING_LOCATION
                                std::string QUERY_INDEXING_POSITION_METRIC = captured_data;
                                int QUERY_INDEXING_POSITION_POS = QUERY_INDEXING_POSITION_METRIC.find_last_of(":");
                                std::string QUERY_INDEXING_POSITION = QUERY_INDEXING_POSITION_METRIC.substr(QUERY_INDEXING_POSITION_POS+1);
                                std::string QUERY_INDEXING_POSITION_ERASE= QUERY_INDEXING_POSITION + ":";
                                int QUERY_INDEXING_ID = std::stoi(QUERY_INDEXING_POSITION)-1;
                                IN_STRING[QUERY_INDEXING_ID] = captured_data;
                                std::cout << " QUED -ss--I--- DATA " << &IN_STRING[0] << std::endl;
                                IN_ADVERT _IN_ADVERT ={&IN_STRING[QUERY_INDEXING_ID]};
                                IN_QUEUE[QUERY_INDEXING_ID]->push(_IN_ADVERT);
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
                    
                }
            };

        #pragma endregion

        #pragma region

            auto  GRAB_FRAME = [&STATUS_SIGNAL,&FRAME_PROCESSED,&FRAME_VOLUME,&DISPLAY_COUNT,&RESIZED_FRAME,&FRAME,&FRAME_POSITION,&FRAME_RATE,&FRAME_COUNT,&FRAME_WIDTH,&FRAME_HEIGHT,&CAPTURE,&CAPTURE_CONTAINER,&SCREEN_COUNT,&IN_STRING,&IN_QUEUE,&INPUT_STRUCTS,&OUT_STRING,&OUT_QUEUE,&OUTPUT_STRUCTS](const int &Q){
                while (true){
                    if(IN_QUEUE.size() > 0){
                        bool ok = IN_QUEUE[Q]->try_pop(INPUT_STRUCTS[Q]);
                        if(ok){
                            try{

                                #pragma region
                                    std::string _captured_data = *INPUT_STRUCTS[Q].desc;
                                    //ADVERT_TYPE
                                    std::string ADVERT_TYPE_METRIC = _captured_data;
                                    int ADVERT_TYPE_POS = ADVERT_TYPE_METRIC.find(":");
                                    std::string ADVERT_TYPE = ADVERT_TYPE_METRIC.substr(0 , ADVERT_TYPE_POS);
                                    std::string ADVERT_TYPE_ERASE= ADVERT_TYPE + ":";
                                    //BUSINESS_ID
                                    std::string BUSINESS_ID_METRIC=ADVERT_TYPE_METRIC.erase(0,ADVERT_TYPE_ERASE.length());
                                    int BUSINESS_ID_POS = BUSINESS_ID_METRIC.find(":");
                                    std::string BUSINESS_ID = BUSINESS_ID_METRIC.substr(0 , BUSINESS_ID_POS);
                                    std::string BUSINESS_ID_ERASE= BUSINESS_ID + ":";
                                    //BILLBOARD_ID
                                    std::string BILLBOARD_ID_METRIC=BUSINESS_ID_METRIC.erase(0,BUSINESS_ID_ERASE.length());
                                    int BILLBOARD_ID_POS = BILLBOARD_ID_METRIC.find(":");
                                    std::string BILLBOARD_ID = BILLBOARD_ID_METRIC.substr(0 , BILLBOARD_ID_POS);
                                    std::string BILLBOARD_ID_ERASE= BILLBOARD_ID + ":";
                                    //ADVERT_BUDGET
                                    std::string ADVERT_BUDGET_METRIC=BUSINESS_ID_METRIC.erase(0,BILLBOARD_ID_ERASE.length());
                                    int ADVERT_BUDGET_POS = ADVERT_BUDGET_METRIC.find(":");
                                    std::string ADVERT_BUDGET = ADVERT_BUDGET_METRIC.substr(0 , ADVERT_BUDGET_POS);
                                    std::string ADVERT_BUDGET_ERASE= ADVERT_BUDGET + ":";
                                    //ADVERT DISPLAY FREQUENCY
                                    std::string ADVERT_DISPLAY_FREQUENCY_METRIC=BUSINESS_ID_METRIC.erase(0,ADVERT_BUDGET_ERASE.length());
                                    int ADVERT_DISPLAY_FREQUENCY_POS = ADVERT_DISPLAY_FREQUENCY_METRIC.find(":");
                                    std::string ADVERT_DISPLAY_FREQUENCY = ADVERT_DISPLAY_FREQUENCY_METRIC.substr(0 , ADVERT_DISPLAY_FREQUENCY_POS);
                                    std::string ADVERT_DISPLAY_FREQUENCY_ERASE= ADVERT_DISPLAY_FREQUENCY + ":";
                                    //ADVERT_MEDIA_TYPE
                                    std::string ADVERT_MEDIA_TYPE_METRIC=BUSINESS_ID_METRIC.erase(0,ADVERT_DISPLAY_FREQUENCY_ERASE.length());
                                    int ADVERT_MEDIA_TYPE_POS = ADVERT_MEDIA_TYPE_METRIC.find(":");
                                    std::string ADVERT_MEDIA_TYPE = ADVERT_MEDIA_TYPE_METRIC.substr(0 , ADVERT_MEDIA_TYPE_POS);
                                    std::string ADVERT_MEDIA_TYPE_ERASE= ADVERT_MEDIA_TYPE + ":";
                                    //ADVERT_MEDIA_URL
                                    std::string ADVERT_MEDIA_URL_METRIC=BUSINESS_ID_METRIC.erase(0,ADVERT_MEDIA_TYPE_ERASE.length());
                                    int ADVERT_MEDIA_URL_POS = ADVERT_MEDIA_URL_METRIC.find(":");
                                    std::string ADVERT_MEDIA_URL = ADVERT_MEDIA_URL_METRIC.substr(0 , ADVERT_MEDIA_URL_POS);
                                    std::string ADVERT_MEDIA_URL_ERASE= ADVERT_MEDIA_URL + ":";
                                    //ADVERT_DISPLAY_POSITION
                                    std::string ADVERT_DISPLAY_POSITION_METRIC=BUSINESS_ID_METRIC.erase(0,ADVERT_MEDIA_URL_ERASE.length());
                                    int ADVERT_DISPLAY_POSITION_POS = ADVERT_DISPLAY_POSITION_METRIC.find(":");
                                    std::string ADVERT_DISPLAY_POSITION = ADVERT_DISPLAY_POSITION_METRIC.substr(0 , ADVERT_DISPLAY_POSITION_POS);
                                    std::string ADVERT_DISPLAY_POSITION_ERASE= ADVERT_DISPLAY_POSITION + ":";
                                    //ADVERT_DISPLAY_WIDTH
                                    std::string ADVERT_DISPLAY_WIDTH_METRIC=BUSINESS_ID_METRIC.erase(0,ADVERT_DISPLAY_POSITION_ERASE.length());
                                    int ADVERT_DISPLAY_WIDTH_POS = ADVERT_DISPLAY_WIDTH_METRIC.find(":");
                                    std::string ADVERT_DISPLAY_WIDTH = ADVERT_DISPLAY_WIDTH_METRIC.substr(0 , ADVERT_DISPLAY_WIDTH_POS);
                                    std::string ADVERT_DISPLAY_WIDTH_ERASE = ADVERT_DISPLAY_WIDTH + ":";
                                    //ADVERT_DISPLAY_HEIGHT
                                    std::string ADVERT_DISPLAY_HEIGHT_METRIC=BUSINESS_ID_METRIC.erase(0,ADVERT_DISPLAY_WIDTH_ERASE.length());
                                    int ADVERT_DISPLAY_HEIGHT_POS = ADVERT_DISPLAY_HEIGHT_METRIC.find(":");
                                    std::string ADVERT_DISPLAY_HEIGHT = ADVERT_DISPLAY_HEIGHT_METRIC.substr(0 , ADVERT_DISPLAY_HEIGHT_POS);
                                    std::string ADVERT_DISPLAY_HEIGHT_ERASE = ADVERT_DISPLAY_HEIGHT + ":";
                                    //ADVERT_INDEXING_POSITION
                                    std::string ADVERT_INDEXING_POSITION_METRIC=BUSINESS_ID_METRIC.erase(0,ADVERT_DISPLAY_HEIGHT_ERASE.length());
                                    int ADVERT_INDEXING_POSITION_POS = ADVERT_INDEXING_POSITION_METRIC.find(":");
                                    std::string ADVERT_INDEXING_POSITION = ADVERT_INDEXING_POSITION_METRIC.substr(0 , ADVERT_INDEXING_POSITION_POS);
                                    std::string ADVERT_INDEXING_POSITION_ERASE = ADVERT_INDEXING_POSITION + ":";

                                    std::string MARGIN_TOP  = BUSINESS_ID;
                                    std::string MARGIN_LEFT = BILLBOARD_ID;
                                    std::string ADVERT_STATUS_SIGNAL  = "1";
                                    int ADVERT_INDEXING_ID  = std::stoi(ADVERT_INDEXING_POSITION)-1;
                                    /*
                                    if(std::stoi(ADVERT_DISPLAY_FREQUENCY) == 0){
                                        ADVERT_STATUS_SIGNAL  = "0";
                                    }

                                    if(std::stoi(ADVERT_DISPLAY_FREQUENCY) > 0){
                                        ADVERT_STATUS_SIGNAL  = "1";
                                    }
                                    */
                                    DISPLAY_COUNT[ADVERT_INDEXING_ID] = std::stoi(ADVERT_DISPLAY_FREQUENCY);
                                    
                                    STATUS_SIGNAL[ADVERT_INDEXING_ID] = std::stoi(ADVERT_STATUS_SIGNAL);

                                #pragma endregion

                                #pragma region

                                    assert(ADVERT_INDEXING_ID==Q);
                                    
                                    for (int i = 0; i < DISPLAY_COUNT[ADVERT_INDEXING_ID]; i++) {

                                        VideoCapture *capture = new VideoCapture(ADVERT_MEDIA_URL , cv::CAP_FFMPEG);
                                        CAPTURE[ADVERT_INDEXING_ID]=capture;
                                        
                                        if (!CAPTURE[ADVERT_INDEXING_ID]->isOpened()) {
                                            cerr << "ERROR! Unable to open camera\n";
                                            //return -1;
                                        }

                                        if (CAPTURE[ADVERT_INDEXING_ID]->isOpened()) {
                                            FRAME_RATE[ADVERT_INDEXING_ID]            =   CAPTURE[ADVERT_INDEXING_ID]->get(cv::CAP_PROP_FPS);
                                            FRAME_COUNT[ADVERT_INDEXING_ID]           =   CAPTURE[ADVERT_INDEXING_ID]->get(cv::CAP_PROP_FRAME_COUNT);
                                            FRAME_WIDTH[ADVERT_INDEXING_ID]           =   CAPTURE[ADVERT_INDEXING_ID]->get(cv::CAP_PROP_FRAME_WIDTH);
                                            FRAME_HEIGHT[ADVERT_INDEXING_ID]          =   CAPTURE[ADVERT_INDEXING_ID]->get(cv::CAP_PROP_FRAME_HEIGHT);
                                            FRAME_VOLUME[ADVERT_INDEXING_ID]          =   FRAME_COUNT[ADVERT_INDEXING_ID]*DISPLAY_COUNT[ADVERT_INDEXING_ID];

                                            for (int j = 0; j < FRAME_COUNT[ADVERT_INDEXING_ID]; j++) {
                                                try{
                                                    (*CAPTURE[ADVERT_INDEXING_ID]) >> *FRAME[ADVERT_INDEXING_ID];

                                                        FRAME_POSITION[ADVERT_INDEXING_ID]  = CAPTURE[ADVERT_INDEXING_ID]->get(cv::CAP_PROP_POS_FRAMES);
                                                        FRAME_PROCESSED[ADVERT_INDEXING_ID] = FRAME_POSITION[ADVERT_INDEXING_ID]*(i+1);
                                                        cv::resize(*FRAME[ADVERT_INDEXING_ID], *RESIZED_FRAME[ADVERT_INDEXING_ID], Size(stoi(ADVERT_DISPLAY_WIDTH),stoi(ADVERT_DISPLAY_HEIGHT)), 0, 0, INTER_CUBIC); 
                                                        OUT_ADVERT _OUT_ADVERT = {RESIZED_FRAME[ADVERT_INDEXING_ID],&FRAME_RATE[ADVERT_INDEXING_ID],&FRAME_WIDTH[ADVERT_INDEXING_ID],&FRAME_COUNT[ADVERT_INDEXING_ID],&FRAME_HEIGHT[ADVERT_INDEXING_ID],&FRAME_POSITION[ADVERT_INDEXING_ID],&MARGIN_TOP,&MARGIN_LEFT,&FRAME_VOLUME[ADVERT_INDEXING_ID],&FRAME_PROCESSED[ADVERT_INDEXING_ID],&STATUS_SIGNAL[ADVERT_INDEXING_ID],&ADVERT_DISPLAY_POSITION,&ADVERT_INDEXING_POSITION};
                                                        //OUT_ADVERT _OUT_ADVERT = {FRAME[ADVERT_INDEXING_ID],&FRAME_RATE[ADVERT_INDEXING_ID],&FRAME_WIDTH[ADVERT_INDEXING_ID],&FRAME_COUNT[ADVERT_INDEXING_ID],&FRAME_HEIGHT[ADVERT_INDEXING_ID],&FRAME_POSITION[ADVERT_INDEXING_ID],&MARGIN_TOP,&MARGIN_LEFT};
                                                        //OUT_ADVERT _OUT_ADVERT = {FRAME[ADVERT_INDEXING_ID],&FRAME_RATE[ADVERT_INDEXING_ID],&FRAME_WIDTH[ADVERT_INDEXING_ID],&FRAME_COUNT[ADVERT_INDEXING_ID],&FRAME_HEIGHT[ADVERT_INDEXING_ID],&FRAME_POSITION[ADVERT_INDEXING_ID],&MARGIN_TOP,&MARGIN_LEFT,&FRAME_VOLUME[ADVERT_INDEXING_ID],&FRAME_PROCESSED[ADVERT_INDEXING_ID],&STATUS_SIGNAL[ADVERT_INDEXING_ID],&ADVERT_DISPLAY_POSITION,&ADVERT_INDEXING_POSITION};
                                                      
                                                        OUT_QUEUE[ADVERT_INDEXING_ID]->push(_OUT_ADVERT);
                                                        
                                                        //<!---------------- DO NOT REMOVE -------------!>//
                                                        if (ADVERT_MEDIA_TYPE == "video"){
                                                            std::this_thread::sleep_for(std::chrono::milliseconds(20));
                                                        }
                                                        if (ADVERT_MEDIA_TYPE == "image"){
                                                            std::this_thread::sleep_for(std::chrono::milliseconds(50));
                                                        }

                                                        if (ADVERT_MEDIA_TYPE == "rss"){

                                                            //std::cout << " RSS FEED " << std::endl;
                                                            std::this_thread::sleep_for(std::chrono::milliseconds(50));
                                                        }
                                                        //<!---------------- DO NOT REMOVE -------------!>//
                                                        
                                                }catch( cv::Exception& e ){
                                                    const char* err_msg = e.what();
                                                    std::cout << "EXCEPTION   " << err_msg << " ON BILLBOARD INDEX   " << ADVERT_INDEXING_ID << std::endl;
                                                    continue;
                                                }
                                            }

                                            if(FRAME_COUNT[ADVERT_INDEXING_ID]==FRAME_POSITION[ADVERT_INDEXING_ID]){
                                                CAPTURE[ADVERT_INDEXING_ID]->release();
                                            }
                                            
                                        }
                                    }

                                #pragma endregion

                            }catch( cv::Exception& e ){
                                const char* err_msg = e.what();
                                std::cout << err_msg << std::endl;
                            }
                            ok = IN_QUEUE[Q]->try_pop(INPUT_STRUCTS[Q]);
                            IN_QUEUE[Q]->clear();
                        }
                    }
                }
            };

        #pragma endregion

        #pragma region

            auto  PLAY_FRAME = [&BILLBOARD_FRAME,&RESIZED_FRAME,&DISPLAY_FRAME,&SCREEN_COUNT, &OUT_QUEUE,&OUTPUT_STRUCTS,&SMS_QUEUE,&HLS_QUEUE](const std::string &Q){
                char winName[20];
                while (true){
                    if(OUT_QUEUE.size() > 0){
                        for( int Q = 0; Q< SCREEN_COUNT; Q++){
                            bool ok = OUT_QUEUE[Q]->try_pop(OUTPUT_STRUCTS[Q]);
                            if(ok){
                                try{
                                    
                                    (OUTPUT_STRUCTS[Q].Frame)->copyTo((*DISPLAY_FRAME)(cv::Rect(stoi(*OUTPUT_STRUCTS[Q].Margin_Left),stoi(*OUTPUT_STRUCTS[Q].Margin_Top),(OUTPUT_STRUCTS[Q].Frame)->cols, (OUTPUT_STRUCTS[Q].Frame)->rows ))); 
                                    waitKey(*OUTPUT_STRUCTS[Q].Frame_Rate);
                                    cv::namedWindow("STG", WINDOW_NORMAL);
                                    cv::imshow("STG",*DISPLAY_FRAME);
                                    //PUSH DATA FOR STREAMING
                                    HLS_STREAM HLS_STREAM = {DISPLAY_FRAME};
									HLS_QUEUE[Q]->push(HLS_STREAM);
                                }
                                catch( const exception& e ){
                                    //const char* err_msg = e.what();
                                    std::cout << e.what() << Q << std::endl;
                                }
                                ok = OUT_QUEUE[Q]->try_pop(OUTPUT_STRUCTS[Q]);
                                OUT_QUEUE[Q]->clear();
                            }
                        }
                    }
                }
            };

        #pragma endregion

        #pragma
			auto STREAM_FRAME = [&SCREEN_COUNT,&DISPLAY_FRAME_WIDTH,&DISPLAY_FRAME_HEIGHT,&HLS_QUEUE,&HLS_STRUCTS,&HLS_FRAME_RATE](const std::string &Q){
			#pragma 

                #pragma
                    //REGISTER VIDEO LIBS
                    //av_register_all();
                    //avcodec_register_all();
                    //avformat_network_init();
                #pragma endregion

                #pragma
                    //RECORDING DIRS
                    const char *outFname  = "rtmp://localhost/live/stream";

                    auto hls_dir =  std::chrono::duration_cast<std::chrono::nanoseconds>
                    (std::chrono::system_clock::now().time_since_epoch()).count();

                    int directory_status,_directory_status;
                    string folder_name = "/var/www/html/live/"+std::to_string(hls_dir);
                    const char* dirname = folder_name.c_str();
                    directory_status = mkdir(dirname,0777);

                    auto Timestamps =  std::chrono::duration_cast<std::chrono::nanoseconds>
                    (std::chrono::system_clock::now().time_since_epoch()).count();
                    string sub_folder_name = folder_name+"/"+std::to_string(Timestamps);
                    const char* _dirname = sub_folder_name.c_str();
                    _directory_status =mkdir(_dirname,0777);

                #pragma endregion

                #pragma
                    //ENCODER
                    AVFormatContext *format_ctx = avformat_alloc_context();
                    std::string segment_list_type = sub_folder_name + "/stream.m3u8";
                    auto start = std::chrono::system_clock::now();

                    avformat_alloc_output_context2(&format_ctx, nullptr, "hls", segment_list_type.c_str());
                    if(!format_ctx) {
                        std::cout << "unable to allocate output context, stream will not work! " <<  outFname << std::endl;
                            
                        return 1;
                    }

                    if (!(format_ctx->oformat->flags & AVFMT_NOFILE)) {
                        int avopen_ret  = avio_open2(&format_ctx->pb, outFname,
                                                    AVIO_FLAG_WRITE, nullptr, nullptr);
                        if (avopen_ret < 0)  {
                            std::cout << "failed to open stream output context, stream will not work! " <<  outFname << std::endl;
                            return 1;
                        }
                    }

                    AVCodec *out_codec = avcodec_find_encoder(AV_CODEC_ID_H264);
                    AVStream *out_stream = avformat_new_stream(format_ctx, out_codec);
                    AVCodecContext *out_codec_ctx = avcodec_alloc_context3(out_codec);
                    //set codec params
                    const AVRational dst_fps = {HLS_FRAME_RATE, 1};
                    out_codec_ctx->codec_tag = 0;
                    out_codec_ctx->codec_id = AV_CODEC_ID_H264;
                    out_codec_ctx->codec_type = AVMEDIA_TYPE_VIDEO;
                    out_codec_ctx->width = DISPLAY_FRAME_WIDTH;
                    out_codec_ctx->height = DISPLAY_FRAME_HEIGHT;
                    out_codec_ctx->pix_fmt = AV_PIX_FMT_YUV420P;
                    out_codec_ctx->framerate = dst_fps;
                    out_codec_ctx->time_base.num = 1;
                    out_codec_ctx->gop_size = HLS_FRAME_RATE;
                    out_codec_ctx->time_base.den = HLS_FRAME_RATE;
                    
                    out_codec_ctx->time_base = av_inv_q(dst_fps);
                    if (format_ctx->oformat->flags & AVFMT_GLOBALHEADER)
                    {
                        out_codec_ctx->flags |= AV_CODEC_FLAG_GLOBAL_HEADER;
                    }

                    int ret_avp = avcodec_parameters_from_context(out_stream->codecpar, out_codec_ctx);
                    if (ret_avp < 0)
                    {
                        std::cout << "Could not initialize stream codec parameters!" << std::endl;
                        exit(1);
                    }

                    int av_ret;
                    int frames_validator;
                    int frames_counter = 0;
                    AVFrame *frame = av_frame_alloc();
                    std::vector<uint8_t>* imgbuf = new std::vector<uint8_t>(DISPLAY_FRAME_HEIGHT * DISPLAY_FRAME_WIDTH * 3 + 16);
                    std::vector<uint8_t>* framebuf = new std::vector<uint8_t>(av_image_get_buffer_size(AV_PIX_FMT_YUV420P, DISPLAY_FRAME_WIDTH, DISPLAY_FRAME_HEIGHT, 1));
                    cv::Mat* image = new cv::Mat(DISPLAY_FRAME_HEIGHT, DISPLAY_FRAME_WIDTH, CV_8UC3, imgbuf->data(), DISPLAY_FRAME_WIDTH * 3);
                #pragma endregion
		        
                #pragma

                    if (!_directory_status){

                    #pragma 
			        
                        //append last charcter from key
                        std::string hls_segment_filename = sub_folder_name + "/file%03d.ts";
                        std::cout << "HLS SEGMENT " <<  hls_segment_filename << std::endl;

                        AVDictionary *hlsOptions = NULL;
                        av_dict_set(&hlsOptions, "profile", "baseline", 0);
                        av_dict_set(&hlsOptions, "c", "copy", 0);
                        av_dict_set(&hlsOptions, "preset", "ultrafast", 0);
                        av_dict_set(&hlsOptions, "tune", "zerolatency", 0);
                        av_dict_set(&hlsOptions, "x264encopts", "slow_firstpass:ratetol=100", 0);
                        av_dict_set(&hlsOptions, "pass", "2", 0);
                        av_dict_set(&hlsOptions, "crf", "28", 0); 
                        av_dict_set(&hlsOptions, "strict", "-2", 0);
                        av_dict_set(&hlsOptions, "hls_segment_type",   "mpegts", 0);
                        av_dict_set(&hlsOptions, "segment_list_type",  "m3u8",   0);
                        av_dict_set(&hlsOptions, "hls_segment_filename", hls_segment_filename.c_str(),   0);
                        av_dict_set(&hlsOptions, "g",std::to_string(HLS_FRAME_RATE).c_str(), 0);
                        av_dict_set(&hlsOptions, "hls_time",   "1", 0);
                        av_dict_set(&hlsOptions, "hls_init_time",   "1", 0);
                        av_dict_set(&hlsOptions, "hls_list_size",   "0", 0);
                        av_dict_set(&hlsOptions, "live_start_index", "0", 0);
                        av_dict_set(&hlsOptions, "segment_time_delta", "1.0", 0);
                        av_dict_set_int(&hlsOptions, "reference_stream",   out_stream->index, 0);
                        av_dict_set(&hlsOptions, "force_key_frames", "expr:gte(t,n_forced*10)", AV_DICT_DONT_OVERWRITE);

                        #pragma 
			       
                            int ret_avo = avcodec_open2(out_codec_ctx, out_codec, &hlsOptions);
                            
                            if (ret_avo < 0)
                            {
                                std::cout << "Could not open video encoder!" << std::endl;
                                exit(1);
                            }
                            out_stream->codecpar->extradata = out_codec_ctx->extradata;
                            out_stream->codecpar->extradata_size = out_codec_ctx->extradata_size;

                            av_dump_format(format_ctx, 0, outFname, 1);

                            SwsContext * pSwsCtx = sws_getContext(DISPLAY_FRAME_WIDTH,DISPLAY_FRAME_HEIGHT,AV_PIX_FMT_BGR24, DISPLAY_FRAME_WIDTH, DISPLAY_FRAME_HEIGHT , AV_PIX_FMT_YUV420P , SWS_FAST_BILINEAR, NULL, NULL, NULL);
                                    
                            if (pSwsCtx == NULL) {
                                fprintf(stderr, "Cannot initialize the sws context\n");
                                exit(1);
                                return -1;
                            }
                            

                            int ret_avfw = avformat_write_header(format_ctx, &hlsOptions);
                            if (ret_avfw < 0)
                            {
                                std::cout << "Could not write header!" << std::endl;
                                exit(1);
                            }

                        #pragma endregion

                        #pragma

                            while(true){
                                if(HLS_QUEUE.size() > 0){
                                    for( int Q=0;Q< SCREEN_COUNT; Q++){
                                        bool ok = HLS_QUEUE[Q]->try_pop(HLS_STRUCTS[Q]);
                                        if(ok){
                                            try{
                                                std::cout <<HLS_STRUCTS[Q].stream<< std::endl;
                                                
                                                cv::Mat video_frame = *HLS_STRUCTS[Q].stream;
                    
                                                av_image_fill_arrays(frame->data, frame->linesize, framebuf->data(), AV_PIX_FMT_YUV420P, DISPLAY_FRAME_WIDTH, DISPLAY_FRAME_HEIGHT, 1);
                                                frame->width = DISPLAY_FRAME_WIDTH;
                                                frame->height = DISPLAY_FRAME_HEIGHT;
                                                frame->format = static_cast<int>(AV_PIX_FMT_YUV420P);
                                                
                                                *image = video_frame;

                                                const int stride[] = {static_cast<int>(image->step[0])};
                                                sws_scale(pSwsCtx, &image->data, stride , 0 , DISPLAY_FRAME_HEIGHT , frame->data, frame->linesize); 
                                                frame->pts += av_rescale_q(1, out_codec_ctx->time_base, out_stream->time_base);

                                                AVPacket pkt = {0};
                                                av_init_packet(&pkt);

                                                if(out_stream != NULL){
                                                    
                                                    int ret_frame = avcodec_send_frame(out_codec_ctx, frame);
                                                    if (ret_frame < 0)
                                                    {
                                                        std::cout << "Error sending frame to codec context!" << std::endl;
                                                        exit(1);
                                                    }
                                                    int ret_pkt = avcodec_receive_packet(out_codec_ctx, &pkt);
                                                    if (ret_pkt < 0)
                                                    {
                                                        std::cout << "Error receiving packet from codec context!" << " WIDTH " <<  DISPLAY_FRAME_WIDTH <<" HEIGHT " << DISPLAY_FRAME_HEIGHT << std::endl;
                                                        exit(1);
                                                    }

                                                    if (pkt.pts == AV_NOPTS_VALUE || pkt.dts == AV_NOPTS_VALUE) {
                                                        av_log (format_ctx, AV_LOG_ERROR,
                                                            "Timestamps are unset in a packet for stream% d\n", out_stream-> index);
                                                        return AVERROR (EINVAL);
                                                        exit(1);
                                                    }

                                                    if (pkt.pts < pkt.dts) {
                                                        av_log (format_ctx, AV_LOG_ERROR, "pts%" PRId64 "<dts%" PRId64 "in stream% d\n",
                                                        pkt.pts, pkt.dts,out_stream-> index);
                                                        return AVERROR (EINVAL);
                                                        exit(1);
                                                    }
                                                    if (pkt.stream_index == out_stream->index){
                                                        av_interleaved_write_frame(format_ctx, &pkt);
                                                    }
                                                }
                                        }catch( const exception& e ){
                                            //const char* err_msg = e.what();
                                            std::cout << e.what() << Q << std::endl;
                                            }
                                            ok = HLS_QUEUE[Q]->try_pop(HLS_STRUCTS[Q]);
                                            HLS_QUEUE[Q]->clear();
                                        }
                                    }
                                }
                            }

                        #pragma endregion

                    #pragma endregion
                    
                    }
            
                #pragma endregion

			#pragma endregion
		
		};

		#pragma endregion

        #pragma region

            auto PLAY_SMS = [&SCREEN_COUNT,&SMS_STRUCTS,&SMS_QUEUE,&TANGAZO_QUEUE](const std::string &Q){

                while (true){

                    if(SMS_QUEUE.size() > 0){
                        for( int Q = 0; Q< SCREEN_COUNT; Q++){
                            bool ok = SMS_QUEUE[Q]->try_pop(SMS_STRUCTS[Q]);
                            if(ok){
                                try{
                                    std::cout << "STATUS ID" << *SMS_STRUCTS[Q].Status << " HEIGHT " <<*SMS_STRUCTS[Q].Frame_Height << " POSITION " <<  *SMS_STRUCTS[Q].Display_Slot << " WIDTH " << *SMS_STRUCTS[Q].Frame_Width << " LEFT " << *SMS_STRUCTS[Q].Margin_Left << " RIGHT " << *SMS_STRUCTS[Q].Margin_Top <<std::endl;
                                    //std::string Query = ""+T_DC+":"+T_MT+":"+T_ML+":1000:1:video:/home/blackpearl/Videos/BILLBOARD/build/images/16829318640882049.mp4:"+T_DS+":"+T_FW+":"+T_FH+":"+M_DS+"";
                                    //std::string Query = "Electronics:"+(*SMS_STRUCTS[Q].Margin_Top)+":"+(*SMS_STRUCTS[Q].Margin_Left)+":250:1:video:/home/blackpearl/Videos/BILLBOARD/build/images/tangazo.mp4:"+(*SMS_STRUCTS[Q].Display_Slot)+":"+(std::to_string(*SMS_STRUCTS[Q].Frame_Width))+":"+(std::to_string(*SMS_STRUCTS[Q].Frame_Height))+":"+(*SMS_STRUCTS[Q].Media_Display_Pos);
                                    //if(*SMS_STRUCTS[Q].Status==1){
                                    PUB_TANGAZO _PUB_TANGAZO = {"Electronics:"+(*SMS_STRUCTS[Q].Margin_Top)+":"+(*SMS_STRUCTS[Q].Margin_Left)+":250:1:video:/home/titanx/Videos/rss/tangazo.mp4:"+(*SMS_STRUCTS[Q].Display_Slot)+":"+(std::to_string(*SMS_STRUCTS[Q].Frame_Width))+":"+(std::to_string(*SMS_STRUCTS[Q].Frame_Height))+":"+(*SMS_STRUCTS[Q].Media_Display_Pos)};
                                    TANGAZO_QUEUE[Q]->push(_PUB_TANGAZO);
                                }
                                catch( cv::Exception& e ){
                                    const char* err_msg = e.what();
                                    std::cout << err_msg << Q << std::endl;
                                }
                                ok = SMS_QUEUE[Q]->try_pop(SMS_STRUCTS[Q]);
                                SMS_QUEUE[Q]->clear();
                            }
                        }
                    }
                    
                }
            };

        #pragma endregion

        #pragma region
        
            auto PLAY_TANGAZO = [&SCREEN_COUNT,&TANGAZO_STRUCTS,&TANGAZO_QUEUE](const std::string &Q){

                while (true){
                
                    try{
                        CURL *curl;
                        CURLcode res;
                        std::string readBuffer;
                        curl_global_init(CURL_GLOBAL_ALL);
                        curl = curl_easy_init();
                        //std::string query = TANGAZO_STRUCTS[Q].tangazo;
                        std::string query =  "Breaking News:540:0:8400:74:rss:/home/titanx/Videos/rss/tangazo.mp4:BOTTOM-RIGHT:1280:180:4";
                        std::string url = "http://127.0.0.1:5007/api/billboard/ads/submit";
                        std::string data = "{'query':'"+query+"'}";
                        std::this_thread::sleep_for(std::chrono::milliseconds(40000));
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

                        std::cout << " BYE======tangazo " << readBuffer << std::endl;
                        }
                        curl_global_cleanup();
                    }
                    catch( cv::Exception& e ){
                        const char* err_msg = e.what();
                        std::cout << err_msg << Q << std::endl;
                    }
        
                }
            };

        #pragma endregion

        #pragma region
            
            //THREADS
            thread Q(std::thread(GRAB_QUERY, "QUERY_CHANNEL"));
            std::vector<std::thread> X;
            for ( int i = 0; i < SCREEN_COUNT; i++ ){
                X.push_back(std::thread( GRAB_FRAME , i ) ); 
            } 
            thread P(std::thread(PLAY_FRAME, "VIDEO_CHANNEL"));
            thread S(std::thread(STREAM_FRAME, "STREAM_FRAME"));
            //thread S(std::thread(PLAY_SMS, "SMS_CHANNEL"));
            //thread D(std::thread(PLAY_TANGAZO, "TANGAZO_CHANNEL"));

            for(auto& T: X){
                T.join();
            }
            
            P.join();
            S.join();

        #pragma endregion
    }

    if(std::string_view(argv[1])=="START" && std::string_view(argv[2])=="0"){
        exit(0);
    }
   //std::this_thread::sleep_for(std::chrono::milliseconds(100));
return 0;
}