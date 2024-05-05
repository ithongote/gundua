#!/usr/bin/parallel --shebang-wrap --pipe /bin/bash
######################################################
#                                                    #
#       VSS --video streaming server pipeline ----   #
#           CHUNKS VIDEO FOR ADAPTIVE STREAMING      #
#               ---GPU                               #
#         AUTHOR @ {PIXEL ASSASSIN }                 #
#                                                    #
######################################################

FILE=$1
WIDTH=$2
HEIGHT=$3
#CREATE WORKSPACE
WORKSPACE="/var/www/html/uploads/temporary/advert/"$(date +"%Y%m%d%H%M%S%N")
mkdir $WORKSPACE
#ALLOCATE RESOURCE
cp -r $FILE $WORKSPACE
#RENAME RESOURCE
EXTENSION=${FILE#*.}
#RESOURCE EXTENSION
INPUTVIDEO=$WORKSPACE"/"input"."$EXTENSION
mv $WORKSPACE"/""$(basename $FILE)" $INPUTVIDEO
#RESIZE RSOURCE 
OUTPUTVIDEO=$WORKSPACE"/"$(date +"%Y%m%d%H%M%S%N")"."$EXTENSION
ffmpeg -i $INPUTVIDEO -vf scale=$WIDTH:$HEIGHT $OUTPUTVIDEO
#RESOURCE POSTER
OUTPUTIMAGE=$WORKSPACE"/"$(date +"%Y%m%d%H%M%S%N")"."png
ffmpeg -ss 00:00:02 -i $INPUTVIDEO -frames:v 1 $OUTPUTIMAGE
#REMOVE ORIGINAL FILE
#rm -rf $FILE
rm -rf $INPUTVIDEO
#VIDEO DURATION
VIDEO_DURATION=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of default=noprint_wrappers=1:nokey=1 $OUTPUTVIDEO)
#RESPONSE
echo $OUTPUTIMAGE":"$OUTPUTVIDEO":"${VIDEO_DURATION%.*}

