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
DATA=$2
#CREATE WORKSPACE
WORKSPACE="/var/www/html/qrcode/"$(date +"%Y%m%d%H%M%S%N")
mkdir $WORKSPACE
#ALLOCATE RESOURCE
cp -r $FILE $WORKSPACE
#RENAME RESOURCE
EXTENSION=${FILE#*.}
#RESOURCE EXTENSION
INPUTVIDEO=$WORKSPACE"/"$(date +"%Y%m%d%H%M%S%N")"."$EXTENSION
mv $WORKSPACE"/""$(basename $FILE)" $INPUTVIDEO
#EMPTY QR CODE FILE
EMPTY_QR_CODE=$WORKSPACE"/"$(date +"%Y%m%d%H%M%S%N")"."$EXTENSION
ffmpeg -i $INPUTVIDEO -vf trim=0:30,geq=0:128:128 -af atrim=0:30,volume=0 -video_track_timescale 600 $EMPTY_QR_CODE
#ALIGN MERGED VIDEO SPEED
ALIGNED_INPUTVIDEO=$WORKSPACE"/"$(date +"%Y%m%d%H%M%S%N")"."$EXTENSION
ffmpeg -i $INPUTVIDEO -c copy -video_track_timescale 600 $ALIGNED_INPUTVIDEO
QR_CODE=$WORKSPACE"/"$(date +"%Y%m%d%H%M%S%N")"."$EXTENSION
#VIDEO DURATION
VIDEO_DURATION=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of default=noprint_wrappers=1:nokey=1 $INPUTVIDEO)
let start_time=${VIDEO_DURATION%.*}+1
let ending_time=${VIDEO_DURATION%.*}+4
ffmpeg -loop 1 -i $DATA -i $EMPTY_QR_CODE -filter_complex "overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:shortest=1:enable='between(t,$start_time,$ending_time)'" -preset fast -c:a copy $QR_CODE
#ADD BARCODE
CONCATFILE=$WORKSPACE"/"$(date +"%Y%m%d%H%M%S%N")".txt"
touch $CONCATFILE
#echo 'file'   $ALIGNED_INPUTVIDEO >> $CONCATFILE
echo 'file'   $INPUTVIDEO >> $CONCATFILE
echo 'file'   $QR_CODE >> $CONCATFILE
#MERGE VIDEO
OUTPUTVIDEO=$WORKSPACE"/"$(date +"%Y%m%d%H%M%S%N")"."$EXTENSION
ffmpeg -safe 0 -f concat -i $CONCATFILE -c copy $OUTPUTVIDEO
QR_BANNER=$WORKSPACE/$(basename -- ""$DATA"")
mv $DATA $WORKSPACE/
#DONE
#rm -rf $DATA
#rm -rf $QR_CODE
#rm -rf $CONCATFILE
#rm -rf $EMPTY_QR_CODE
#rm -rf $ALIGNED_INPUTVIDEO
#RESPONSE
echo $OUTPUTVIDEO":"$QR_BANNER
#echo "DURATION------->":$start_time " " $ending_time>> sample.txt
#COMMAND
#bash qcode.sh '/var/www/html/uploads/temporary/advert/20230628131115364904583/20230628131115378661147.mp4' '/var/www/html/encryption/build/example3.png'
