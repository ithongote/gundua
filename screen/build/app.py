import os
import re
import ast
import cv2
import uuid 
import time
import signal
import string
import random
import queue
import requests
import itertools
import subprocess
from time import sleep
import simplejson as json
from threading import Thread
from datetime import datetime
from datetime import timedelta
from operator import itemgetter
import dateutil.parser as parser
from flask_cors import CORS, cross_origin
from collections import defaultdict, Iterable
from flask import Flask, session , flash, request, redirect, render_template ,jsonify

app=Flask(__name__)

q = queue.Queue()

cors = CORS(app, resources={

    r"/*": {
        "origins": "*"

    }
})

app.secret_key = "secret key"

# Get current path
path = os.getcwd()
# file Upload
UPLOAD_FOLDER_ADVERT = os.path.join(path, 'images')
# Make directory if uploads is not exists
if not os.path.isdir(UPLOAD_FOLDER_ADVERT ):
    os.mkdir(UPLOAD_FOLDER_ADVERT)

app.config['UPLOAD_FOLDER_ADVERT'] = UPLOAD_FOLDER_ADVERT 

# Supported File extensions
ALLOWED_EXTENSIONS_ADVERT  = set(['webp','m4v','vob', 'wmv', 'mov', 'mkv', 'webm', 'gif','mp4','avi','flv'])

import sys
import os.path
sys.path.append(os.path.abspath(os.path.join(
    os.path.dirname(__file__), os.path.pardir)))

def allowed_file_advert(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS_ADVERT

app.config['PERMANENT_SESSION_LIFETIME'] =  timedelta(minutes=5)

import sys
import os.path
sys.path.append(os.path.abspath(os.path.join(
    os.path.dirname(__file__), os.path.pardir)))


now = datetime.now()

@app.route('/')
def upload_form():
    return render_template('upload.html')

#SCREENS
res = ""
@app.route('/api/screens/start' , methods=['POST'])
def cctv():
    if request.method == 'POST':
        
        dict=request.json
        n =int(dict.get('screens'))
        status = ""
        status_list = []
        camera_details = {}
        camera_details_list = []
        #cameras = mongo.db.live_cams
        if dict.get('status') == True:
            '''
            for  camera in cameras.find():
                camera_details_list.append( str(camera['_id']))
            '''
            for i in range(n):
                camera_details_list.append(uuid.uuid1())

            if n > len(camera_details_list):
                status = "Only "+str(len(camera_details_list))+ " screens available"
                res={"status":status}
            else:
                print(camera_details_list)
                batches = [camera_details_list[i * n:(i + 1) * n] for i in range((len(camera_details_list) + n - 1) // n )]
                #START SUBSCRIBER
                for batch in batches:
                    for idx,_batch in enumerate(batch):
                        #VIDEO DISPLAY
                        if len(batch)==1 and idx==0:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),0,0,0,0)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==2 and idx==0:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),106,315,854,450)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==2 and idx==1:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),960,315,854,450)
                            #sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),Xpos,Ypos,Width,Height)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==3 and idx==0:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),106,90,854,450)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==3 and idx==1:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),960,90,854,450)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==3 and idx==2:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),533,540,854,450)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==4 and idx==0:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),106,90,854,450)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==4 and idx==1:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),960,90,854,450)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==4 and idx==2:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),106,540,854,450)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==4 and idx==3:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),960,540,854,450)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==5 and idx==0:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),0,75,640,480)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==5 and idx==1:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),640,75,640,480)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==5 and idx==2:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),1280,75,640,480)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==5 and idx==3:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),106,555,854,450)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==5 and idx==4:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),960,555,854,450)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==6 and idx==0:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),0,75,640,480)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==6 and idx==1:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),640,75,640,480)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==6 and idx==2:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),1280,75,640,480)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==6 and idx==3:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),0,555,640,480)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==6 and idx==4:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),640,555,640,480)
                            subprocess.run(["./POD",sub_metrics])

                        if len(batch)==6 and idx==5:
                            sub_metrics = ""
                            sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),1280,555,640,480)
                            #sub_metrics ="{},{},{},{},{},{},{},{},".format(batch[0],_batch,idx,len(batch),Xpos,Ypos,Width,Height)
                            subprocess.run(["./POD",sub_metrics])
                    res={"status":batch}
                    
                #START PUBLISHER
                for batch in batches:
                    pub_metrics =""
                    pub_metrics ="{},".format(batch[0])
                    subprocess.run(["./ENGINE",pub_metrics])
                    res={"status":"media started sucessfully"}
                    
        if dict.get('status') == False:
            res={"status":"media stopped sucessfully"}
    return jsonify(res)

