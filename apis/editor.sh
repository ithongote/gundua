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
mv $WORKSPACE"/""$(basename $FILE)" $WORKSPACE"/"input"."$EXTENSION
#RESIZE RESOURCE 
ffmpeg -i $WORKSPACE"/"input"."$EXTENSION -vf scale=$WIDTH:$HEIGHT $WORKSPACE"/"output"."$EXTENSION
#GENERATE FRAMES
mogrify -duplicate 4 $WORKSPACE"/"output"."$EXTENSION
#SLIDE LEFT
SLIDE_LEFT=$WORKSPACE"/"$(date +"%Y%m%d%H%M%S%N").mp4
ffmpeg \
-loop 1 -t 5 -i $WORKSPACE"/"output-0.$EXTENSION  \
-loop 1 -t 5 -i $WORKSPACE"/"output-1.$EXTENSION  \
-loop 1 -t 5 -i $WORKSPACE"/"output-2.$EXTENSION  \
-loop 1 -t 5 -i $WORKSPACE"/"output-3.$EXTENSION  \
-loop 1 -t 5 -i $WORKSPACE"/"output-4.$EXTENSION  \
-filter_complex \
"[0][1]xfade=transition=slideleft:duration=1.5:offset=2.5[f0]; \
[f0][2]xfade=transition=slideleft:duration=1.5:offset=5[f1]; \
[f1][3]xfade=transition=slideleft:duration=1.5:offset=7.5[f2]; \
[f2][4]xfade=transition=slideleft:duration=1.5:offset=10[f3]" \
-map "[f3]" -r 25 -pix_fmt yuv420p -vcodec libx264 $SLIDE_LEFT
#SLIDE RIGHT
SLIDE_RIGHT=$WORKSPACE"/"$(date +"%Y%m%d%H%M%S%N").mp4
ffmpeg \
-loop 1 -t 5 -i $WORKSPACE"/"output-0.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-1.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-2.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-3.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-4.$EXTENSION \
-filter_complex \
"[0][1]xfade=transition=slideright:duration=1.5:offset=2.5[f0]; \
[f0][2]xfade=transition=slideright:duration=1.5:offset=5[f1]; \
[f1][3]xfade=transition=slideright:duration=1.5:offset=7.5[f2]; \
[f2][4]xfade=transition=slideright:duration=1.5:offset=10[f3]" \
-map "[f3]" -r 25 -pix_fmt yuv420p -vcodec libx264 $SLIDE_RIGHT
#SLIDE UP
SLIDE_UP=$WORKSPACE"/"$(date +"%Y%m%d%H%M%S%N").mp4
ffmpeg \
-loop 1 -t 5 -i $WORKSPACE"/"output-0.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-1.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-2.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-3.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-4.$EXTENSION \
-filter_complex \
"[0][1]xfade=transition=slideup:duration=1.5:offset=2.5[f0]; \
[f0][2]xfade=transition=slideup:duration=1.5:offset=5[f1]; \
[f1][3]xfade=transition=slideup:duration=1.5:offset=7.5[f2]; \
[f2][4]xfade=transition=slideup:duration=1.5:offset=10[f3]" \
-map "[f3]" -r 25 -pix_fmt yuv420p -vcodec libx264 $SLIDE_UP
#SLIDE DOWN
SLIDE_DOWN=$WORKSPACE"/"$(date +"%Y%m%d%H%M%S%N").mp4
ffmpeg \
-loop 1 -t 5 -i $WORKSPACE"/"output-0.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-1.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-2.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-3.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-4.$EXTENSION \
-filter_complex \
"[0][1]xfade=transition=slidedown:duration=1.5:offset=2.5[f0]; \
[f0][2]xfade=transition=slidedown:duration=1.5:offset=5[f1]; \
[f1][3]xfade=transition=slidedown:duration=1.5:offset=7.5[f2]; \
[f2][4]xfade=transition=slidedown:duration=1.5:offset=10[f3]" \
-map "[f3]" -r 25 -pix_fmt yuv420p -vcodec libx264 $SLIDE_DOWN
#RECTANGLE DROP
RECTANGLE_DROP=$WORKSPACE"/"$(date +"%Y%m%d%H%M%S%N").mp4
ffmpeg \
-loop 1 -t 5 -i $WORKSPACE"/"output-0.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-1.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-2.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-3.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-4.$EXTENSION \
-filter_complex \
"[0][1]xfade=transition=rectcrop:duration=1.5:offset=2.5[f0]; \
[f0][2]xfade=transition=rectcrop:duration=1.5:offset=5[f1]; \
[f1][3]xfade=transition=rectcrop:duration=1.5:offset=7.5[f2]; \
[f2][4]xfade=transition=rectcrop:duration=1.5:offset=10[f3]" \
-map "[f3]" -r 25 -pix_fmt yuv420p -vcodec libx264 $RECTANGLE_DROP
#PIXELIZE
PIXELIZE=$WORKSPACE"/"$(date +"%Y%m%d%H%M%S%N").mp4
ffmpeg \
-loop 1 -t 5 -i $WORKSPACE"/"output-0.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-1.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-2.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-3.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-4.$EXTENSION \
-filter_complex \
"[0][1]xfade=transition=pixelize:duration=1.5:offset=2.5[f0]; \
[f0][2]xfade=transition=pixelize:duration=1.5:offset=5[f1]; \
[f1][3]xfade=transition=pixelize:duration=1.5:offset=7.5[f2]; \
[f2][4]xfade=transition=pixelize:duration=1.5:offset=10[f3]" \
-map "[f3]" -r 25 -pix_fmt yuv420p -vcodec libx264 $PIXELIZE
#CIRCLE DROP
CIRCLE_DROP=$WORKSPACE"/"$(date +"%Y%m%d%H%M%S%N").mp4
ffmpeg \
-loop 1 -t 5 -i $WORKSPACE"/"output-0.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-1.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-2.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-3.$EXTENSION \
-loop 1 -t 5 -i $WORKSPACE"/"output-4.$EXTENSION \
-filter_complex \
"[0][1]xfade=transition=circlecrop:duration=1.5:offset=2.5[f0]; \
[f0][2]xfade=transition=circlecrop:duration=1.5:offset=5[f1]; \
[f1][3]xfade=transition=circlecrop:duration=1.5:offset=7.5[f2]; \
[f2][4]xfade=transition=circlecrop:duration=1.5:offset=10[f3]" \
-map "[f3]" -r 25 -pix_fmt yuv420p -vcodec libx264 $CIRCLE_DROP

echo $SLIDE_LEFT":"$SLIDE_RIGHT":"$SLIDE_UP":"$SLIDE_DOWN":"$RECTANGLE_DROP":"$PIXELIZE":"$CIRCLE_DROP
