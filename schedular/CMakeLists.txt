CMAKE_MINIMUM_REQUIRED(VERSION 3.6)
SET(PROJECT_NAME SCHEDULAR)
SET(SCHEDULAR_NAME libcron)
PROJECT(${PROJECT_NAME})
SET(CMAKE_CXX_STANDARD 17)
SET(CMAKE_CXX_STANDARD_REQUIRED ON)
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3")
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -march=native")
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -pthread")
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++17 -ldl -lpthread")
SET(BUILD_SHARED_LIBS OFF) # need to be turn off for demo
SET(CMAKE_CXX_FLAGS_DEBUG  "-g")

INCLUDE_DIRECTORIES(${PROJECT_SOURCE_DIR}/src
                    ${PROJECT_SOURCE_DIR}/include
                    )

ADD_LIBRARY(${SCHEDULAR_NAME} 
            include/libcron/Cron.h
            include/libcron/CronClock.h
            include/libcron/CronData.h
            include/libcron/CronRandomization.h
            include/libcron/CronSchedule.h
            include/libcron/DateTime.h
            include/libcron/Task.h
            include/libcron/TimeTypes.h
            src/CronClock.cpp
            src/CronData.cpp
            src/CronRandomization.cpp
            src/CronSchedule.cpp
            src/Task.cpp)

find_package(Eigen3 REQUIRED)
#MESSAGE( [Main] " EIGEN3_INCLUDE_DIRS = ${EIGEN3_INCLUDE_DIRS}") 
# EIGEN3_INCLUDE_DIRS = /usr/include/eigen3

include_directories(${EIGEN3_INCLUDE_DIRS})

include_directories("/usr/local/include/date")

find_package(gflags REQUIRED)
# gflags_INCLUDE_DIR = /usr/include/gflags
include_directories (${gflags_INCLUDE_DIR})

IF ( USE_TBB )
    MESSAGE( STATUS "Including TBB on MyLib build" )
    FIND_PACKAGE( tbb REQUIRED )
    LINK_DIRECTORIES( ${LIBRARYPATH} )
ENDIF ()

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

find_package(Iconv REQUIRED)
if(NOT Iconv_IS_BUILT_IN)
  set(ICONV_LIB Iconv::Iconv)
endif()

ADD_EXECUTABLE(${PROJECT_NAME} main.cpp)

TARGET_LINK_LIBRARIES(${PROJECT_NAME}  -lz -ltbb -lredis++ -lhiredis -lstdc++fs -lpthread -lboost_thread -lboost_system -lrt -lcurl libcron )