@app.route('/api/billboard/ads/submit' , methods=['POST','GET'])
def Billboad_Left():
    res = " "
    dList = []
    while True:
        if request.method == 'POST':
            byte_str = request.data
            dict_str = byte_str.decode("UTF-8")
            mydata = ast.literal_eval(dict_str)
            
            ad_metrics ="{}".format(mydata.get('query'))
            pos = ad_metrics.rpartition(':')[-1]
            #print(pos)
            q.put(ad_metrics)
            return jsonify({'result':ad_metrics})
        
        if request.method == 'GET':
            try:
                query = q.get()
                if query:
                    print("Response From request: {}".format(query))
                return jsonify({'result':query})
            except Exception as ex:
                print("Exeption Raised ", ex)
       
@app.route('/api/edge/ads/submit' , methods=['POST'])
def billboad():
    if request.method == 'POST':
        #files = request.files.getlist('uploaded_file')
        upload_result = {}
        uploaded_advert_path = ""
        files = request.files.to_dict()
        for file in files:
            if file and allowed_file_advert(files[file].filename):
                advert_filename = files[file].filename
                file_extension = os.path.splitext(advert_filename)[1]
                advert_filename_as_timestamp=re.sub(r"\.", "", str(time.time()))
                filename = str(advert_filename_as_timestamp)+file_extension
                files[file].save(os.path.join(app.config['UPLOAD_FOLDER_ADVERT'], filename))
                uploaded_advert_path = str(UPLOAD_FOLDER_ADVERT) + "/" + filename
            else:
                upload_result = {  "status": "upload failed media file not supported"}
        #VALIDATE FILE
        try:
            cap = cv2.VideoCapture(uploaded_advert_path)
            if cap.isOpened(): 
                WIDTH  = cap.get(cv2.CAP_PROP_FRAME_WIDTH) 
                HEIGHT = cap.get(cv2.CAP_PROP_FRAME_HEIGHT) 
                upload_result = {  "MEDIAFILE": uploaded_advert_path , "WIDTH" : int(WIDTH) , "HEIGHT" : int(HEIGHT)}
            cap.release()
        except cv2.error as e:
            print(e)

    return jsonify(upload_result)

@app.route('/api/edge/controls/start' , methods=['POST'])
def billboad_controls():
    status={}
    if request.method == 'POST':
        request_data=request.get_json()
        if request_data.get('status') == True:
            start_metrics ="{} {} {} {}".format(request_data.get('signal'),request_data.get('screen'),request_data.get('width'),request_data.get('height'))
            print(start_metrics)
            proc=subprocess.Popen(["./BILLBOARD",request_data.get('signal'),request_data.get('screen'),request_data.get('width'),request_data.get('height')])
            #proc.wait()
            status = str(proc.pid)

        if request_data.get('status') == False:
            try:
                print(request_data.get('signal'))
                os.kill(int(float(request_data.get('signal'))), signal.SIGTERM) 
                print("{} --------  {}".format(" PID IS ",request_data.get('signal')))
                status = '200'
            except ProcessLookupError:
                status = '200'
                pass
    return status

def pubsub_task(i, q):
    while True:
        try:
            
            QUERY_OFF='SIGNAL_OFF'
            q.put(QUERY_OFF)
            sleep(0.5)
        except Timeout as ex:
            print("Exeption Raised ", ex)
            
if __name__ == "__main__":
    thread = Thread(target=pubsub_task , args=(1, q, ))
    thread.daemon = True
    thread.start()
    app.run(host='127.0.0.1',port=5007,use_reloader=False)
