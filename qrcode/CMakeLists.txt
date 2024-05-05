#cmake_minimum_required(VERSION 3.16)
#project(cpp_qr_to_png)

CMAKE_MINIMUM_REQUIRED(VERSION 3.6)
SET(PROJECT_NAME QRCODE)

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

add_subdirectory(libs)
include_directories(src)
add_subdirectory(src)
