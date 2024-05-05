```
# instruction set for creating and deploying display module
```

```
SOFTWARE VIDEO DISPLAYS THAT CAN BE EMBEDDED ON ANY PLATFROM : TV,PHONES,SOCIAL PLATFORMS ,CAR DASHBOADS.

*Can use Gpu or Cpu ---Choose opencv options dependinng on preferences*

* With Gpu Option , update system with below requirements 
    `Ubuntu 18.04 LTS`
    `gcc/g++ 7.5.0`
  
*SCREEN has been optimised to run on cpu . No need for GPU.*
```
# Dependencies
```
sudo apt-get install libssl-dev
sudo apt-get install qtbase5-dev
sudo apt-get install qtdeclarative5-dev
sudo apt-get install libhdf5-serial-dev
sudo apt-get install build-essential git unzip pkg-config
sudo apt-get install libjpeg-dev libpng-dev libtiff-dev
sudo apt-get install libavcodec-dev libavformat-dev libswscale-dev
sudo apt-get install libgtk2.0-dev
sudo apt-get install python3-dev python3-numpy python3-pip
sudo apt-get install libxvidcore-dev libx264-dev libgtk-3-dev
sudo apt-get install libtbb2 libtbb-dev libdc1394-22-dev
sudo apt-get install libv4l-dev v4l-utils
sudo apt-get install liblapacke-dev
sudo apt install default-jre
sudo apt install redis-server
sudo apt install pkg-config
sudo apt install -y mongodb
sudo apt-get install libboost-all-dev
sudo apt-get install libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev
sudo apt-get install libavresample-dev libvorbis-dev libxine2-dev
sudo apt-get install libfaac-dev libmp3lame-dev libtheora-dev
sudo apt-get install libopencore-amrnb-dev libopencore-amrwb-dev
sudo apt-get install libopenblas-dev libatlas-base-dev libblas-dev
sudo apt-get install liblapack-dev libeigen3-dev gfortran
sudo apt-get install liblapack-dev libeigen3-dev gfortran
sudo apt-get install libprotobuf-dev libgoogle-glog-dev libgflags-dev
 sudo apt install libpcre3-dev libssl-dev zlib1g-dev
sudo apt install libavcodec-dev libavformat-dev libswscale-dev libavresample-dev libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev libxvidcore-dev x264 libx264-dev libfaac-dev libmp3lame-dev libtheora-dev libvorbis-dev python3-dev libatlas-base-dev gfortran libgtk-3-dev libv4l-dev
sudo apt install libcanberra-gtk0 libcanberra-gtk-common-dev libcanberra-gtk3-0 libcanberra-gtk-dev libcanberra-gtk3-dev  libcanberra-gtk-module libcanberra-gtk3-module 
```
# CMAKE >=3.19

```
See [Install cmake from source](https://github.com/Kitware/CMake.git)
git clone https://github.com/Kitware/CMake.git
cd cmake directory then ..
./bootstrap && make && sudo make install

```
# OPENCV 4.5.0 (GPU )

```
cd /tmp
wget -O opencv.zip https://github.com/opencv/opencv/archive/master.zip
wget -O opencv_contrib.zip https://github.com/opencv/opencv_contrib/archive/master.zip
unzip opencv.zip
unzip opencv_contrib.zip
# Create build directory and switch into it
mkdir -p build && cd build
#build opencv with dnn modules and cuda support
cmake -D CMAKE_BUILD_TYPE=RELEASE  \
-D CMAKE_C_COMPILER=/usr/bin/gcc-7 \
-D CMAKE_INSTALL_PREFIX=/usr/local \
-D OPENCV_EXTRA_MODULES_PATH=../opencv_contrib-master/modules ../opencv-master \
-D BUILD_TIFF=ON \
-D WITH_FFMPEG=ON \
-D WITH_GSTREAMER=ON \
-D WITH_TBB=ON \
-D BUILD_TBB=ON \
-D WITH_EIGEN=ON \
-D WITH_V4L=ON \
-D WITH_LIBV4L=ON \
-D WITH_VTK=OFF \
-D WITH_QT=OFF \
-D WITH_OPENGL=ON \
-D OPENCV_ENABLE_NONFREE=ON \
-D INSTALL_C_EXAMPLES=OFF \
-D INSTALL_PYTHON_EXAMPLES=OFF \
-D PYTHON_DEFAULT_EXECUTABLE=$(which python3) \
-D BUILD_SHARED_LIBS=OFF \
-D BUILD_NEW_PYTHON_SUPPORT=ON \
-D OPENCV_GENERATE_PKGCONFIG=ON \
-D BUILD_TESTS=OFF \
-D WITH_CUDA=ON \
-D WITH_CUDNN=ON \
-D OPENCV_DNN_CUDA=ON \
-D ENABLE_FAST_MATH=ON \
-D CUDA_FAST_MATH=ON \
-D WITH_CUBLAS=ON \
-D OPENCV_PC_FILE_NAME=opencv4.pc \
-D OPENCV_ENABLE_NONFREE=ON \
-D CUDA_TOOLKIT_ROOT_DIR=/usr/local/cuda-10.0 -D BUILD_EXAMPLES=OFF ..
```
```
make -j$(nproc)
sudo make install
sudo ldconfig
pkg-config --modversion opencv4
```
# OPENCV 4.5.0 
```
cd /tmp
wget -O opencv.zip https://github.com/opencv/opencv/archive/master.zip
wget -O opencv_contrib.zip https://github.com/opencv/opencv_contrib/archive/master.zip
unzip opencv.zip
unzip opencv_contrib.zip
# Create build directory and switch into it
mkdir -p build && cd build
cmake -D CMAKE_BUILD_TYPE=RELEASE  \
-D CMAKE_C_COMPILER=/usr/bin/gcc-7 \
-D CMAKE_INSTALL_PREFIX=/usr/local \
-D OPENCV_EXTRA_MODULES_PATH=../opencv_contrib-master/modules ../opencv-master \
-D BUILD_TIFF=ON \
-D WITH_FFMPEG=ON \
-D WITH_GSTREAMER=ON \
-D WITH_TBB=ON \
-D BUILD_TBB=ON \
-D WITH_EIGEN=ON \
-D OPENCV_ENABLE_NONFREE=ON \
-D INSTALL_C_EXAMPLES=OFF \
-D INSTALL_PYTHON_EXAMPLES=OFF \
-D PYTHON_DEFAULT_EXECUTABLE=$(which python3) \
-D BUILD_SHARED_LIBS=OFF \
-D BUILD_NEW_PYTHON_SUPPORT=ON \
-D OPENCV_GENERATE_PKGCONFIG=ON \
-D OPENCV_PC_FILE_NAME=opencv4.pc \
-D OPENCV_ENABLE_NONFREE=ON \
-D BUILD_EXAMPLES=OFF ..
```
```
make -j$(nproc)
sudo make install
sudo ldconfig
pkg-config --modversion opencv4
```
# python 3.5 +
```
#update & upgrade
    sudo apt update
    sudo apt install software-properties-common
    sudo apt install postgresql-server-dev-all
#repo
    sudo add-apt-repository ppa:deadsnakes/ppa
    Press [ENTER] to continue or Ctrl-c to cancel adding it.
#install
    sudo apt install python3.7
#check
    python3.7 --version
    sudo apt install libpq-dev python3-dev
```
# pip 
```
#install
    python3 -m pip install --upgrade pip
#upgrade
    pip3 install --upgrade setuptools
```
