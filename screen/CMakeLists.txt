CMAKE_MINIMUM_REQUIRED(VERSION 3.6)
SET(PROJECT_NAME BILLBOARD)
#[===[
SET(MEDIA_SPAWNING_NAME MEDIA)
SET(LEFT_SCREEN_NAME LEFTPOS)
SET(RIGHT_SCREEN_NAME RIGHTPOS)
SET(BOTTOM_LEFT_SCREEN_NAME BLEFTPOS)
SET(BOTTOM_RIGHT_SCREEN_NAME BRIGHTPOS)
]===]
PROJECT(${PROJECT_NAME})
FIND_PACKAGE(OpenCV 4 REQUIRED)
SET(CMAKE_CXX_STANDARD 17)
SET(CMAKE_CXX_STANDARD_REQUIRED ON)
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3")
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -march=native")
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -pthread")
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++17 -ldl -lpthread")
SET(BUILD_SHARED_LIBS OFF) # need to be turn off for demo
SET(CMAKE_CXX_FLAGS_DEBUG  "-g")

INCLUDE_DIRECTORIES(${OpenCV_INCLUDE_DIRS}
        ${PROJECT_SOURCE_DIR}/include)

find_package(Eigen3 REQUIRED)
#MESSAGE( [Main] " EIGEN3_INCLUDE_DIRS = ${EIGEN3_INCLUDE_DIRS}") 
# EIGEN3_INCLUDE_DIRS = /usr/include/eigen3

include_directories(${EIGEN3_INCLUDE_DIRS})
#export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/path/to/library
include_directories("/usr/local/include/libiconv")

find_package(gflags REQUIRED)
# gflags_INCLUDE_DIR = /usr/include/gflags
include_directories (${gflags_INCLUDE_DIR})

IF ( USE_TBB )
    MESSAGE( STATUS "Including TBB on MyLib build" )
    FIND_PACKAGE( tbb REQUIRED )
    LINK_DIRECTORIES( ${LIBRARYPATH} )
ENDIF ()

set(CMAKE_INSTALL_RPATH "/usr/local/include/")
set(CMAKE_INSTALL_RPATH_USE_LINK_PATH TRUE)

find_package(Iconv REQUIRED)
if(NOT Iconv_IS_BUILT_IN)
  set(ICONV_LIB Iconv::Iconv)
endif()

ADD_EXECUTABLE(${PROJECT_NAME} main.cpp)
TARGET_LINK_LIBRARIES(${PROJECT_NAME} ${OpenCV_LIBS} -lcurl -ljsoncpp -lz -ltbb  -lstdc++fs -lpthread -lboost_thread -lboost_system  -lrt)
#[===[
find_path(HIREDIS_HEADER hiredis)
#target_include_directories(${PROJECT_NAME} PUBLIC ${HIREDIS_HEADER})

find_library(HIREDIS_LIB hiredis)
#target_link_libraries(${PROJECT_NAME} ${HIREDIS_LIB})

# NOTE: this should be *sw* NOT *redis++*
find_path(REDIS_PLUS_PLUS_HEADER sw)
#target_include_directories(${PROJECT_NAME} PUBLIC ${REDIS_PLUS_PLUS_HEADER})

find_library(REDIS_PLUS_PLUS_LIB redis++)
#target_link_libraries(${PROJECT_NAME} ${REDIS_PLUS_PLUS_LIB})

set(CMAKE_INSTALL_RPATH "/usr/local/include/")
set(CMAKE_INSTALL_RPATH_USE_LINK_PATH TRUE)

ADD_EXECUTABLE(${LEFT_SCREEN_NAME} Left.cpp)
TARGET_LINK_LIBRARIES(${LEFT_SCREEN_NAME} ${OpenCV_LIBS} -lcurl  -ljsoncpp -lz -ltbb  -lredis++ -lhiredis -lstdc++fs -lpthread -lboost_thread -lboost_system  -lrt)
ADD_EXECUTABLE(${RIGHT_SCREEN_NAME} Right.cpp)
TARGET_LINK_LIBRARIES(${RIGHT_SCREEN_NAME} ${OpenCV_LIBS}  -lcurl -ljsoncpp -lz -ltbb  -lredis++ -lhiredis -lstdc++fs -lpthread -lboost_thread -lboost_system  -lrt)
ADD_EXECUTABLE(${BOTTOM_LEFT_SCREEN_NAME} BLeft.cpp)
TARGET_LINK_LIBRARIES(${BOTTOM_LEFT_SCREEN_NAME} ${OpenCV_LIBS}  -lcurl -ljsoncpp -lz -ltbb  -lredis++ -lhiredis -lstdc++fs -lpthread -lboost_thread -lboost_system  -lrt)
ADD_EXECUTABLE(${BOTTOM_RIGHT_SCREEN_NAME} BRight.cpp)
TARGET_LINK_LIBRARIES(${BOTTOM_RIGHT_SCREEN_NAME} ${OpenCV_LIBS}  -lcurl -ljsoncpp -lz -ltbb  -lredis++ -lhiredis -lstdc++fs -lpthread -lboost_thread -lboost_system  -lrt)
ADD_EXECUTABLE(${MEDIA_SPAWNING_NAME} media.cpp)
TARGET_LINK_LIBRARIES(${MEDIA_SPAWNING_NAME} ${OpenCV_LIBS} -lz -ltbb  -lstdc++fs -lpthread -lboost_thread -lboost_system  pthread dl ssl)
]===]
