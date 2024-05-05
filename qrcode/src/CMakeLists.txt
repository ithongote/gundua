set(BINARY QRCODE)

file(GLOB_RECURSE SOURCES LIST_DIRECTORIES true *.h *.cpp)

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

add_executable(${BINARY} ${SOURCES})
target_include_directories(${BINARY} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries(${BINARY}
        stdc++fs
        tinypngoutput
        qr-code-generator -lcurl -ljsoncpp -lz -ltbb  -lstdc++fs -lpthread -lboost_thread -lboost_system  -lrt)
