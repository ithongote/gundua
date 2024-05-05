import os
import re
import ast
import time
import cv2
import math
import json
import redis
import queue
import base64    
import signal
import string
import random
import hashlib
import calendar
import requests
import psycopg2
import threading
import subprocess 
import numpy as np
from time import sleep
from pathlib import Path
from datetime import date
import simplejson as json
from psycopg2 import Error
from threading import Thread
from subprocess import PIPE, run
from bson.json_util import dumps
from bson.objectid import ObjectId
from flask_cors import CORS, cross_origin
from psycopg2.extras import Json, DictCursor
from datetime import date, timedelta, datetime
from cv2 import VideoWriter, VideoWriter_fourcc
from flask import Flask, flash, request, redirect, render_template ,jsonify

app=Flask(__name__)

q = queue.Queue()
v = queue.Queue()
j = queue.Queue()

queueLock = threading.Lock()

thread_exit_Flag = 0

redis_conn = redis.Redis(charset="utf-8", decode_responses=True)

pubsub = redis_conn.pubsub()
pubsub.subscribe("broadcast")

cors = CORS(app, resources={

    r"/*": {
        "origins": "*"

    }
})

app.secret_key = "secret key"
#app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Get current path
path = os.getcwd()
# file Upload
UPLOAD_FOLDER_ADVERT = os.path.join(path, '/var/www/html/uploads/temporary/advert')
UPLOAD_FOLDER_PROFILE = os.path.join(path, '/var/www/html/uploads/permanent/profile')
UPLOAD_FOLDER_BILLBOARD = os.path.join(path, '/var/www/html/uploads/permanent/billboard')

# Make directory if uploads is not exists
if not os.path.isdir(UPLOAD_FOLDER_ADVERT ):
    os.mkdir(UPLOAD_FOLDER_ADVERT)

if not os.path.isdir(UPLOAD_FOLDER_PROFILE ):
    os.mkdir(UPLOAD_FOLDER_PROFILE)

if not os.path.isdir(UPLOAD_FOLDER_BILLBOARD ):
    os.mkdir(UPLOAD_FOLDER_BILLBOARD)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER_BILLBOARD 
app.config['UPLOAD_FOLDER_ADVERT'] = UPLOAD_FOLDER_ADVERT 
app.config['UPLOAD_FOLDER_PROFILE'] = UPLOAD_FOLDER_PROFILE

# Supported File extensions
ALLOWED_EXTENSIONS_BILLBOARD  = set(['png', 'jpg', 'jpeg'])
ALLOWED_EXTENSIONS_PROFILE    = set(['png', 'jpg', 'jpeg'])
ALLOWED_EXTENSIONS_ADVERT     = set(['webp','m4v','vob', 'wmv', 'mov', 'mkv', 'webm', 'gif','mp4','avi','flv'])

import sys
import os.path
sys.path.append(os.path.abspath(os.path.join(
    os.path.dirname(__file__), os.path.pardir)))

def allowed_file_advert(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS_ADVERT

def allowed_file_billboard(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS_BILLBOARD 


def allowed_file_profile(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS_PROFILE

def get_db_connection():
    conn = psycopg2.connect(host='localhost',
                            database='gala',
                            user='postgres',
                            password='dataLake')
    return conn

#PORTALS
ADMIN_URL       = 'http://127.0.0.1/tangazo/admin/'
AGENT_URL       = 'http://127.0.0.1/tangazo/agent/'
CLIENT_URL      = 'http://127.0.0.1/tangazo/client/'
DEFAULT_URL     = 'http://127.0.0.1/auth/login/'
CAMPAIGN_URL    = 'http://127.0.0.1/tangazo/client/campaigns/new/'
ADVERT_URL      = 'http://127.0.0.1/uploads/temporary/advert/'
PROFILE_URL     = 'http://127.0.0.1/uploads/permanent/profile/'
BILLBOARD_URL   = 'http://127.0.0.1/uploads/permanent/billboard/'
NO_VIDEO_POSTER = 'http://127.0.0.1/uploads/temporary/advert/novideo.png'
QR_CODE_URL     = 'http://127.0.0.1/qrcode/'

#CREATE PROFILE
@app.route('/api/profile/create' , methods=['POST'])
def CREATE_PROFILE():
    if request.method == 'POST':
        #TEST EMAIL
        try:
            RESULT        = {}
            upload_result = {}
            API_RESULT    = request.get_json()
            conn          = get_db_connection()
            cur           = conn.cursor()
            cur.execute("SELECT * FROM users WHERE user_email = %s ", (API_RESULT['email'],))
            conn.commit()
            test_record = cur.fetchone()
            if(test_record != None):
                msg = "EMAIL " + API_RESULT['email'] + " ALREADY  EXISTS"
                RESULT = {  "msg": msg ,"status":"201"}
            if(test_record == None):
                try:
                    #upload profile image
                    uploaded_advert_path   = " "
                    filename_as_timestamp  =re.sub(r"\.", "", str(time.time()))
                    filename               = filename_as_timestamp+'.'+API_RESULT['extension']
                    uploaded_profile_path  = UPLOAD_FOLDER_PROFILE + "/" + filename
                    with open(uploaded_profile_path,"wb") as f:
                        f.write(base64.b64decode(API_RESULT['file']))
                    API_RESULT.pop('file')
                    print(API_RESULT)
                    #upload profile details
                    upload_result = {  "status": uploaded_profile_path}
                    if(upload_result): 
                        today = date.today()
                        sentence = "%.20f" % time.time()
                        user_id= re.sub('(?<=\d)[,.](?=\d)','',sentence)
                        _date =today.strftime("%b-%d-%Y")
                        registration_date = date.today().strftime("%b-%d-%Y")
                        try:
                            conn = get_db_connection()
                            cur = conn.cursor()  
                            cur.execute('INSERT INTO users (user_id, first_name , last_name, user_email, user_password, user_role, user_status, user_gender, user_telephone, user_date_of_birth, user_registration_date, user_image , user_agency_id , user_agency)'
                            'VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)',
                            (user_id,API_RESULT['first_name'],API_RESULT['last_name'],API_RESULT['email'],API_RESULT['password'],API_RESULT['role'],API_RESULT['status'],API_RESULT['gender'],API_RESULT['telephone'],API_RESULT['dob'],registration_date,uploaded_profile_path,API_RESULT['id'],API_RESULT['agency']))
                            conn.commit()
                            msg = "PROFILE " + user_id +" CREATED SUCESSFULLY"

                            #SELECT REGISTERED USERS  
                            cur.execute("SELECT * FROM users WHERE user_email = %s AND user_password = %s", (API_RESULT['email'],API_RESULT['password']))
                            conn.commit()
                            user_records = cur.fetchone()
                            print(user_records)
                            if(API_RESULT['email'] == user_records[3] and API_RESULT['password'] == user_records[4]):
                                if (user_records[6] =='active'):
                                    if (user_records[5] =='client'):
                                        RESULT = {"msg":"REGISTRATION SUCESSFULL","agent":user_records[3],"key":API_RESULT['password'],"status":"200" ,"id":user_records[12]}

                        except (Exception, Error) as error:
                            
                            msg="ERROR OCURRED .. CONTACT ADMIN " + str(error)
                            print(msg)
                            RESULT = {"msg":msg,"status":"201"}
                        finally:
                            if (conn):
                                cur.close()
                                conn.close()
                except Error:
                    RESULT = {  "msg": "UPLOAD FAILED . MEDIA TYPE NOT SUPPORTED.","uri":"#","status":"201"}
        except Error:
            RESULT = {  "msg": "REGISTRATION NOT SUCCESSFULL","uri":"#","status":"201"}
    return jsonify(RESULT)

#AUTH PROFILES
@app.route('/api/auth/profile' , methods=['POST'])
def AUTHENTICATE_PROFILE():
    if request.method == 'POST':
        RESULT = {}
        API_RESULT = request.get_json()
        try:
            conn = get_db_connection()
            cur = conn.cursor()  
            cur.execute("SELECT * FROM users WHERE user_email = %s ", (API_RESULT['username'],))
            conn.commit()
            test_record = cur.fetchone()
            if(API_RESULT['username'] == test_record[3]):
                try:
                    conn = get_db_connection()
                    cur = conn.cursor()  
                    cur.execute("SELECT * FROM users WHERE user_email = %s AND user_password = %s", (API_RESULT['username'],API_RESULT['password']))
                    conn.commit()
                    user_records = cur.fetchone()
                    if(API_RESULT['password'] != user_records[4]):
                        RESULT = {"msg":"WRONG PASSWORD","uri":DEFAULT_URL,"status":"201"}
                    if(API_RESULT['username'] != user_records[3] and API_RESULT['password'] != user_records[4]):
                        RESULT = {"msg":"WRONG USERNAME AND PASSWORD","uri":DEFAULT_URL,"status":"201"}
                    if(API_RESULT['username'] == user_records[3] and API_RESULT['password'] == user_records[4]):
                        if (user_records[6] =='active'):
                            if (user_records[5] =='admin'):
                                RESULT = {"msg":"LOGIN SUCESSFULL","uri":ADMIN_URL,"status":"200" ,"id":user_records[7]}
                            if (user_records[5] =='agent'):
                                RESULT = {"msg":"LOGIN SUCESSFULL","uri":AGENT_URL,"status":"200" ,"id":user_records[7]}
                            if (user_records[5] =='client'):
                                RESULT = {"msg":"LOGIN SUCESSFULL","uri":CLIENT_URL,"status":"200" ,"id":user_records[7]}
                        if (user_records[6] !='active'):
                            MSG = "Account " + user_records[3] + " currently " + user_records[6] + ". Contact Admin "
                            RESULT = {"msg":MSG ,"uri":DEFAULT_URL,"status":"201"}
                except (Exception, Error) as error:
                    RESULT = {"msg":"WRONG EMAIL ADDRESS OR PASSWORD","uri":DEFAULT_URL,"status":"201"}
                finally:
                    if (conn):
                        cur.close()
                        conn.close()
            if(API_RESULT['username'] != test_record[3]):
                    RESULT = {"msg":"WRONG  EMAIL ADDRESS","uri":DEFAULT_URL,"status":"201"}
        except (Exception, Error) as error:
            #err="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg":"WRONG EMAIL ADDRESS","uri":DEFAULT_URL ,"status":"201"}
        finally:
            if (conn):
                cur.close()
                conn.close()
    return jsonify(RESULT)

#ACTIVATE PROFILES
@app.route('/api/profile/activate/<id>' , methods=['POST'])
def ACTIVATE_PROFILE(id):
    if request.method == 'POST':
        delete_result = {}
        try:
            conn = get_db_connection()
            # Open a cursor to perform database operations
            cur = conn.cursor()  
            cur.execute('UPDATE users set user_status = %s WHERE user_id = %s', (request.form['activate'],id))
            conn.commit()
            if(request.form['activate']=='active'):
                status = "USER " + id +" ACTIVATED SUCESSFULLY"
            
            if(request.form['activate']=='inactive'):
                status = "USER " + id +" DEACTIVATED SUCESSFULLY"

            if(request.form['activate']=='suspended'):
                status = "USER " + id +" SUSPENDED SUCESSFULLY"

            delete_result ={"status":status}
        except (Exception, Error) as error:
            
            err="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            delete_result ={"status":err}
        finally:
            if (conn):
                cur.close()
                conn.close()
    return jsonify(delete_result)

#QUERY PROFILES
@app.route('/api/profile/query/all' , methods=['POST'])
def QUERY_PROFILES():
    if request.method == 'POST':
        RESULT ={}
        Query_List = []
        API_RESULT = request.get_json()
        print(API_RESULT)
        if(API_RESULT['query']=="all"):
            data = requests.get('http://localhost:9200/idxudb/_search?size='+str(API_RESULT['limit']))
            response = data.json()
            elastic_docs = response["hits"]["hits"]
            for num, doc in enumerate(elastic_docs):
                try:
                    source_data = doc["_source"]
                    source_data.pop("_meta", None)
                    #source_data.pop("billboard_ip_address", None)
                    source_data["user_image"] = PROFILE_URL + os.path.basename(source_data['user_image'])
                    Query_List.append(source_data)
                except TypeError:
                    print('TypeError')
            Query_Result = [i for n, i in enumerate(Query_List) if i not in Query_List[n + 1:]]
            RESULT = {"msg":Query_Result ,"status":"200"}
    return jsonify(Query_Result)

#QUERY PROFILE
@app.route('/api/profile/query' , methods=['POST'])
def QUERY_PROFILE():
    if request.method == 'POST':
        API_RESULT = request.get_json()
        RESULT ={}
        data = requests.get('http://localhost:9200/idxudb/_search?q='+API_RESULT['query'])
        response = data.json()
        Query_List = []
        elastic_docs = response["hits"]["hits"]
        for num, doc in enumerate(elastic_docs):
            try:
                source_data = doc["_source"]
                source_data.pop("_meta", None)
                source_data["user_image"] = PROFILE_URL + os.path.basename(source_data['user_image'])
                Query_List.append(source_data)
            except TypeError:
                Query_List=[]

        Query_Result = [i for n, i in enumerate(Query_List) if i not in Query_List[n + 1:]]
        RESULT = {"msg":Query_Result ,"status":"200"}
    return jsonify(RESULT)

#UPDATE PROFILE
@app.route('/api/profile/update/<id>' , methods=['POST'])
def UPDATE_PROFILE(id):
    if request.method == 'POST':
        upload_result = {}
        uploaded_profile_path = " "
        try:
            #upload profile image
            files = request.files.to_dict()

            for file in files:
                if file and allowed_file_profile(files[file].filename):
                    profile_filename = files[file].filename
                    file_extension = os.path.splitext(profile_filename)[1]
                    profile_filename_as_timestamp=re.sub(r"\.", "", str(time.time()))
                    filename = str(profile_filename_as_timestamp)+file_extension
                    files[file].save(os.path.join(app.config['UPLOAD_FOLDER_PROFILE'], filename))
                    uploaded_profile_path = str(UPLOAD_FOLDER_PROFILE) + "/" + filename
                else:
                    upload_result = {  "status": "UPLOAD FAILED . MEDIA TYPE NOT SUPPORTED."}
            #upload profile details
            upload_result = {  "status": uploaded_profile_path}
            if(upload_result): 
                try:
                    conn = get_db_connection()
                    cur = conn.cursor()  
                    cur.execute('UPDATE users SET first_name = %s , last_name = %s, user_email = %s , user_password = %s, user_gender = %s, user_telephone = %s, user_date_of_birth = %s, user_image = %s WHERE user_id = %s',
                    (request.form['Firstname'],request.form['Lastname'],request.form['Email'],request.form['Password'],request.form['Gender'],request.form['Telephone'],request.form['Dob'],uploaded_profile_path,id))
                    conn.commit()
                    
                    status = "PROFILE " + id +" UPDATED SUCESSFULLY"
                    upload_result ={"status":status,"sessionid":id}
                except (Exception, Error) as error:
                    
                    err="ERROR OCURRED .. CONTACT ADMIN  " + str(error)
                    upload_result ={"status":err}
                finally:
                    if (conn):
                        cur.close()
                        conn.close()
            
        except Error:
            upload_result = { "status":"Error"}
        return jsonify(upload_result)

#CREATE BILLBOARD
@app.route('/api/billboard/create' , methods=['POST'])
def CREATE_BILLBOARD():
    if request.method == 'POST':
        try:
            #upload billboard image
            RESULT ={}
            upload_result = {}
            API_RESULT = request.get_json()
            
            uploaded_advert_path = " "
            filename_as_timestamp=re.sub(r"\.", "", str(time.time()))
            filename  = filename_as_timestamp+'.'+API_RESULT['extension']
            _filename = UPLOAD_FOLDER_BILLBOARD + "/" + filename
            with open(_filename,"wb") as f:
                f.write(base64.b64decode(API_RESULT['file']))
            API_RESULT.pop('file')
            print( API_RESULT)
            #upload billboard details
            upload_result = {  "status": _filename}
            if(upload_result): 
                sentence = "%.20f" % time.time()
                id= re.sub('(?<=\d)[,.](?=\d)','',sentence)
                try:
                    conn = get_db_connection()
                    # Open a cursor to perform database operations
                    cur = conn.cursor()  
                    cur.execute('INSERT INTO billboard (billboard_id, billboard_image , billboard_daily_views, billboard_sign_placement, billboard_traffic_direction, billboard_availability, billboard_duration, billboard_height, billboard_width, billboard_name, billboard_latitude, billboard_longitude, billboard_ip_address, billboard_screen_count , billboard_status , billboard_city , billboard_state , billboard_zip , billboard_county , billboard_country , billboard_vcpus , billboard_owner_name , billboard_admin_id , billboard_agency_id,zoom_level)'
                    'VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s ,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)',(id,_filename,API_RESULT['daily_views'],API_RESULT['sign_placement'],API_RESULT['traffic_direction'],API_RESULT['availability'],API_RESULT['duration'],API_RESULT['dimension_height'],API_RESULT['dimension_width'],API_RESULT['name'],API_RESULT['latitude'],API_RESULT['longitude'],API_RESULT['ip_address'],API_RESULT['screen_count'],API_RESULT['status'],API_RESULT['city'],API_RESULT['state'],API_RESULT['zip'],API_RESULT['county'],API_RESULT['country'],API_RESULT['capacity'],API_RESULT['agency_name'],API_RESULT['id'],API_RESULT['agency_id'],API_RESULT['map_zoom']))
                    conn.commit()

                    #UPDATE LOCATIONS
                    cur.execute('INSERT INTO locations (location_id, city , state , zip, county ,country , names)''VALUES (%s, %s, %s, %s, %s, %s, %s)',(id,API_RESULT['city'],API_RESULT['state'],API_RESULT['zip'],API_RESULT['county'],API_RESULT['country'],API_RESULT['name']))
                    conn.commit()
                    
                    msg = "BILLBOARD " + id +" CREATED SUCESSFULLY"
                    BILLBOARD_URL_SUCESSFULL = ADMIN_URL + "?" + API_RESULT['id']
                    RESULT = {"msg":msg,"uri":BILLBOARD_URL_SUCESSFULL ,"status":"200"}
                except (Exception, Error) as error:
                    
                    msg="ERROR OCURRED .. CONTACT ADMIN " + str(error)
                    RESULT = {"msg":msg,"uri":"#","status":"201"}
                finally:
                    if (conn):
                        cur.close()
                        conn.close()
            
        except Error:
            RESULT = {  "msg": "UPLOAD FAILED . MEDIA TYPE NOT SUPPORTED.","uri":"#","status":"201"}

        return jsonify(RESULT)

#DELETE BILLBOARD
@app.route('/api/billboard/delete/<id>' , methods=['POST'])
def DELETE_BILLBOARD(id):
    if request.method == 'POST':
        delete_result = {}
        try:
            conn = get_db_connection()
            # Open a cursor to perform database operations
            cur = conn.cursor()  
            cur.execute("DELETE FROM billboard WHERE billboard_id = %s", (id,))
            conn.commit()
            status = "BILLBOARD " + id +" DELETED SUCESSFULLY"
            
            delete_result ={"status":status}
        except (Exception, Error) as error:
            
            err="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            delete_result ={"status":err}
        finally:
            if (conn):
                cur.close()
                conn.close()
    return jsonify(delete_result)

#ACTIVATE BILLBOARDS
@app.route('/api/billboard/activate/<id>' , methods=['POST'])
def ACTIVATE_BILLBOARDS(id):
    if request.method == 'POST':
        delete_result = {}
        try:
            conn = get_db_connection()
            # Open a cursor to perform database operations
            cur = conn.cursor()  
            cur.execute('UPDATE billboard set billboard_availability = %s WHERE billboard_id = %s', (request.form['availability'],id))
            conn.commit()
            if(request.form['availability']=='available'):
                status = "BILLBOARD " + id +" IS NOW AVAILABLE"
            
            if(request.form['availability']=='unavailable'):
                status = "USER " + id +" IS NOW UNAVAILABLE"

            if(request.form['availability']=='suspend'):
                status = "USER " + id +" OPERATIONS HAS BEEN SUSPENDED"

            delete_result ={"status":status}
        except (Exception, Error) as error:
            
            err="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            delete_result ={"status":err}
        finally:
            if (conn):
                cur.close()
                conn.close()
    return jsonify(delete_result)

#UPDATE BILLBOARD
@app.route('/api/billboard/update/<id>' , methods=['POST'])
def UPDATE_BILLBOARD(id):
    if request.method == 'POST':
        update_result = {}
        updated_advert_path = " "
        try:
            #update billboard image
            files = request.files.to_dict()

            for file in files:
                if file and allowed_file_billboard(files[file].filename):
                    advert_filename = files[file].filename
                    file_extension = os.path.splitext(advert_filename)[1]
                    advert_filename_as_timestamp=re.sub(r"\.", "", str(time.time()))
                    filename = str(advert_filename_as_timestamp)+file_extension
                    files[file].save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                    updated_advert_path = str(UPLOAD_FOLDER_BILLBOARD) + "/" + filename
                else:
                    update_result = {  "status": "update failed media file not supported"}
            #update billboard details
            update_result = {  "status": updated_advert_path}
            if(update_result): 
                try:
                    conn = get_db_connection()
                    # Open a cursor to perform database operations
                    cur = conn.cursor()
                    cur.execute('UPDATE billboard SET billboard_image = %s , billboard_daily_views = %s , billboard_sign_placement = %s , billboard_traffic_direction = %s , billboard_availability = %s , billboard_duration = %s , billboard_dimension = %s , billboard_name = %s , billboard_latitude = %s , billboard_longitude= %s , billboard_ip_address = %s , billboard_screen_count = %s , billboard_status = %s WHERE billboard_id = %s ', (updated_advert_path,request.form['daily_views'],request.form['sign_placement'],request.form['traffic_direction'],
                     request.form['availability'],request.form['duration'],request.form['dimension'],request.form['name'],request.form['latitude'],request.form['longitude'],request.form['ip_address'],request.form['screen_count'],request.form['status'],id))

                    conn.commit()
                    
                    status = "billboard " + id +" updated sucessfully"
                    update_result ={"status":status}
                except (Exception, Error) as error:
                    
                    err="ERROR OCURRED .. CONTACT ADMIN " + str(error)
                    update_result ={"status":err}
                finally:
                    if (conn):
                        cur.close()
                        conn.close()
            
        except Error:
            update_result = { "status":"Error"}
        return jsonify(update_result)

#START / STOP BILLBOARD
@app.route('/api/billboard/controls/start' , methods=['POST'])
def START_STOP_ADVERT():
    if request.method == 'POST':
        RESULT         ={}
        BILLBOARD_DICT = []
        BILLBOARD_LIST = []
        API_RESULT = request.get_json()
        try:
            conn = get_db_connection()
            # Validate Billboard
            cur = conn.cursor()  
            cur.execute("SELECT * FROM billboard WHERE billboard_id = %s", (API_RESULT['id'],))
            conn.commit()
            billboard_records = cur.fetchone()

            BANNER=BILLBOARD_URL + os.path.basename(billboard_records[2])
            BILLBOARD_DICT={"billboard_name":billboard_records[9] , "billboard_image": BANNER,"billboard_daily_views": billboard_records[3],"billboard_screen_count":billboard_records[14],"billboard_traffic_direction":billboard_records[5],"billboard_availability":billboard_records[6],"billboard_width":billboard_records[26],"billboard_height":billboard_records[27],"billboard_owner_name":billboard_records[29],"billboard_status":billboard_records[13]}
            BILLBOARD_LIST.append(BILLBOARD_DICT)
            
            if(billboard_records[13] == API_RESULT['status'] ):
                if(billboard_records[13] == 'ON'):
                    RESULT = {"msg" : " BILLBOARD ALREADY RUNNING . KINDLY TURN OFF THEN ON TO UPDATE FURTHER CHANGES ","status":"200","mode":API_RESULT['status'],"banner":BILLBOARD_LIST}

                if(billboard_records[13] == 'OFF'):
                    RESULT = {"msg" : " BILLBOARD ALREADY STOPPED . KINDLY TURN ON THEN OFF TO UPDATE FURTHER CHANGES ","status":"200","mode":API_RESULT['status'],"banner":BILLBOARD_LIST}
            
            if(billboard_records[13] != API_RESULT['status']):
                try:
                    if(API_RESULT['status'] == 'ON'):
                        WIDTH  = billboard_records[26]
                        HEIGHT = billboard_records[27]
                        print(billboard_records[12])
                        URL =  billboard_records[12]+'/api/edge/controls/start'
                        
                        PAYLOAD = {'screen': API_RESULT['screen'] , 'signal':'START' ,'width': WIDTH , 'height': HEIGHT ,'status': True}
                        res = requests.post(URL, json=PAYLOAD)
                        
                        if(res.text!=''):
                            print("{} --------  {}".format(" PID IS ",res.text))
                            #UPDATE DB
                            try:
                                conn = get_db_connection()
                                cur = conn.cursor()
                                cur.execute('UPDATE billboard SET  billboard_status = %s ,billboard_pid = %s WHERE billboard_id = %s ', (API_RESULT['status'],res.text ,API_RESULT['id']))
                                conn.commit()
                                
                                msg = "BILLBOARD " + billboard_records[9] + " IS NOW " + API_RESULT['status']
                                RESULT = {"msg" : msg,"status":"200","mode":API_RESULT['status'],"banner":BILLBOARD_LIST}

                            except (Exception, Error) as error:
                                
                                msg="EDGE DEVICE IS OFFLINE "
                                RESULT = {"msg" : msg,"status":"201","mode":API_RESULT['status'],"banner":BILLBOARD_LIST}
                            finally:
                                if (conn):
                                    cur.close()
                                    conn.close()

                    if(API_RESULT['status'] == 'OFF'):
                        URL =  billboard_records[12]+'/api/edge/controls/start'
                        PAYLOAD = {'signal':billboard_records[15] ,'status': False}
                        res = requests.post(URL, json=PAYLOAD)
                        if(res.text=='200'):
                            #UPDATE DB
                            try:
                                conn = get_db_connection()
                                cur = conn.cursor()
                                cur.execute('UPDATE billboard SET  billboard_status = %s,billboard_pid = %s WHERE billboard_id = %s ', (API_RESULT['status'],'',API_RESULT['id']))
                                conn.commit()
                                
                                msg = "BILLBOARD " + billboard_records[9] + " IS NOW " + API_RESULT['status']
                                RESULT = {"msg" : msg,"status":"200","mode":API_RESULT['status'],"banner":BILLBOARD_LIST}
                            except (Exception, Error) as error:
                                
                                msg="EDGE DEVICE IS OFFLINE "
                                RESULT = {"msg" : msg,"status":"201","mode":API_RESULT['status'],"banner":BILLBOARD_LIST}
                            finally:
                                if (conn):
                                    cur.close()
                                    conn.close()

                except (Exception, Error) as error:
                    
                    msg="EDGE DEVICE IS OFFLINE "
                    RESULT = {"msg" : msg,"status":"201","mode":API_RESULT['status'],"banner":BILLBOARD_LIST}
                finally:
                    if (conn):
                        cur.close()
                        conn.close()
        except (Exception, Error) as error:
            print(error)
            msg="ERROR OCURRED .. CONTACT ADMIN  "
            RESULT = {"msg" : msg,"status":"201","mode":API_RESULT['status'],"banner":BILLBOARD_LIST}
        finally:
            if (conn):
                cur.close()
                conn.close()
        print(RESULT)
    return jsonify(RESULT)

#QUERY BILLBOARDS
@app.route('/api/billboard/query/all' , methods=['POST'])
def QUERY_BILLBOARDS():
    if request.method == 'POST':
        RESULT ={}
        Query_List = []
        API_RESULT = request.get_json()
        if(API_RESULT['query']=="all"):
            data = requests.get('http://localhost:9200/idxbdb/_search?size='+str(API_RESULT['limit']))
            response = data.json()
            Query_List = []
            elastic_docs = response["hits"]["hits"]
            for num, doc in enumerate(elastic_docs):
                try:
                    source_data = doc["_source"]
                    source_data.pop("_meta", None)
                    source_data.pop("billboard_ip_address", None)
                    source_data["billboard_image"] = BILLBOARD_URL + os.path.basename(source_data['billboard_image'])
                    Query_List.append(source_data)
                except TypeError:
                    print('TypeError')
            Query_Result = [i for n, i in enumerate(Query_List) if i not in Query_List[n + 1:]]
            print(Query_Result)
            RESULT = {"msg":Query_Result ,"status":"200"}
    return jsonify(RESULT)

#QUERY BILLBOARD
@app.route('/api/billboard/query/<query>' , methods=['POST'])
def QUERY_BILLBOARD(query):
    if request.method == 'POST':
        _response ={}
        data = requests.get('http://localhost:9200/idxbdb/_search?q='+query+'&size='+str(request.form['limit']))
        response = data.json()
        Query_List = []
        elastic_docs = response["hits"]["hits"]
        for num, doc in enumerate(elastic_docs):
            try:
                source_data = doc["_source"]
                source_data.pop("_meta", None)
                source_data.pop("billboard_ip_address", None)
                source_data["billboard_image"] = "IP_ADRRESS/" + os.path.basename(source_data['billboard_image'])
                Query_List.append(source_data)
            except TypeError:
                print('TypeError')

        Query_Result = [i for n, i in enumerate(Query_List) if i not in Query_List[n + 1:]]
    return jsonify(Query_Result)

#SELECT BILLBOARD
@app.route('/api/billboard/select' , methods=['POST'])
def SELECT_BILLBOARD():
    if request.method == 'POST':
        RESULT ={}
        Query_List = []
        API_RESULT = request.get_json()
        data = requests.get('http://localhost:9200/idxbdb/_search?q='+API_RESULT['query'])
        response = data.json()
        Query_List = []
        elastic_docs = response["hits"]["hits"]
        for num, doc in enumerate(elastic_docs):
            try:
                source_data = doc["_source"]
                source_data.pop("_meta", None)
                #source_data.pop("billboard_ip_address", None)
                source_data["billboard_image"] = BILLBOARD_URL + os.path.basename(source_data['billboard_image'])
                Query_List.append(source_data)
            except TypeError:
                print('TypeError')
        Query_Result = [i for n, i in enumerate(Query_List) if i not in Query_List[n + 1:]]
        RESULT = {"msg":Query_Result ,"status":"200"}
    return jsonify(RESULT)

#QUERY BILLBOARD BY LOCATION
@app.route('/api/billboard/query/location' , methods=['POST'])
def QUERY_BILLBOARD_LOCATION():
    if request.method == 'POST':
        _response ={}
        data = requests.get('http://localhost:9200/idxbdb/_search?&size='+str(request.form['limit'])+'&q='+str(request.form['latitude'])+'&q='+str(request.form['longitude']))
        response = data.json()
        Query_List = []
        elastic_docs = response["hits"]["hits"]
        for num, doc in enumerate(elastic_docs):
            try:
                source_data = doc["_source"]
                source_data.pop("_meta", None)
                source_data.pop("billboard_ip_address", None)
                source_data["billboard_image"] = "IP_ADRRESS/" + os.path.basename(source_data['billboard_image'])
                Query_List.append(source_data)
            except TypeError:
                print('TypeError')
        Query_Result = [i for n, i in enumerate(Query_List) if i not in Query_List[n + 1:]]
    return jsonify(Query_Result)

#QUERY BILLBOARD BY AUTOCOMPLETE
@app.route('/api/billboard/query/autocomplete' , methods=['POST'])
def QUERY_BILLBOARD_AUTOCOMPLETE():
    
    if request.method == 'POST':
        RESULT ={}
        Query_List = []
        API_RESULT = request.get_json()
        data = requests.get('http://localhost:9200/idxbdb/_search?q='+str(API_RESULT['query'])+'&size='+str(API_RESULT['limit']))
        response = data.json()
        elastic_docs = response["hits"]["hits"]
        for num, doc in enumerate(elastic_docs):
            try:
                source_data = doc["_source"]
                source_data.pop("_meta", None)
                source_data.pop("billboard_ip_address", None)
                source_data["billboard_image"] = BILLBOARD_URL + os.path.basename(source_data['billboard_image'])
                Query_List.append(source_data)
            except TypeError:
                print('TypeError')
        Query_Result = [i for n, i in enumerate(Query_List) if i not in Query_List[n + 1:]]
        
        RESULT = {"msg":Query_Result ,"status":"200"}
    return jsonify(RESULT)

@app.route('/api/billboard/query/client' , methods=['POST'])
def CLIENT_QUERY_BILLBOARDS():
 if request.method == 'POST':
    RESULT            = {}
    Query_List        = []
    billboard_records = []
    billboard_status  = ''
    API_RESULT = request.get_json()
    try:
        conn = get_db_connection()
        cur = conn.cursor()  
        cur.execute('SELECT * FROM campaigns  WHERE campaign_id = %s AND campaign_owner_id = %s',(API_RESULT['campaign_id'],API_RESULT['uid']))
        conn.commit()
        campaign_records = cur.fetchone()
        if(campaign_records[0]==API_RESULT['campaign_id']):

            if (campaign_records[2] != None):
                data         = requests.get('http://localhost:9200/idxbdb/_search?q='+campaign_records[2])
                response     = data.json()
                elastic_docs = response["hits"]["hits"]
                for num, doc in enumerate(elastic_docs):
                    try:
                        source_data = doc["_source"]
                        source_data.pop("_meta", None)
                        source_data["billboard_image"] = BILLBOARD_URL + os.path.basename(source_data['billboard_image'])
                        Query_List.append(source_data)
                    except TypeError:
                        print('TypeError')
                billboard_records = [i for n, i in enumerate(Query_List) if i not in Query_List[n + 1:]]
                billboard_status  = '1'
            if (campaign_records[2] == None):
                data         = requests.get('http://localhost:9200/idxbdb/_search?size='+str(50))
                response     = data.json()
                Query_List   = []
                elastic_docs = response["hits"]["hits"]
                for num, doc in enumerate(elastic_docs):
                    try:
                        source_data = doc["_source"]
                        source_data.pop("_meta", None)
                        source_data.pop("billboard_ip_address", None)
                        source_data["billboard_image"] = BILLBOARD_URL + os.path.basename(source_data['billboard_image'])
                        Query_List.append(source_data)
                    except TypeError:
                        print('TypeError')
                billboard_records = [i for n, i in enumerate(Query_List) if i not in Query_List[n + 1:]]
                billboard_status  = '0'

            RESULT = {"msg":billboard_records ,"status":"200","id":billboard_status}

    except (Exception, Error) as error:
        msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
        RESULT = {"msg" : msg,"status":"201"}
    finally:
        if (conn):
            cur.close()
            conn.close()
    return jsonify(RESULT)

#UPDATE EDGE STATUS
@app.route('/api/billboard/device/status' , methods=['POST'])
def UPDATE_EDGE_STATUS():
    if request.method == 'POST':
        RESULT ={}
        API_RESULT = request.get_json()

        try:
            conn = get_db_connection()
            cur = conn.cursor()  
            cur.execute('UPDATE billboard set billboard_screen_count = %s WHERE billboard_id = %s AND billboard_admin_id = %s', (API_RESULT['screen'],API_RESULT['bid'],API_RESULT['baid']))
            conn.commit()
            msg = "BILLBOARD STATUS UPDATED SUCESSFULLY ."
            RESULT = {"msg" : msg,"status":"200"}
        except (Exception, Error) as error:
            
            msg="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}
        finally:
            if (conn):
                cur.close()
                conn.close()
    return jsonify(RESULT)

#CREATE A CAMPAIGN
@app.route('/api/campaign/create' , methods=['POST'])
def CREATE_CAMPAIGN(bid=None, uid=None):
    if request.method == 'POST':
        RESULT ={}
        Query_List = []
        API_RESULT = request.get_json()
        sentence = "%.20f" % time.time()
        campaign_id= re.sub('(?<=\d)[,.](?=\d)','',sentence)
        try:
            conn = get_db_connection()
            cur = conn.cursor()  
            cur.execute('INSERT INTO campaigns (campaign_id, campaign_status, campaign_name,campaign_category,campaign_owner_id)'
                        'VALUES (%s, %s, %s, %s, %s)',
                        (campaign_id,'ONGOING',API_RESULT['name'].title(),API_RESULT['category'],API_RESULT['id']))

            conn.commit()

            msg = "CAMPAIGN " + API_RESULT['name'] +" CREATED SUCESSFULLY ."
            RESULT = {"msg" : msg,"status":"200","uri":CAMPAIGN_URL,"id":campaign_id}

        except (Exception, Error) as error:
            
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201","sessionId":API_RESULT['id']}
        finally:
            if (conn):
                cur.close()
                conn.close()

        return jsonify(RESULT)

@app.route('/api/campaign/locations' , methods=['POST'])
def CAMPAIGN_LOCATIONS(bid=None, uid=None):
    if request.method == 'POST':
        RESULT ={}
        Query_List = []
        API_RESULT = request.get_json()
        try:
            conn = get_db_connection()
            cur  =  conn.cursor(cursor_factory=DictCursor) 

            cur.execute("SELECT billboard_id , billboard_owner_name ,billboard_agency_id FROM billboard WHERE billboard_id = %s", (API_RESULT['billboard_id'],))
            conn.commit()
            billboard_records = cur.fetchone()

            if billboard_records[0]== API_RESULT['billboard_id']:
                cur.execute('UPDATE campaigns SET business_id = %s , campaign_billboard_owner = %s , campaign_agency_id = %s , campaign_media_controls = %s WHERE campaign_id = %s AND campaign_owner_id = %s',
                (API_RESULT['billboard_id'],billboard_records[1],billboard_records[2],Json(API_RESULT['btn'][0]),API_RESULT['campaign_id'],API_RESULT['uid'] ))
                conn.commit()
            RESULT = {"msg" : "BILLBOARD SAVED SUCESSFULLY ","status":"200"}
            
        except (Exception, Error) as error:
            
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}
        finally:
            if (conn):
                cur.close()
                conn.close()

    return jsonify(RESULT)

@app.route('/api/campaign/budget' , methods=['POST'])
def CAMPAIGN_BUDGET(bid=None, uid=None):
    if request.method == 'POST':
        RESULT ={}
        Query_List = []
        API_RESULT = request.get_json()
      
        try:
            conn = get_db_connection()
            cur = conn.cursor()  
            cur.execute('UPDATE campaigns SET daily_budget = %s ,campaign_start_date = %s, campaign_end_date = %s WHERE campaign_id = %s AND campaign_owner_id = %s',
            (API_RESULT['budget'],API_RESULT['start'],API_RESULT['end'],API_RESULT['campaign_id'],API_RESULT['uid']))
            conn.commit()
            
            msg ="BILLBOARD BUDGET SAVED SUCESSFULLY " 
            RESULT = {"msg" : msg,"status":"200","sessionId":API_RESULT['uid']}
        except (Exception, Error) as error:
            
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}
        finally:
            if (conn):
                cur.close()
                conn.close()
            
    return jsonify(RESULT)

@app.route('/api/campaign/schedule' , methods=['POST'])
def CAMPAIGN_SCHEDULE(bid=None, uid=None):
    if request.method == 'POST':
        RESULT ={}
        Query_List = []
        API_RESULT = request.get_json()
     
        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=DictCursor)
            cur.execute('UPDATE campaigns SET schedule = %s  WHERE campaign_id = %s AND campaign_owner_id = %s',
            (Json([json.loads(API_RESULT['schedule'][0])]),API_RESULT['campaign_id'],API_RESULT['uid']))
            conn.commit()
            
            msg ="SCHEDULE SAVED SUCESSFULLY " 
            RESULT = {"msg" : msg,"status":"200","sessionId":API_RESULT['uid']}
        except (Exception, Error) as error:
            
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}
        finally:
            if (conn):
                cur.close()
                conn.close()
        
    return jsonify(RESULT)

@app.route('/api/campaign/query' , methods=['POST'])
def CAMPAIGN_QUERY(bid=None, uid=None):
    if request.method == 'POST':
        RESULT ={}
        DISPLAY = []
        API_RESULT = request.get_json()
        try:
            conn = get_db_connection()
            cur = conn.cursor()  
            cur.execute('SELECT * FROM campaigns  WHERE campaign_id = %s AND campaign_owner_id = %s',(API_RESULT['campaign_id'],API_RESULT['uid']))
            conn.commit()
            campaign_records = cur.fetchone()
            if(campaign_records[0]==API_RESULT['campaign_id']):
                cur.execute('SELECT billboard_screen_count , billboard_width , billboard_height,billboard_name FROM billboard WHERE billboard_id = %s',(API_RESULT['billboard_id'],))
                conn.commit()
                billboard_records = cur.fetchone()
                msg ="BILLBOARD SAVED SUCESSFULLY"
                S_W_H = " "
                if(billboard_records[0]== '1'):
                    DISPLAY.append(['FULL'])
                    S_W_H = billboard_records[0]+':'+billboard_records[1]+':'+billboard_records[2]
                    RESULT = {"msg" : msg,"status":"200","display":DISPLAY,"swh":S_W_H}
                if(billboard_records[0]=='2'):
                    DISPLAY.append(['LEFT','RIGHT'])
                    S_W_H = billboard_records[0]+':'+billboard_records[1]+':'+billboard_records[2]
                    RESULT = {"msg" : msg,"status":"200","display":DISPLAY,"swh":S_W_H}
                if(billboard_records[0]=='3'):
                    DISPLAY.append(['TOP-LEFT','TOP-RIGHT','BOTTOM'])
                    S_W_H = billboard_records[0]+':'+billboard_records[1]+':'+billboard_records[2]
                    RESULT = {"msg" : msg,"status":"200","display":DISPLAY,"swh":S_W_H}
                if(billboard_records[0]=='4'):
                    DISPLAY.append(['LEFT','RIGHT','BOTTOM-LEFT','BOTTOM-RIGHT'])
                    S_W_H = billboard_records[0]+':'+billboard_records[1]+':'+billboard_records[2]
                    RESULT = {"msg" : msg,"status":"200","display":DISPLAY,"swh":S_W_H}
        except (Exception, Error) as error:
            print(error)
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}
        finally:
            if (conn):
                cur.close()
                conn.close()
    return jsonify(RESULT)

@app.route('/api/campaign/design' , methods=['POST'])
def CAMPAIGN_DESIGN(bid=None, uid=None):
    if request.method == 'POST':
        RESULT ={}
        Query_List = []
        API_RESULT = request.get_json()
        uploaded_advert_path = " "
        filename_as_timestamp=re.sub(r"\.", "", str(time.time()))
        _filename = UPLOAD_FOLDER_ADVERT+ "/" + filename_as_timestamp+'.'+API_RESULT['extension']
        with open(_filename,"wb") as f:
            f.write(base64.b64decode(API_RESULT['file']))

        API_RESULT.pop('file')
        VIDEO_POSTER                   = []
        DESIGN_MEDIA_TIMESTAMP         = []
        DESIGN_MEDIA_ANIMATIONS        = []
        DESIGN_MEDIA_PATH_ANIMATIONS   = []
        DESIGN_MEDIA_POSTER_ANIMATIONS = []

        if(API_RESULT['extension']=='mp4' or API_RESULT['extension']=='avi' or API_RESULT['extension']=='webm'):
            image_width      = 0 
            image_height     = 0
            marginX_position = 0
            marginY_position = 0
            #BIBBOARD 1920x1080
            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='1' and API_RESULT['media_position'] =='FULL':
                marginX_position = 0
                marginY_position = 0
                image_width      = API_RESULT['width']
                image_height     = API_RESULT['height']

            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='2' and API_RESULT['media_position'] =='LEFT':
                marginX_position = 0
                marginY_position = 0
                image_width      = 1920
                image_height     = 540

            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='2' and API_RESULT['media_position'] =='RIGHT':
                marginX_position = 960
                marginY_position = 0
                image_width      = 1920
                image_height     = 540

            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='3' and API_RESULT['media_position'] =='TOP-LEFT':
                marginX_position = 0
                marginY_position = 0
                image_width      = 960
                image_height     = 540

            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='3' and API_RESULT['media_position'] =='TOP-RIGHT':
                marginX_position = 960
                marginY_position = 0
                image_width      = 960
                image_height     = 540

            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='3' and API_RESULT['media_position'] =='BOTTOM':
                marginX_position = 0
                marginY_position = 540
                image_width      = 1920
                image_height     = 540
            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='4' and API_RESULT['media_position'] =='LEFT':
                marginX_position = 0
                marginY_position = 0
                image_width      = 960
                image_height     = 540

            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='4' and API_RESULT['media_position'] =='RIGHT':
                marginX_position = 960
                marginY_position = 0
                image_width      = 960
                image_height     = 540
            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='4' and API_RESULT['media_position'] =='BOTTOM-LEFT':
                marginX_position = 0
                marginY_position = 540
                image_width      = 960
                image_height     = 540

            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='4' and API_RESULT['media_position'] =='BOTTOM-RIGHT':
                marginX_position = 960
                marginY_position = 540
                image_width      = 960
                image_height     = 540

            #BIBBOARD 1280x720
            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='1' and API_RESULT['media_position'] =='FULL':
                marginX_position = 0
                marginY_position = 0
                image_width      = API_RESULT['width']
                image_height     = API_RESULT['height']

            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='2' and API_RESULT['media_position'] =='LEFT':
                marginX_position = 0
                marginY_position = 0
                image_width      = 1280
                image_height     = 360

            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='2' and API_RESULT['media_position'] =='RIGHT':
                marginX_position = 0
                marginY_position = 360
                image_width      = 1280
                image_height     = 360

            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='3' and API_RESULT['media_position'] =='TOP-LEFT':
                marginX_position = 0
                marginY_position = 0
                image_width      = 640
                image_height     = 360

            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='3' and API_RESULT['media_position'] =='TOP-RIGHT':
                marginX_position = 640
                marginY_position = 0
                image_width      = 640
                image_height     = 360

            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='3' and API_RESULT['media_position'] =='BOTTOM':
                marginX_position = 0
                marginY_position = 360
                image_width      = 1280
                image_height     = 360
            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='4' and API_RESULT['media_position'] =='LEFT':
                marginX_position = 0
                marginY_position = 0
                image_width      = 640
                image_height     = 360

            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='4' and API_RESULT['media_position'] =='RIGHT':
                marginX_position = 640
                marginY_position = 0
                image_width      = 640
                image_height     = 360
            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='4' and API_RESULT['media_position'] =='BOTTOM-LEFT':
                marginX_position = 0
                marginY_position = 360
                image_width      = 640
                image_height     = 360

            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='4' and API_RESULT['media_position'] =='BOTTOM-RIGHT':
                marginX_position = 640
                marginY_position = 360
                image_width      = 640
                image_height     = 360

            print("{},{},{},{}".format(marginX_position,marginY_position,image_height,image_width))
            names        = ['Bingo','Alpha','Ceramic','Tudor','Beta','Numba','Ponzi']
            output = subprocess.run(['/bin/bash',"./studio.sh",_filename,str(image_width),str(image_height)], stdout=PIPE, stderr=PIPE, universal_newlines=True)
            for out in output.stdout.split(':'):
                DESIGN_MEDIA_URL            =  ADVERT_URL + os.path.basename(os.path.dirname(out)) + '/' + Path(out).name
                DESIGN_MEDIA_PATH_URL       =  os.path.basename(os.path.dirname(out)) + '/' + Path(out).name
                DESIGN_VIDEO_TIMESTAMP      =  out
                DESIGN_MEDIA_ANIMATIONS.append(DESIGN_MEDIA_URL)
                DESIGN_MEDIA_TIMESTAMP.append(DESIGN_VIDEO_TIMESTAMP)

            #[+2 seconds to compensate for errors]
            VIDEO_DURATION = int(DESIGN_MEDIA_TIMESTAMP[2]) + 2
            print('{}{}'.format("DURATION IS ", VIDEO_DURATION))
            VIDEO_POSTER = DESIGN_MEDIA_ANIMATIONS[0]

            if len(DESIGN_MEDIA_ANIMATIONS)==3:
                try:
                    conn = get_db_connection()
                    cur = conn.cursor() 
                    cur.execute('SELECT * FROM campaigns  WHERE campaign_id = %s AND campaign_owner_id = %s',(API_RESULT['campaign_id'],API_RESULT['uid']))
                    conn.commit()
                    campaign_records = cur.fetchone()
                    if(campaign_records[0]==API_RESULT['campaign_id']):
                        conn = get_db_connection()
                        cur = conn.cursor()
                        cur.execute('UPDATE campaigns SET campaign_media_position = %s,campaign_media_content = %s ,campaign_media_type = %s ,campaign_poster = %s ,campaign_media_xpos = %s ,campaign_media_ypos = %s ,campaign_media_width = %s ,campaign_media_height = %s ,campaign_media_length = %s ,campaign_media_preview = %s WHERE campaign_id = %s AND campaign_owner_id = %s',
                        (API_RESULT['media_position'],DESIGN_MEDIA_ANIMATIONS[1],'video',DESIGN_MEDIA_ANIMATIONS[0],str(marginX_position),str(marginY_position),str(image_width),str(image_height),str(VIDEO_DURATION),_filename,API_RESULT['campaign_id'],API_RESULT['uid']))
                        conn.commit()
                        DESIGN_MEDIA_ANIMATIONS        = DESIGN_MEDIA_ANIMATIONS[1 : -1]
                        DESIGN_MEDIA_ANIMATIONS.append(VIDEO_POSTER)

                        RESULT = {"msg" : "RECORD SAVED SUCESSFULLY" ,"status":"200","videos":DESIGN_MEDIA_ANIMATIONS,"names":names ,"xpos":marginX_position,"ypos":marginY_position,"h":image_height,"w":image_width,"mpos":API_RESULT['media_position']}
                except (Exception, Error) as error:
            
                    msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
                    RESULT = {"msg" : msg,"status":"201"}
                finally:
                    if (conn):
                        cur.close()
                        conn.close()
    return jsonify(RESULT)

@app.route('/api/campaign/review' , methods=['POST'])
def CAMPAIGN_REVIEW(bid=None, uid=None):
    if request.method == 'POST':
        RESULT ={}
        Query_List = []
        advert_records = []
        design_records = []
        budget_records = []
        schedule_records = []
        qr_code_records = []
        API_RESULT = request.get_json()
        try:
            conn = get_db_connection()
            cur = conn.cursor()  
            cur.execute('SELECT * FROM campaigns  WHERE campaign_id = %s AND campaign_owner_id = %s',(API_RESULT['campaign_id'],API_RESULT['uid']))
            conn.commit()
            campaign_records = cur.fetchone()

            if(campaign_records[0]==API_RESULT['campaign_id']):

                if (campaign_records[2] != None):
                    data = requests.get('http://localhost:9200/idxbdb/_search?q='+campaign_records[2])
                    response = data.json()
                    billboard_records = []
                    elastic_docs = response["hits"]["hits"]
                    for num, doc in enumerate(elastic_docs):
                        try:
                            source_data = doc["_source"]
                            source_data.pop("_meta", None)
                            source_data["billboard_image"] = BILLBOARD_URL + os.path.basename(source_data['billboard_image'])
                            Query_List.append(source_data)
                        except TypeError:
                            print('TypeError')
                    billboard_records = [i for n, i in enumerate(Query_List) if i not in Query_List[n + 1:]]
                if (campaign_records[2] == None):
                    billboard_records = [{'billboard_name':'?'}]

                RECORD_1 = []
                RECORD_2 = []
                RECORD_3 = []
                RECORD_4 = []
                RECORD_5 = []

                NAME , STATUS , CATEGORY , MAGNATE             = campaign_records[8] , campaign_records[7] , campaign_records[12] , campaign_records[20]
                RECORD_1                                       = [NAME , STATUS , CATEGORY , MAGNATE]
                if((RECORD_1[0])==None):
                    RECORD_1[0]='?'
                if((RECORD_1[1])==None):
                    RECORD_1[1]='?'
                if((RECORD_1[2])==None):
                    RECORD_1[2]='?'
                if((RECORD_1[3])==None):
                    RECORD_1[3]='?'
                    
                DESIGN_MEDIA_URL , CHANNEL , DESIGN_POSTER_URL = campaign_records[10] ,campaign_records[13] ,campaign_records[14]
                RECORD_2                                          = [DESIGN_MEDIA_URL , CHANNEL , DESIGN_POSTER_URL] 

                if (CHANNEL != None):
                    if campaign_records[9] == 'video':
                        if((RECORD_2[0])!=None):
                            RECORD_2[0] = ADVERT_URL + RECORD_2[0][51:]
                        if((RECORD_2[2])!=None):
                            RECORD_2[2]=ADVERT_URL + RECORD_2[2][51:]
                    if campaign_records[9] == 'image':
                        if((RECORD_2[0])!=None):
                            RECORD_2[0] = ADVERT_URL + RECORD_2[0][51:]
                        if((RECORD_2[2])!=None):
                            RECORD_2[2]=ADVERT_URL + Path(RECORD_2[2]).name

                if (CHANNEL == None):
                    RECORD_2[0] = '?'
                    RECORD_2[1] = '?'
                    RECORD_2[2] = NO_VIDEO_POSTER

                DAILY_BUDGET , START_DATE , END_DATE           = campaign_records[3] , campaign_records[4] , campaign_records[5]
                RECORD_3                                       = [DAILY_BUDGET , START_DATE , END_DATE]
                if((RECORD_3[0])==None):
                    RECORD_3[0]='?'
                if((RECORD_3[1])==None):
                    RECORD_3[1]='?'
                if((RECORD_3[2])==None):
                    RECORD_3[2]='?'

                SCHEDULE                                       = campaign_records[6]
                RECORD_4                                       = [SCHEDULE]
                if((RECORD_4[0])==None):
                    RECORD_4[0]={}

                QR_VIDEO_URL , QR_BANNER_URL , QR_POSTER_URL = campaign_records[26] ,campaign_records[27] ,campaign_records[14]
                RECORD_5                                     = [QR_VIDEO_URL , QR_BANNER_URL , QR_POSTER_URL]
                if((RECORD_5[0])==None):
                    RECORD_5[0]='?'
                if((RECORD_5[0])!=None):
                    RECORD_5[0] = QR_CODE_URL + RECORD_5[0][21:]
                if((RECORD_5[1])==None):
                    RECORD_5[1]='?'
                if((RECORD_5[1])!=None):
                    RECORD_5[1] = QR_CODE_URL + RECORD_5[1][21:]
                if((RECORD_5[2])==None):
                    RECORD_5[2]='?'
                if((RECORD_5[2])!=None):
                    RECORD_5[2] = ADVERT_URL + Path(RECORD_5[2]).name

                schedule_records.append(RECORD_4[0])
                qr_code_records.append({"qvid":RECORD_5[0],"qimg":RECORD_5[1],"qposter":RECORD_5[2]})
                design_records.append({"source_file":RECORD_2[0], "channel":RECORD_2[1], "poster" : RECORD_2[2]})
                budget_records.append({"daily_budget":RECORD_3[0], "start_date":RECORD_3[1], "end_date":RECORD_3[2]})
                advert_records.append({"name":RECORD_1[0], "status":RECORD_1[1], "category":RECORD_1[2], "magnate":RECORD_1[3]})
                msg ="CAMPAIGN SAVED FOR  APPROVAL" 
                RESULT = {"msg" : msg,"status":"200","location":billboard_records,"campaign":advert_records,"budget":budget_records,"design":design_records,"event":campaign_records[7],"schedule":schedule_records,"qrcode":qr_code_records}

        except (Exception, Error) as error:
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}
        finally:
            if (conn):
                cur.close()
                conn.close()
    return jsonify(RESULT)

@app.route('/api/campaign/submit' , methods=['POST'])
def CAMPAIGN_SUBMIT(bid=None, uid=None):
    if request.method == 'POST':
        RESULT ={}
        Query_List = []
        API_RESULT = request.get_json()
        try:
            conn = get_db_connection()
            cur = conn.cursor()  
            cur.execute('UPDATE campaigns SET campaign_status = %s  WHERE campaign_id = %s AND campaign_owner_id = %s',
            (API_RESULT['status'],API_RESULT['campaign_id'],API_RESULT['uid']))
            conn.commit()
            
            msg ="REVIEW SAVED SUCESSFULLY " 
            RESULT = {"msg" : msg,"status":"200","sessionId":API_RESULT['uid'],"uri":CLIENT_URL}
        except (Exception, Error) as error:
            
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}
        finally:
            if (conn):
                cur.close()
                conn.close()

    return jsonify(RESULT)

@app.route('/api/campaign/status' , methods=['POST'])
def CAMPAIGN_STATUS(bid=None, uid=None):
    if request.method == 'POST':
        RESULT     = {}
        DISPLAY    = []
        advert_records    = []
        design_records    = []
        budget_records    = []
        schedule_records  = []
        billboard_records = []
        campaign_records  = []
        API_RESULT = request.get_json()
        print(API_RESULT)
        try:
            conn = get_db_connection()
            cur = conn.cursor()  
            if API_RESULT['status'] == 'ALL':
                cur.execute('SELECT * FROM campaigns  WHERE  campaign_owner_id = %s AND campaign_status = %s OR  campaign_status = %s OR  campaign_status = %s',(API_RESULT['uid'],'PENDING','TERMINATED','APPROAVED'))
                conn.commit()
                campaign_records = cur.fetchall()
            if API_RESULT['status'] != 'ALL':
                cur.execute('SELECT * FROM campaigns  WHERE  campaign_owner_id = %s AND campaign_status = %s',(API_RESULT['uid'],API_RESULT['status']))
                conn.commit()
                campaign_records = cur.fetchall()
            for campaign_record in campaign_records:
                data = requests.get('http://localhost:9200/idxbdb/_search?q='+campaign_record[2])
                response = data.json()
                elastic_docs = response["hits"]["hits"]
                for num, doc in enumerate(elastic_docs):
                    try:
                        source_data = doc["_source"]
                        source_data.pop("_meta", None)
                        #source_data.pop("billboard_ip_address", None)
                        source_data["billboard_image"] = BILLBOARD_URL + os.path.basename(source_data['billboard_image'])
                        billboard_records.append(source_data)
                    except TypeError:
                        print('TypeError')
                DESIGN_POSTER_URL       = " "
                DESIGN_MEDIA_URL        = " "
                if campaign_record[9] == 'video':
                    DESIGN_MEDIA_URL    = campaign_record[10]
                    DESIGN_POSTER_URL   = ADVERT_URL + campaign_record[14][51:]
                if campaign_record[9] == 'image':
                    DESIGN_MEDIA_URL    = campaign_record[10]
                    DESIGN_POSTER_URL   = ADVERT_URL + Path(campaign_record[14]).name
                DESIGN_ADVERT_CATEGORY  = campaign_record[12]
                DESIGN_ADVERT_NAME      = campaign_record[8]
                print(campaign_record[14])
                schedule_records.append(campaign_record[6][0])
                advert_records.append({"name":campaign_record[8], "status":campaign_record[7], "category":campaign_record[12] , "magnate":campaign_record[20],"source_file":DESIGN_MEDIA_URL, "channel":campaign_record[13], "poster" : DESIGN_POSTER_URL,"name":DESIGN_ADVERT_NAME, "id":campaign_record[0], "campaign_owner_id":API_RESULT['uid']})
                design_records.append({"source_file":DESIGN_MEDIA_URL, "channel":campaign_record[13], "poster" : DESIGN_POSTER_URL})
                budget_records.append({"daily_budget":campaign_record[3], "start_date":campaign_record[4], "end_date":campaign_record[5]})

            msg ="SUCCESS" 
            RESULT = {"msg" : msg,"status":"200","location":billboard_records,"budget":budget_records,"schedule":schedule_records,"design":design_records,"campaign":advert_records}
        except (Exception, Error) as error:
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}
        finally:
            if (conn):
                cur.close()
                conn.close()
    
    return jsonify(RESULT)
    
@app.route('/api/campaign/client/query' , methods=['POST'])
def CAMPAIGN_CLIENT_QUERY(bid=None, uid=None):
    if request.method == 'POST':
        RESULT            = {}
        DISPLAY           = []
        advert_records    = []
        design_records    = []
        budget_records    = []
        schedule_records  = []
        billboard_records = []
        campaign_records  = []
        API_RESULT        = request.get_json()
        try:
            data              = requests.get('http://localhost:9200/idxcpdb/_search?&q='+str(API_RESULT['query']))
            response          = data.json()
            campaign_records  = []
            elastic_docs = response["hits"]["hits"]
            for num, doc in enumerate(elastic_docs):
                try:
                    source_data = doc["_source"]
                    source_data.pop("_meta", None)
                    if API_RESULT['status'] == 'ALL':
                        if source_data["campaign_owner_id"] == API_RESULT['uid'] and source_data["campaign_status"] != 'ONGOING':
                            campaign_records.append(source_data)
                    if API_RESULT['status'] != 'ALL':
                        if source_data["campaign_owner_id"] == API_RESULT['uid'] and source_data["campaign_status"] == API_RESULT['status']:
                            campaign_records.append(source_data)
                except TypeError:
                    print('TypeError')
            campaign_records = [i for n, i in enumerate(campaign_records) if i not in campaign_records[n + 1:]]
            print(campaign_records)
            for campaign_record in campaign_records:
                data = requests.get('http://localhost:9200/idxbdb/_search?q='+campaign_record['business_id'])
                response = data.json()
                elastic_docs = response["hits"]["hits"]
                for num, doc in enumerate(elastic_docs):
                    try:
                        source_data = doc["_source"]
                        source_data.pop("_meta", None)
                        source_data["billboard_image"] = BILLBOARD_URL + os.path.basename(source_data['billboard_image'])
                        billboard_records.append(source_data)
                    except TypeError:
                        print('TypeError')
                DESIGN_POSTER_URL       = " "
                DESIGN_MEDIA_URL        = " "
                if campaign_record['campaign_media_type'] == 'video':
                    DESIGN_MEDIA_URL    = ADVERT_URL + campaign_record['campaign_media_content'][51:]
                    DESIGN_POSTER_URL   = ADVERT_URL + campaign_record['campaign_poster']
                if campaign_record['campaign_media_type'] == 'image':
                    DESIGN_MEDIA_URL    = ADVERT_URL + campaign_record['campaign_media_content'][51:]
                    DESIGN_POSTER_URL   = ADVERT_URL + Path(campaign_record['campaign_poster']).name
                DESIGN_ADVERT_CATEGORY  = campaign_record['campaign_category']
                DESIGN_ADVERT_NAME      = campaign_record['campaign_name']
                advert_records.append({"name":campaign_record['campaign_name'], "status":campaign_record['campaign_status'], "category":campaign_record['campaign_category'] , "magnate":campaign_record['campaign_billboard_owner'],"source_file":DESIGN_MEDIA_URL, "channel":campaign_record['campaign_media_position'], "poster" : DESIGN_POSTER_URL,"name":DESIGN_ADVERT_NAME, "id":campaign_record['campaign_id'], "campaign_owner_id":API_RESULT['uid']})
                design_records.append({"source_file":DESIGN_MEDIA_URL, "channel":campaign_record['campaign_media_position'], "poster" : DESIGN_POSTER_URL})
                budget_records.append({"daily_budget":campaign_record['daily_budget'], "start_date":campaign_record['campaign_start_date'], "end_date":campaign_record['campaign_end_date']})

            RESULT = {"msg" : "SUCCESS" ,"status":"200","location":billboard_records,"budget":budget_records,"schedule":schedule_records,"design":design_records,"campaign":advert_records}
        except (Exception, Error) as error:
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}
        finally:
            print('--------------')
    return jsonify(RESULT)

@app.route('/api/campaign/status/ongoing' , methods=['POST'])
def CAMPAIGN_STATUS_ONGOING(bid=None, uid=None):
    if request.method == 'POST':
        RESULT ={}
        DISPLAY = []
        API_RESULT = request.get_json()
        try:
            conn = get_db_connection()
            cur = conn.cursor()  
            cur.execute('SELECT * FROM campaigns  WHERE  campaign_owner_id = %s AND campaign_status = %s',(API_RESULT['uid'],'ONGOING'))
            conn.commit()
            campaign_records = cur.fetchall()
            advert_records = []
            for campaign_record in campaign_records:
                DESIGN_POSTER_URL       = " "
                DESIGN_MEDIA_URL        = " "
                if campaign_record[9] == 'video':
                    DESIGN_MEDIA_URL    = ADVERT_URL + campaign_record[10][45:]
                    DESIGN_POSTER_URL   = ADVERT_URL + campaign_record[14][45:]
                if campaign_record[9] == 'image':
                    DESIGN_MEDIA_URL    = ADVERT_URL + campaign_record[10][21:]
                    DESIGN_POSTER_URL   = ADVERT_URL + Path(campaign_record[14]).name
                DESIGN_ADVERT_CATEGORY  = campaign_record[12]
                DESIGN_ADVERT_NAME      = campaign_record[8]
                advert_records.append({"source_file":DESIGN_MEDIA_URL, "channel":campaign_record[13], "poster" : DESIGN_POSTER_URL,"name":DESIGN_ADVERT_NAME, "campaign_id":campaign_record[0],"uri":CAMPAIGN_URL,"id":campaign_record[0], "category":DESIGN_ADVERT_CATEGORY, "campaign_owner_id":API_RESULT['uid']})
            msg ="SUCCESS "
            RESULT = {"msg" : msg, "status":"200" , "advert": advert_records}
        except (Exception, Error) as error:
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}
        finally:
            if (conn):
                cur.close()
                conn.close()
    return jsonify(RESULT)

@app.route('/api/campaign/delete' , methods=['POST'])
def DELETE_CAMPAIGN():
    if request.method == 'POST':
        RESULT       = {}
        API_RESULT = request.get_json()
        try:
            conn = get_db_connection()
            cur = conn.cursor()  
            cur.execute('UPDATE campaigns SET campaign_status = %s  WHERE campaign_id = %s',(API_RESULT['status'],API_RESULT['campaign_id']))
            conn.commit()
            RESULT = {"msg" : "CAMPAIGN DELETED","status":"200"}
        except (Exception, Error) as error:
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}
        finally:
            if (conn):
                cur.close()
                conn.close()
    return jsonify(RESULT)

@app.route('/api/campaign/animate' , methods=['POST'])
def CAMPAIGN_ANIMATE(bid=None, uid=None):
    if request.method == 'POST':
        RESULT ={}
        Query_List = []
        API_RESULT = request.get_json()
        uploaded_advert_path = " "
        filename_as_timestamp=re.sub(r"\.", "", str(time.time()))
        _filename = UPLOAD_FOLDER_ADVERT+ "/" + filename_as_timestamp+'.'+API_RESULT['extension']
        with open(_filename,"wb") as f:
            f.write(base64.b64decode(API_RESULT['file']))

        API_RESULT.pop('file')
        print(API_RESULT)
        
        DESIGN_MEDIA_ANIMATIONS        = []
        DESIGN_MEDIA_PATH_ANIMATIONS   = []
        DESIGN_MEDIA_POSTER_ANIMATIONS = []
        VIDEO_POSTER                   = UPLOAD_FOLDER_ADVERT+ "/" + filename_as_timestamp+'.'+API_RESULT['extension']

        if(API_RESULT['extension']=='jpg' or API_RESULT['extension']=='png' or API_RESULT['extension']=='jpeg'):
            image_width      = 0 
            image_height     = 0
            marginX_position = 0
            marginY_position = 0
            #BIBBOARD 1920x1080
            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='1' and API_RESULT['media_position'] =='FULL':
                marginX_position = 0
                marginY_position = 0
                image_width      = API_RESULT['width']
                image_height     = API_RESULT['height']

            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='2' and API_RESULT['media_position'] =='LEFT':
                marginX_position = 0
                marginY_position = 0
                image_width      = 1920
                image_height     = 540

            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='2' and API_RESULT['media_position'] =='RIGHT':
                marginX_position = 960
                marginY_position = 0
                image_width      = 1920
                image_height     = 540

            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='3' and API_RESULT['media_position'] =='TOP-LEFT':
                marginX_position = 0
                marginY_position = 0
                image_width      = 960
                image_height     = 480

            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='3' and API_RESULT['media_position'] =='TOP-RIGHT':
                marginX_position = 960
                marginY_position = 0
                image_width      = 960
                image_height     = 480

            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='3' and API_RESULT['media_position'] =='BOTTOM':
                marginX_position = 0
                marginY_position = 480
                image_width      = 1920
                image_height     = 480
            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='4' and API_RESULT['media_position'] =='LEFT':
                marginX_position = 0
                marginY_position = 0
                image_width      = 960
                image_height     = 540

            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='4' and API_RESULT['media_position'] =='RIGHT':
                marginX_position = 960
                marginY_position = 0
                image_width      = 960
                image_height     = 540
            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='4' and API_RESULT['media_position'] =='BOTTOM-LEFT':
                marginX_position = 0
                marginY_position = 540
                image_width      = 960
                image_height     = 540

            if API_RESULT['width']=='1920' and API_RESULT['height']=='1080' and API_RESULT['screen']=='4' and API_RESULT['media_position'] =='BOTTOM-RIGHT':
                marginX_position = 960
                marginY_position = 540
                image_width      = 960
                image_height     = 540

            #BIBBOARD 1280x720
            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='1' and API_RESULT['media_position'] =='FULL':
                marginX_position = 0
                marginY_position = 0
                image_width      = API_RESULT['width']
                image_height     = API_RESULT['height']

            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='2' and API_RESULT['media_position'] =='LEFT':
                marginX_position = 0
                marginY_position = 0
                image_width      = 1280
                image_height     = 360

            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='2' and API_RESULT['media_position'] =='RIGHT':
                marginX_position = 0
                marginY_position = 360
                image_width      = 1280
                image_height     = 360

            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='3' and API_RESULT['media_position'] =='TOP-LEFT':
                marginX_position = 0
                marginY_position = 0
                image_width      = 640
                image_height     = 360

            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='3' and API_RESULT['media_position'] =='TOP-RIGHT':
                marginX_position = 640
                marginY_position = 0
                image_width      = 640
                image_height     = 360

            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='3' and API_RESULT['media_position'] =='BOTTOM':
                marginX_position = 0
                marginY_position = 360
                image_width      = 1280
                image_height     = 360
            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='4' and API_RESULT['media_position'] =='LEFT':
                marginX_position = 0
                marginY_position = 0
                image_width      = 640
                image_height     = 360

            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='4' and API_RESULT['media_position'] =='RIGHT':
                marginX_position = 640
                marginY_position = 0
                image_width      = 640
                image_height     = 360
            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='4' and API_RESULT['media_position'] =='BOTTOM-LEFT':
                marginX_position = 0
                marginY_position = 360
                image_width      = 640
                image_height     = 360

            if API_RESULT['width']=='1280' and API_RESULT['height']=='720' and API_RESULT['screen']=='4' and API_RESULT['media_position'] =='BOTTOM-RIGHT':
                marginX_position = 640
                marginY_position = 360
                image_width      = 640
                image_height     = 360
                
            #if marginX_position > 0 and marginY_position > 0 and image_height > 0 and image_width > 0 :
            print("{},{},{},{}".format(marginX_position,marginY_position,image_height,image_width))
            names        = ['Bingo','Alpha','Ceramic','Tudor','Beta','Numba','Ponzi']
            output = subprocess.run(['/bin/bash',"./editor.sh",_filename,str(image_width),str(image_height)], stdout=PIPE, stderr=PIPE, universal_newlines=True)
            for out in output.stdout.split(':'):
                DESIGN_MEDIA_URL            =  ADVERT_URL + os.path.basename(os.path.dirname(out)) + '/' + Path(out).name
                DESIGN_MEDIA_PATH_URL       =  os.path.basename(os.path.dirname(out)) + '/' + Path(out).name
                DESIGN_MEDIA_ANIMATIONS.append(DESIGN_MEDIA_URL)
                DESIGN_MEDIA_PATH_ANIMATIONS.append(DESIGN_MEDIA_PATH_URL)
                DESIGN_MEDIA_POSTER_ANIMATIONS.append(Path(VIDEO_POSTER).name)
            
            names                          = names[ : -1]
            DESIGN_MEDIA_ANIMATIONS        = DESIGN_MEDIA_ANIMATIONS[ : -1]
            DESIGN_MEDIA_PATH_ANIMATIONS   = DESIGN_MEDIA_PATH_ANIMATIONS[ : -1]
            DESIGN_MEDIA_POSTER_ANIMATIONS = DESIGN_MEDIA_POSTER_ANIMATIONS[ : -1]
            
            msg ="PHOTO ANIMATED SUCESSFULLY " 
            RESULT = {"msg" : msg,"status":"200","videos":DESIGN_MEDIA_ANIMATIONS,"names":names ,"p":DESIGN_MEDIA_POSTER_ANIMATIONS,"v":DESIGN_MEDIA_PATH_ANIMATIONS,"xpos":marginX_position,"ypos":marginY_position,"h":image_height,"w":image_width,"mpos":API_RESULT['media_position']}

    return jsonify(RESULT)

@app.route('/api/campaign/save/animate' , methods=['POST'])
def CAMPAIGN_SAVE_ANIMATE(bid=None, uid=None):
    if request.method == 'POST':
        RESULT ={}
        Query_List = []
        API_RESULT = request.get_json()
        try:
            conn = get_db_connection()
            cur = conn.cursor() 
            cur.execute('SELECT * FROM campaigns  WHERE campaign_id = %s AND campaign_owner_id = %s',(API_RESULT['campaign_id'],API_RESULT['uid']))
            conn.commit()
            campaign_records = cur.fetchone()
            MEDIA_CONTENT = ADVERT_URL + API_RESULT['media_content']
            MEDIA_POSTER  = ADVERT_URL + API_RESULT['media_poster']
            if(campaign_records[0]==API_RESULT['campaign_id']):
                conn = get_db_connection()
                cur = conn.cursor()  
                cur.execute('UPDATE campaigns SET campaign_media_position = %s, campaign_media_content = %s ,campaign_media_type = %s ,campaign_poster = %s ,campaign_media_xpos = %s ,campaign_media_ypos = %s ,campaign_media_width = %s ,campaign_media_height = %s ,campaign_media_length = %s , campaign_media_preview = %s WHERE campaign_id = %s AND campaign_owner_id = %s',
                (API_RESULT['media_position'],MEDIA_CONTENT,'image',MEDIA_POSTER, API_RESULT['media_xpos'], API_RESULT['media_ypos'], API_RESULT['media_width'], API_RESULT['media_height'], '15', MEDIA_POSTER, API_RESULT['campaign_id'],API_RESULT['uid']))
                conn.commit()
                
                msg ="CAMPAIGN FILE SAVED SUCESSFULLY " 
                RESULT = {"msg" : msg,"status":"200","sessionId":API_RESULT['uid']}
        except (Exception, Error) as error:
    
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}

        finally:
            if (conn):
                cur.close()
                conn.close()
        
    return jsonify(RESULT)

@app.route('/api/campaign/update/animate' , methods=['POST'])
def CAMPAIGN_UPDATE_ANIMATE(bid=None, uid=None):
    if request.method == 'POST':
        RESULT ={}
        Query_List = []
        API_RESULT = request.get_json()
        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=DictCursor)
     
            cur.execute('UPDATE campaigns SET campaign_media_design = %s WHERE campaign_id = %s AND campaign_owner_id = %s',
            (Json(API_RESULT['design'][0]), API_RESULT['campaign_id'],API_RESULT['uid']))
            conn.commit()
            msg ="RECORD SAVED SUCESSFULLY " 
            RESULT = {"msg" : msg,"status":"200"}
        except (Exception, Error) as error:
    
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}

        finally:
            if (conn):
                cur.close()
                conn.close()
    return jsonify(RESULT)

@app.route('/api/campaign/design/select' , methods=['POST'])
def CAMPAIGN_DESIGN_SELECT(bid=None, uid=None):
    if request.method == 'POST':
        PRV          = ''
        RESULT       = {}
        API_RESULT   = request.get_json()
        BUTTONS      = []
        try:
            conn = get_db_connection()
            cur = conn.cursor() 
            cur.execute('SELECT campaign_id , campaign_media_design , campaign_media_controls , campaign_media_preview , campaign_media_type FROM campaigns  WHERE campaign_id = %s AND campaign_owner_id = %s',(API_RESULT['campaign_id'],API_RESULT['uid']))
            conn.commit()
            campaign_records = cur.fetchone()
            
            if(campaign_records[2]==None):
                RESULT = {"msg" : "SELECT A BILLBOARD FIRST ","status":"201","button":BUTTONS}
            
            if(campaign_records[2]!=None):
                if(campaign_records[0]==API_RESULT['campaign_id']):
                    BUTTONS      = [campaign_records[2]]
                    if campaign_records[4] == 'image':
                        PRV          = ADVERT_URL + campaign_records[3][51:]
                    if campaign_records[4] == 'video':
                        PRV          = ADVERT_URL + campaign_records[3][39:]
                    RESULT       = {"msg" : "RECORD SAVED SUCESSFULLY","status":"200","design":campaign_records[1],"button":campaign_records[2],"preview":PRV,"type":campaign_records[4]}
                  
        except (Exception, Error) as error:
    
            msg ="MEDIA NOT UPLOADED YET " + str(error)
            RESULT = {"msg" : msg,"status":"202","button":BUTTONS}

        finally:
            if (conn):
                cur.close()
                conn.close()

    return jsonify(RESULT)

@app.route('/api/campaign/schedule/select' , methods=['POST'])
def CAMPAIGN_SCHDEULE_SELECT(bid=None, uid=None):
    if request.method == 'POST':
        RESULT           = {}
        schedule_records = []
        API_RESULT       = request.get_json()
        try:
            conn = get_db_connection()
            cur = conn.cursor() 
            cur.execute('SELECT campaign_id , schedule FROM campaigns  WHERE campaign_id = %s AND campaign_owner_id = %s',(API_RESULT['campaign_id'],API_RESULT['uid']))
            conn.commit()
            campaign_records = cur.fetchone()
            if(campaign_records[0]==API_RESULT['campaign_id']):
                schedule_records = [campaign_records[1]]
                RESULT           = {"msg" : "RECORD SAVED SUCESSFULLY","status":"200","schedule":schedule_records}
                
        except (Exception, Error) as error:
    
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}

        finally:
            if (conn):
                cur.close()
                conn.close()

    return jsonify(RESULT)

@app.route('/api/campaign/budget/select' , methods=['POST'])
def CAMPAIGN_BUDGET_SELECT(bid=None, uid=None):
    if request.method == 'POST':
        RESULT           = {}
        schedule_records = []
        API_RESULT       = request.get_json()
        try:
            conn = get_db_connection()
            cur = conn.cursor() 
            cur.execute('SELECT campaign_id , daily_budget , campaign_start_date , campaign_end_date FROM campaigns  WHERE campaign_id = %s AND campaign_owner_id = %s',(API_RESULT['campaign_id'],API_RESULT['uid']))
            conn.commit()
            campaign_records = cur.fetchone()
            print(campaign_records)
            if(campaign_records[0]==API_RESULT['campaign_id']):
                BUDGET_RECORDS   = [{"daily_budget":campaign_records[1] , "start_date":campaign_records[2] , "end_date":campaign_records[3]}]
                RESULT           = {"msg" : "RECORD SAVED SUCESSFULLY", "status":"200" , "budget":BUDGET_RECORDS}
                
        except (Exception, Error) as error:
    
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}

        finally:
            if (conn):
                cur.close()
                conn.close()

    return jsonify(RESULT)

#ADVERT
@app.route('/api/agency/campaign/query' , methods=['POST'])
def QUERY_AGENCY_CAMPAIGN():
    if request.method == 'POST':
        RESULT            = {}
        DISPLAY           = []
        advert_records    = []
        design_records    = []
        budget_records    = []
        schedule_records  = []
        billboard_records = []
        API_RESULT        = request.get_json()
        try:
            data              = requests.get('http://localhost:9200/idxcpdb/_search?&q='+str(API_RESULT['query']))
            response          = data.json()
            campaign_records  = []
            elastic_docs = response["hits"]["hits"]
            for num, doc in enumerate(elastic_docs):
                try:
                    source_data = doc["_source"]
                    source_data.pop("_meta", None)
                    if source_data["campaign_agency_id"] == API_RESULT['id'] and source_data["campaign_status"] == API_RESULT['status']:
                        campaign_records.append(source_data)
                except TypeError:
                    print('TypeError')
            campaign_records = [i for n, i in enumerate(campaign_records) if i not in campaign_records[n + 1:]]
            print(campaign_records)
            for campaign_record in campaign_records:
                data = requests.get('http://localhost:9200/idxbdb/_search?q='+campaign_record['business_id'])
                response = data.json()
                elastic_docs = response["hits"]["hits"]
                for num, doc in enumerate(elastic_docs):
                    try:
                        source_data = doc["_source"]
                        source_data.pop("_meta", None)
                        source_data["billboard_image"] = BILLBOARD_URL + os.path.basename(source_data['billboard_image'])
                        billboard_records.append(source_data)
                    except TypeError:
                        print('TypeError')
                DESIGN_POSTER_URL       = " "
                DESIGN_MEDIA_URL        = " "
                if campaign_record['campaign_media_type'] == 'video':
                    DESIGN_MEDIA_URL    = ADVERT_URL + campaign_record['campaign_media_content'][51:]
                    DESIGN_POSTER_URL   = ADVERT_URL + campaign_record['campaign_poster']
                if campaign_record['campaign_media_type'] == 'image':
                    DESIGN_MEDIA_URL    = ADVERT_URL + campaign_record['campaign_media_content'][51:]
                    DESIGN_POSTER_URL   = ADVERT_URL + Path(campaign_record['campaign_poster']).name
                DESIGN_ADVERT_CATEGORY  = campaign_record['campaign_category']
                DESIGN_ADVERT_NAME      = campaign_record['campaign_name']
                advert_records.append({"name":campaign_record['campaign_name'], "status":campaign_record['campaign_status'], "category":campaign_record['campaign_category'] , "magnate":campaign_record['campaign_billboard_owner'],"source_file":DESIGN_MEDIA_URL, "channel":campaign_record['campaign_media_position'], "poster" : DESIGN_POSTER_URL,"name":DESIGN_ADVERT_NAME, "id":campaign_record['campaign_id'], "campaign_owner_id":API_RESULT['uid']})
                design_records.append({"source_file":DESIGN_MEDIA_URL, "channel":campaign_record['campaign_media_position'], "poster" : DESIGN_POSTER_URL})
                budget_records.append({"daily_budget":campaign_record['daily_budget'], "start_date":campaign_record['campaign_start_date'], "end_date":campaign_record['campaign_end_date']})

            RESULT = {"msg" : "SUCCESS" ,"status":"200","location":billboard_records,"budget":budget_records,"schedule":schedule_records,"design":design_records,"campaign":advert_records}
        except (Exception, Error) as error:
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}
        finally:
            print('--------------')
    return jsonify(RESULT)

@app.route('/api/campaign/agents' , methods=['POST'])
def CAMPAIGN_AGENTS(bid=None, uid=None):
    if request.method == 'POST':
        RESULT     = {}
        DISPLAY    = []
        advert_records    = []
        design_records    = []
        budget_records    = []
        schedule_records  = []
        billboard_records = []
        API_RESULT = request.get_json()
        try:
            conn = get_db_connection()
            cur = conn.cursor()  
            cur.execute('SELECT * FROM campaigns  WHERE  campaign_agency_id = %s AND campaign_status = %s',(API_RESULT['agid'],API_RESULT['status']))
            conn.commit()
            campaign_records = cur.fetchall()
            for campaign_record in campaign_records:
                data = requests.get('http://localhost:9200/idxbdb/_search?q='+campaign_record[2])
                response = data.json()
                elastic_docs = response["hits"]["hits"]
                for num, doc in enumerate(elastic_docs):
                    try:
                        source_data = doc["_source"]
                        source_data.pop("_meta", None)
                        #source_data.pop("billboard_ip_address", None)
                        source_data["billboard_image"] = BILLBOARD_URL + os.path.basename(source_data['billboard_image'])
                        billboard_records.append(source_data)
                    except TypeError:
                        print('TypeError')
                DESIGN_POSTER_URL       = " "
                DESIGN_MEDIA_URL        = " "
                if campaign_record[9] == 'video':
                    DESIGN_MEDIA_URL    = campaign_record[10]
                    DESIGN_POSTER_URL   = ADVERT_URL + campaign_record[14][51:]
                if campaign_record[9] == 'image':
                    DESIGN_MEDIA_URL    = campaign_record[10]
                    DESIGN_POSTER_URL   = ADVERT_URL + Path(campaign_record[14]).name
                DESIGN_ADVERT_CATEGORY  = campaign_record[12]
                DESIGN_ADVERT_NAME      = campaign_record[8]
                print(campaign_record[14])
                schedule_records.append(campaign_record[6][0])
                advert_records.append({"name":campaign_record[8], "status":campaign_record[7], "category":campaign_record[12] , "magnate":campaign_record[20],"source_file":DESIGN_MEDIA_URL, "channel":campaign_record[13], "poster" : DESIGN_POSTER_URL,"name":DESIGN_ADVERT_NAME,"id":campaign_record[0], "campaign_owner_id":API_RESULT['uid']})
                design_records.append({"source_file":DESIGN_MEDIA_URL, "channel":campaign_record[13], "poster" : DESIGN_POSTER_URL})
                budget_records.append({"daily_budget":campaign_record[3], "start_date":campaign_record[4], "end_date":campaign_record[5]})

            RESULT = {"msg" : "SUCCESS" ,"status":"200","location":billboard_records,"budget":budget_records,"schedule":schedule_records,"design":design_records,"campaign":advert_records}
            print(RESULT)
        except (Exception, Error) as error:
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}
        finally:
            if (conn):
                cur.close()
                conn.close()
    
    return jsonify(RESULT)

@app.route('/api/advert/create' , methods=['POST'])
def CREATE_ADVERT():
    if request.method == 'POST':
        RESULT       = {}
        METRICS      = []
        DATE_TIME    = []
        EDGES        = []
        NODES        = []
        GRAPH        = {}
        PARAMS       = []
        API_RESULT = request.get_json()
  
        try:
            conn = get_db_connection()
            cur  = conn.cursor()  
            #cur.execute('SELECT * FROM campaigns  WHERE campaign_id = %s AND campaign_owner_id = %s',(API_RESULT['campaign_id'],API_RESULT['uid']))
            cur.execute('SELECT * FROM campaigns  WHERE campaign_id = %s',(API_RESULT['campaign_id'],))
            conn.commit()
            campaign_records = cur.fetchone()

            if(campaign_records[0]==API_RESULT['campaign_id']):
                if API_RESULT['status'] == "REJECTED":
                    cur.execute('UPDATE campaigns SET campaign_status = %s  WHERE campaign_id = %s AND campaign_owner_id = %s',(API_RESULT['status'],API_RESULT['campaign_id'],campaign_records[11]))
                    conn.commit()
                    RESULT = {"msg" : "CAMPAIGN REJECTED","status":"200"}
            
                if API_RESULT['status'] == "APPROAVED":
                    cur.execute('SELECT billboard_ip_address , billboard_id FROM billboard WHERE billboard_id = %s',(campaign_records[2],))
                    conn.commit()
                    billboard_records = cur.fetchone()
                    ## campaign_records[26] ----- ADVERT MEDIA WITH BARCODE --->
                    ## campaign_records[10] ----- ADVERT MEDIA WITOUT WITH BARCODE --->
                    PARAMS = [billboard_records[0],campaign_records[9],campaign_records[10],campaign_records[13],campaign_records[19],campaign_records[12],campaign_records[16],campaign_records[15],campaign_records[3],campaign_records[9],campaign_records[13],campaign_records[17],campaign_records[18]]

                    for key, value in campaign_records[6][0].items():
                        campaign_start_date      = datetime.strptime(campaign_records[4], '%Y-%m-%d') 
                        campaign_end_date        = datetime.strptime(campaign_records[5], '%Y-%m-%d')
                        dates = [campaign_start_date + timedelta(days=x) for x in range((campaign_end_date -campaign_start_date).days + 1) if (campaign_start_date + timedelta(days=x)).weekday() == time.strptime(calendar.day_name[int(key)-1], '%A').tm_wday]
                        DATE_TIME.append((dates,value))
                    
                    #EDGE CAPACITY   = ( TIME_SPAN/ (SCREEN_COUNT + SKIP_TIME))*SCREEN_COUNT)
                    #NODE CAPACITY   = ((TIME_SPAN/ (SCREEN_COUNT + SKIP_TIME))*SCREEN_COUNT)/VIDEO_LENGTH
                    #((3600/(3+2))*3)/30
                    # PRICE_PER_SLOT = VIDEO_LENGTH * BLIP (15*10)
                    # NUMBER OF SLOTS PER DAY = DAILY_BUDGET / PRICE_PER_SLOT

                    #1.0 METRICS
                    SCORE_ID = ""
                    PRICE_PER_SLOT  = float(campaign_records[19]) * float(7.5)
                    SLOTS_PER_DAY   = float(campaign_records[ 3]) / PRICE_PER_SLOT
                    AVAILABLE_SLOTS = round(3600 - ((int(datetime.now().strftime("%M:%S")[:-3])*60)+int(datetime.now().strftime("%M:%S")[3:])))
                    #2.0 METRICS
                    for _DATE , _TIME in DATE_TIME:
                        for _date in _DATE:
                            for _time in _TIME:
                                NODE                     =  []
                                DOW                      =  calendar.day_name[datetime.strptime(_date.strftime("%Y-%m-%d"), '%Y-%m-%d').weekday()]
                                YEAR                     =  datetime.strptime(_date.strftime("%Y-%m-%d"), '%Y-%m-%d').year
                                MONTH                    =  datetime.strptime(_date.strftime("%Y-%m-%d"), '%Y-%m-%d').month
                                DATE                     =  _date.strftime("%Y-%m-%d")
                                PERIOD                   =  datetime.strptime(str(_time), "%H").strftime("%I:%M %p")[-2:] 
                                TIME                     =  datetime.strptime(str(_time), "%H").strftime("%I:%M %p")[:-2]
                                ADVERT_SIZE              =  campaign_records[19]
                                ADVERT_COST              =  campaign_records[ 3]
                                ADVERT_FREQUENCY         =  math.floor(SLOTS_PER_DAY)
                                EXPECTED_TIME            =  _date.strftime("%Y-%m-%d") + " " + datetime.strptime(str(_time), "%H").strftime("%I:%M %p")
                                EXPECTED_TIMESTAMP       =  round(datetime.timestamp(datetime.strptime(EXPECTED_TIME , "%Y-%m-%d %I:%M %p")))
                                PREDICTED_DATETIME       =  datetime.fromtimestamp(EXPECTED_TIMESTAMP) + timedelta(seconds=3)
                                PREDICTED_TIMESTAMP      =  round(datetime.timestamp(PREDICTED_DATETIME))
                                ADVERT_AGENCY_ID         =  campaign_records[21]
                                ADVERT_CUSTOMER_ID       =  campaign_records[11]
                                ADVERT_CAMPAIGN_ID       =  campaign_records[ 0]
                                ADVERT_EXPECTED_TIME     =  EXPECTED_TIMESTAMP
                                ADVERT_STOP_TIME         =  round(datetime.timestamp(datetime.fromtimestamp(EXPECTED_TIMESTAMP) + timedelta(seconds=5)))
                                ADVERT_PREDICTED_TIME    =  round(datetime.timestamp(datetime.fromtimestamp(EXPECTED_TIMESTAMP) + timedelta(seconds=10)))
                                ADVERT_ID                =  re.sub('(?<=\d)[,.](?=\d)','',"%.10f" % time.time())
                                EDGE_ENDPONT             =  billboard_records[0]
                                EDGE_ID                  =  billboard_records[1]
                                EDGE_ADVERT_CHANNEL_POS  =  campaign_records[13]
                                ADVERT_SLOT_COUNT        =  campaign_records[19]
                                EDGES                    += [ADVERT_ID]
                                NODE                     += [EXPECTED_TIMESTAMP,EDGE_ADVERT_CHANNEL_POS,EDGE_ID,ADVERT_SIZE]
                                SCORES                   =  str(EDGE_ID).encode('ascii')+str(EXPECTED_TIMESTAMP).encode('ascii')+str(EDGE_ADVERT_CHANNEL_POS).encode('ascii')
                                SCORE_ID                 =  hashlib.sha256(SCORES).hexdigest()
                                NODES                    += [NODE]
                                SCORES                   =  str(MONTH).encode('ascii')+str(DATE).encode('ascii')+str(YEAR).encode('ascii')+str(DOW).encode('ascii')+str(TIME).encode('ascii')+str(PERIOD).encode('ascii')+str(EDGE_ID).encode('ascii')+str(EXPECTED_TIMESTAMP).encode('ascii')+str(EDGE_ADVERT_CHANNEL_POS).encode('ascii')
                                SCORE_ID                 =  hashlib.sha256(SCORES).hexdigest()
                                METRICS                  += [[MONTH , DATE , YEAR , DOW , TIME , PERIOD , ADVERT_AGENCY_ID , ADVERT_CUSTOMER_ID , ADVERT_CAMPAIGN_ID , ADVERT_EXPECTED_TIME , ADVERT_ID , ADVERT_SIZE , ADVERT_COST , EDGE_ID ,EDGE_ENDPONT , EDGE_ADVERT_CHANNEL_POS, ADVERT_FREQUENCY, ADVERT_SLOT_COUNT,SCORE_ID]]
                    
                    print('EDGE = {} AND NODE = {} AND METRICS = {} SLOTS ={} SORES ={}'.format(len(EDGES) , len(NODES) , len(METRICS) ,AVAILABLE_SLOTS,SCORE_ID))
                    
                    #3.0 INSERTION
                    try:
                        cur.executemany('INSERT INTO advert (advert_month , advert_date , advert_year , advert_dow , advert_time , advert_period , advert_agency_id ,  advert_customer_id , advert_campaign_id , advert_expected_time , advert_id , advert_size , advert_cost , advert_edge_id , advert_edge_endpoint, advert_edge_pos, advert_frequency, advert_slot_count, advert_score_id) VALUES(%s , %s , %s , %s , %s , %s , %s, %s, %s , %s , %s , %s , %s , %s, %s, %s, %s, %s, %s)',METRICS)
                        conn.commit() 
                    except (Exception, Error) as error:
                        msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
                        print(msg)
                    finally:
                        if (conn):
                            print(('??',EXPECTED_TIMESTAMP,PREDICTED_TIMESTAMP,len(_TIME)))
                            #cur.close()
                            #conn.close()
                    
                    sleep(0.05*len(NODES))
                    #4.0 NETWORK
                    
                    print('??  EDGE = {} AND NODE = {}'.format(len(EDGES) , len(NODES)))
                    try:
                        queueLock.acquire()
                        GRAPH   = {"k":EDGES,"v":NODES,"p":METRICS,"n":PARAMS}
                        #r.publish('hello', json.dumps(GRAPH))
                        q.put(GRAPH)
                        GRAPH   = {}
                        METRICS = []
                        queueLock.release()
                        # Wait for the queue to empty
                        while not q.empty():
                            pass
                        
                        # Notify threads it's time to exit
                        thread_exit_Flag = 1
                    except Exception as inst:
                        print(inst)
                    
                    RESULT = {"msg" : "CAMPAIGN VERIFIED","status":"200"}
                    
                    #EDGE
                    #cur.execute('UPDATE campaigns SET campaign_status = %s  WHERE campaign_id = %s AND campaign_owner_id = %s',
                    #(API_RESULT['status'],API_RESULT['campaign_id'],campaign_records[11]))
                    #conn.commit()
                    
        except (Exception, Error) as error:
            print(error)
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201"}
        finally:
            if (conn):
                cur.close()
                conn.close()
    return jsonify(RESULT)
    
#AGENCY
@app.route('/api/agency/create' , methods=['POST'])
def CREATE_AGENCY(bid=None, uid=None):
    if request.method == 'POST':
        RESULT       = {}
        Query_List   = []
        API_RESULT   = request.get_json()
        print(API_RESULT)
        sentence     = "%.20f" % time.time()
        agency_id    = re.sub('(?<=\d)[,.](?=\d)','',sentence)
        try:
            conn = get_db_connection()
            cur = conn.cursor()  
            cur.execute('INSERT INTO agency (agency_id, agency_email, agency_adddress , agency_status, agency_name, agency_telephone1, agency_telephone2, agency_city, agency_location, agency_country)'
                        'VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)',
                        (agency_id , API_RESULT['agency_mail'], API_RESULT['agency_address'] , API_RESULT['agency_status'] ,API_RESULT['agency_name'].title(),API_RESULT['agency_telephone_1'],API_RESULT['agency_telephone_2'],API_RESULT['agency_city'],API_RESULT['agency_location'],API_RESULT['agency_country']))
            conn.commit()

            msg = "AGENCY " + API_RESULT['agency_name'] +" CREATED SUCESSFULLY ."
            RESULT = {"msg" : msg,"status":"200","uri":BILLBOARD_URL,"id":agency_id}

        except (Exception, Error) as error:
            
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201","sessionId":agency_id}
        finally:
            if (conn):
                cur.close()
                conn.close()
        return jsonify(RESULT)

@app.route('/api/agency/query' , methods=['POST'])
def QUERY_AGENCY(bid=None, uid=None):
    if request.method == 'POST':

        ID      = []
        NAME    = []
        RESULT  = {}

        try:
            conn = get_db_connection()
            cur = conn.cursor()  
            cur.execute(' SELECT agency_id , agency_name  FROM agency ')
            conn.commit()
            agency_records = cur.fetchall()
            for agency_record in agency_records:
                ID.append(agency_record[0])
                NAME.append(agency_record[1])

            RESULT = {"msg" : "","status":"200","name":NAME,"id":ID}

        except (Exception, Error) as error:
            
            msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
            RESULT = {"msg" : msg,"status":"201","sessionId":ID}
        finally:
            if (conn):
                cur.close()
                conn.close()

        return jsonify(RESULT)

@app.route('/api/billboard/agent/select' , methods=['POST'])
def AGENCY_SELECT_BILLBOARD():
    if request.method == 'POST':
        RESULT ={}
        Query_List = []
        API_RESULT = request.get_json()
        data = requests.get('http://localhost:9200/idxbdb/_search?q='+API_RESULT['query'])
        response = data.json()
        Query_List = []
        elastic_docs = response["hits"]["hits"]
        for num, doc in enumerate(elastic_docs):
            try:
                source_data = doc["_source"]
                source_data.pop("_meta", None)
                #source_data.pop("billboard_ip_address", None)
                source_data["billboard_image"] = BILLBOARD_URL + os.path.basename(source_data['billboard_image'])
                Query_List.append(source_data)
            except TypeError:
                print('TypeError')
        Query_Result = [i for n, i in enumerate(Query_List) if i not in Query_List[n + 1:]]
        RESULT = {"msg":Query_Result ,"status":"200"}
    return jsonify(RESULT)

@app.route('/api/campaign/advert/plot' , methods=['POST'])
def CAMPAIGN_ADVERT_PLOT():
    if request.method == 'POST':
        RESULT     = {}
        Query_List = []
        API_RESULT = request.get_json()
        '''
        API_RESULT = request.get_json()
        str(API_RESULT['id'])
        '''
        query = json.dumps({
            "from" : 0, "size" : 1000,

            "_source": {        
                "include": ["advert_predicted_time","advert_termination_time","advert_size","advert_frequency","advert_slot_count","advert_cost"]
            },
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "advert_campaign_id":str(API_RESULT['id'])
                            }
                        }

                    ]
                } 
            }
        })

        DATA     = {}
        header   = {'Content-Type': 'application/json'}
        uri      = 'http://localhost:9200/idxadb/_search?pretty=true'
        results  = requests.get(uri, data=query , headers=header)
        response = json.loads(results.text)
        elastic_docs = response["hits"]["hits"]
        for num, doc in enumerate(elastic_docs):
            try:
                source_data = doc["_source"]
                source_data.pop("_meta", None)
                advert_spending = float(source_data["advert_slot_count"])*7.5
                advert_balance  = float(source_data["advert_cost"])- advert_spending
                Query_List.append({ 'st' :source_data['advert_predicted_time'], 'ed': source_data['advert_termination_time'],'vl':source_data['advert_size'],'vf':source_data['advert_frequency'],'al':source_data['advert_slot_count'],'ac':source_data['advert_cost'],'ab':advert_balance,'as':advert_spending})
                #Query_List.append({ 'x' :source_data['advert_predicted_time'], 'y': source_data['advert_termination_time']})
                '''
                ET   =  datetime.fromtimestamp(round(datetime.timestamp(datetime.fromtimestamp(int(source_data['advert_expected_time']))))).strftime('%Y-%m-%d %H:%M:%S')
                PTS  =  round(datetime.timestamp(datetime.strptime(source_data['advert_predicted_time'] , "%Y-%m-%d %H:%M:%S")))
                ETS  =  source_data['advert_expected_time']
                EPTS =  int(PTS) - int(ETS)
                Query_List.append({ 'ST' :[{'x':ET,'y':EPTS}], 'ET':[{'x':source_data['advert_predicted_time'],'y':source_data['advert_slot_count']}]})
                '''
            except TypeError:
                print('TypeError')

        print(Query_List)  
        msg ="ERROR OCURRED .. CONTACT ADMIN "
        RESULT = {"msg" : msg,"status":"200" , "cord" : Query_List}

    return jsonify(RESULT)
    
#submit/withdraw and advert
@app.route('/api/schedular/ads/submit' , methods=['POST'])
def SCHEDULAR():
    status={}
    if request.method == 'POST':
        #validate billboard status
        request_data=request.get_json()
        print(request_data)
        if request_data.get('status') == True:
            start_metrics ="{}".format(request_data.get('query'))
            print(start_metrics)
            status = {'result':'ad scheduled sucessfull'}
            subprocess.run(["./SCHEDULAR",start_metrics])
        if request_data.get('status') == False:
            start_metrics ="{}".format(request_data.get('query'))
            status = {'result':'advert stopped . A reschedule is needed for further advertising'}
            subprocess.run(["./UNSCHEDULAR",start_metrics])
    return status

def COMPUTE_TIME(Q):
    """Simple Elasticsearch Query"""
    query = json.dumps({
        "from" : 0, "size" : 1000,
        "aggs": {
            "categories": {
            "sum": {
                "field": "advert_slot_count"
            }
            }
        },
        "_source": {        
            "include": ["advert_slot_count"]
        },
        "query": {
            "bool": {
                "must": [
                    {
                        "match_phrase": {
                            "advert_score_id":str(Q[0])
                        }
                    }
                ]
            } 
        }
    })

    DATA     = {}
    header   = {'Content-Type': 'application/json'}
    uri      = 'http://localhost:9200/idxadb/_search?pretty=true'
    results  = requests.get(uri, data=query , headers=header)
    response = json.loads(results.text)
    ptime    = int(response["aggregations"]["categories"]["value"])
    return ptime 

def PUB_TASK(i, q , v):
    while not thread_exit_Flag:
        queueLock.acquire()
        try:
            if not q.empty():
                query        = q.get()
                
                TIME_SERIES  =  []

                for k in query.values():
                    TIME_SERIES += [k]
                
                for i in range(len(TIME_SERIES[0])):
                    SEARCH_TERMS   = []
                    SEARCH_TERMS   = [TIME_SERIES[2][i][18]]
                    response       = COMPUTE_TIME(SEARCH_TERMS)
                    #print(response)

                    Q = {"id":TIME_SERIES[0][i],"SKT":response,"ADVERT":TIME_SERIES[2][i],'EXT':TIME_SERIES[1][i][0],'PYT':TIME_SERIES[1][i][3],"EDGE":TIME_SERIES[3]}
                    
                    TIME_LIST                = []
                    SCHEDULE_LIST            = []
                    CURRENT_SYSTEM_TIME      = datetime.fromtimestamp(datetime.timestamp(datetime.now())).strftime('%Y-%m-%d %I:%M:%S %p')
                    CURRENT_SYSTEM_TIME_TS   = round(datetime.timestamp(datetime.strptime(CURRENT_SYSTEM_TIME , "%Y-%m-%d %I:%M:%S %p")))
                    ADVERT_START_TIME_TS     = round(datetime.timestamp(datetime.fromtimestamp(Q['EXT'])))
                    '''
                    MAX_START_TIME = ADVERT_START_TIME_TS + 3600

                    if MAX_START_TIME < CURRENT_SYSTEM_TIME_TS:
                        pass
                        print('STALE DATE')
                    if MAX_START_TIME >= CURRENT_SYSTEM_TIME_TS:
                        #TIME BLOCKING
                        START_DATE_TS = round(datetime.timestamp(datetime.fromtimestamp(Q['EXT'])))
                        END_DATE_TS   = START_DATE_TS + 3600
                        ADVERT_SYSTEM_TIME   = ADVERT_START_TIME_TS+ int(Q['SKT'])
                        if START_DATE_TS <= ADVERT_SYSTEM_TIME <= END_DATE_TS:
                            if ADVERT_SYSTEM_TIME < END_DATE_TS:
                                #print('ADVERT_SYSTEM_TIME < END_DATE_TS')
                                if START_DATE_TS < ADVERT_SYSTEM_TIME: 
                                    if ADVERT_SYSTEM_TIME < CURRENT_SYSTEM_TIME_TS:
                                        TIME_DIFF = CURRENT_SYSTEM_TIME_TS - ADVERT_SYSTEM_TIME 
                                        #ADVERT_START_TIME_TS  = ADVERT_START_TIME_TS + (CURRENT_SYSTEM_TIME_TS - ADVERT_START_TIME_TS)+ int(Q['SKT'])
                                        ADVERT_START_TIME_TS   = ADVERT_START_TIME_TS + (CURRENT_SYSTEM_TIME_TS - ADVERT_START_TIME_TS)+ int(Q['SKT'])
                                        ADVERT_START_TIME_NTS  = datetime.fromtimestamp(ADVERT_START_TIME_TS).strftime('%Y-%m-%d %I:%M:%S %p')
                                        print(('CURRENT_SYSTEM_TIME_TS > ADVERT_START_TIME_TS',TIME_DIFF))
                                    if ADVERT_SYSTEM_TIME > CURRENT_SYSTEM_TIME_TS:
                                        TIME_DIFF = ADVERT_SYSTEM_TIME - CURRENT_SYSTEM_TIME_TS  
                                        ADVERT_START_TIME_TS   = ADVERT_SYSTEM_TIME
                                        ADVERT_START_TIME_NTS  = datetime.fromtimestamp(ADVERT_START_TIME_TS+1).strftime('%Y-%m-%d %I:%M:%S %p')
                                        print(('ADVERT_START_TIME_TS > CURRENT_SYSTEM_TIME_TS',TIME_DIFF))   

                                if START_DATE_TS == ADVERT_SYSTEM_TIME: 
                                    if ADVERT_SYSTEM_TIME > CURRENT_SYSTEM_TIME_TS:
                                        ADVERT_START_TIME_TS   = CURRENT_SYSTEM_TIME_TS + 61
                                        ADVERT_START_TIME_NTS  = datetime.fromtimestamp(ADVERT_START_TIME_TS).strftime('%Y-%m-%d %I:%M:%S %p')
                                        print(('START_DATE_TS == ADVERT_SYSTEM_TIME',ADVERT_START_TIME_TS))
                                    if ADVERT_SYSTEM_TIME < CURRENT_SYSTEM_TIME_TS:
                                        TIME_DIFF = CURRENT_SYSTEM_TIME_TS - ADVERT_SYSTEM_TIME 
                                        ADVERT_START_TIME_TS  = ADVERT_START_TIME_TS + (CURRENT_SYSTEM_TIME_TS - ADVERT_START_TIME_TS)+ int(Q['SKT'])
                                        #ADVERT_START_TIME_TS   = CURRENT_SYSTEM_TIME_TS
                                        ADVERT_START_TIME_NTS  = datetime.fromtimestamp(ADVERT_START_TIME_TS).strftime('%Y-%m-%d %I:%M:%S %p')
                            
                            if ADVERT_SYSTEM_TIME == END_DATE_TS:
                                print('ADVERT_SYSTEM_TIME == END_DATE_TS')

                            if ADVERT_SYSTEM_TIME > END_DATE_TS:
                                print('ADVERT_SYSTEM_TIME > END_DATE_TS')

                    #TIME BLOCKING
                    '''
                    ###########------------VERY IMPORTANT --------------####################
                    
                    START_DATE_TS = round(datetime.timestamp(datetime.fromtimestamp(Q['EXT'])))
                    END_DATE_TS   = START_DATE_TS + 3600
                    ADVERT_SYSTEM_TIME   = ADVERT_START_TIME_TS+ int(Q['SKT'])
                    if START_DATE_TS <= ADVERT_SYSTEM_TIME <= END_DATE_TS:

                        if CURRENT_SYSTEM_TIME_TS > ADVERT_START_TIME_TS:
                            TIME_DIFF = CURRENT_SYSTEM_TIME_TS - ADVERT_SYSTEM_TIME 
                            #ADVERT_START_TIME_TS   = ADVERT_START_TIME_TS + (CURRENT_SYSTEM_TIME_TS - ADVERT_START_TIME_TS)
                            ADVERT_START_TIME_TS   = ADVERT_START_TIME_TS + (CURRENT_SYSTEM_TIME_TS - ADVERT_START_TIME_TS)+ int(Q['SKT'])
                            ADVERT_START_TIME_NTS  = datetime.fromtimestamp(ADVERT_START_TIME_TS).strftime('%Y-%m-%d %I:%M:%S %p')
                        
                        if ADVERT_START_TIME_TS > CURRENT_SYSTEM_TIME_TS :
                            ADVERT_START_TIME_TS   = ADVERT_START_TIME_TS+ int(Q['SKT'])
                            ADVERT_START_TIME_NTS  = datetime.fromtimestamp(ADVERT_START_TIME_TS).strftime('%Y-%m-%d %I:%M:%S %p')

                    if START_DATE_TS == ADVERT_SYSTEM_TIME: 
                        ADVERT_START_TIME_TS   = ADVERT_START_TIME_TS + 61
                        ADVERT_START_TIME_NTS  = datetime.fromtimestamp(ADVERT_START_TIME_TS).strftime('%Y-%m-%d %I:%M:%S %p')
                    
                    ##########-------------------> DO NOT DELETE <------------------------#
                    ADVERT_STOP_TIME_TS      = round(datetime.timestamp(datetime.fromtimestamp(ADVERT_START_TIME_TS)))
                    #ADVERT_STOP_TIME_TS      = round(datetime.timestamp(datetime.fromtimestamp(ADVERT_START_TIME_TS) + timedelta(seconds=int(Q['PYT']))))
                    ADVERT_STOP_TIME_NTS     = datetime.fromtimestamp(ADVERT_STOP_TIME_TS).strftime('%Y-%m-%d %I:%M:%S %p')
                    
                    #print((Q['EXT'],ADVERT_START_TIME_TS,ADVERT_STOP_TIME_TS,ADVERT_START_TIME_NTS,ADVERT_STOP_TIME_NTS))
                    SEC = datetime.strftime(datetime.strptime(ADVERT_START_TIME_NTS, "%Y-%m-%d %I:%M:%S %p"), "%S")
                    MIN = datetime.strftime(datetime.strptime(ADVERT_START_TIME_NTS, "%Y-%m-%d %I:%M:%S %p"), "%M")
                    HRS = datetime.strftime(datetime.strptime(ADVERT_START_TIME_NTS, "%Y-%m-%d %I:%M:%S %p"), "%H")
                    DTE = datetime.strftime(datetime.strptime(ADVERT_START_TIME_NTS, "%Y-%m-%d %I:%M:%S %p"), "%d")
                    MTH = datetime.strftime(datetime.strptime(ADVERT_START_TIME_NTS, "%Y-%m-%d %I:%M:%S %p"), "%m")
                    TIME_LIST =[SEC,MIN,HRS,DTE,MTH]
                    #print(TIME_LIST)
                    for TL in TIME_LIST:
                        if TL.startswith('0'):
                            TL = re.sub(r"0", "", TL)
                            if TL == "0":
                                TL = 1
                        if TL == "0":
                            TL = 1
                        SCHEDULE_LIST += [TL]
                    print(SCHEDULE_LIST)
                    sleep(0.01)
                    v.put({"id":str(TIME_SERIES[0][i]),"start_time":str(ADVERT_START_TIME_TS),"slot_frequency":str(TIME_SERIES[2][i][16]),"video_length":str(TIME_SERIES[2][i][11]),"end_time":str(ADVERT_STOP_TIME_TS)})
                    
                    #print(SCHEDULE_LIST)
                    if(Q['EDGE'][0] !=""):
                        
                        PAYLOAD = {}
                        SCHEDULAR_PAYLOAD = {}
                        URL = Q['EDGE'][0] + '/api/edge/ads/submit'
                        print(URL)
                        MEDI_URL = " "
                        start_time = time.time()
                        if Q['EDGE'][1] == 'video':
                            #MEDI_URL = Q['EDGE'][2] #----- MEDIA WITH BARCODE --->
                            MEDI_URL = "/var/www/html//uploads/temporary/advert/" + Q['EDGE'][2][42:]
                            PAYLOAD = {'uploaded_file': open(MEDI_URL,'rb')}
                        if Q['EDGE'][1] == 'image':
                            #MEDI_URL = Q['EDGE'][2] #----- MEDIA WITH BARCODE --->
                            MEDI_URL = "/var/www/html//uploads/temporary/advert/" + Q['EDGE'][2][42:]
                            PAYLOAD = {'uploaded_file': open( MEDI_URL ,'rb')}

                        res = requests.post(URL, files=PAYLOAD)
                        end_time = time.time()
                        if(res.ok):
                            upload_time = end_time - start_time
                            print("{},{}".format("upload_time",str(upload_time)))
                            EDGE_URL = Q['EDGE'][0].replace("http://","")
                            EDGE_URL = EDGE_URL.replace(":5007","")
                            print("{},{}".format("EDGE_URL ",EDGE_URL))
                            MEDIA_FILE=json.loads(res.text)['MEDIAFILE']
                            SCREENS = {'FULL':'1','LEFT':'1','RIGHT':'2','BOTTOM':'3','TOP-LEFT':'1','TOP-RIGHT':'2','BOTTOM-LEFT':'3','BOTTOM-RIGHT':'4'}
                            ADVERT_METRICS    = Q['ADVERT'][10]+':'+SCHEDULE_LIST[0]+':'+SCHEDULE_LIST[1]+':'+SCHEDULE_LIST[2]+':'+SCHEDULE_LIST[3]+':'+SCHEDULE_LIST[4]+':?:'+EDGE_URL+':'+Q['EDGE'][5]+':'+Q['EDGE'][6]+':'+Q['EDGE'][7]+':'+Q['EDGE'][8]+':'+str(Q['ADVERT'][16])+':'+Q['EDGE'][9]+':'+MEDIA_FILE+':'+Q['EDGE'][10]+':'+Q['EDGE'][11]+':'+Q['EDGE'][12]+':'+SCREENS[Q['EDGE'][3]]
                            SCHEDULAR_PAYLOAD = {"status":True,"query":ADVERT_METRICS}
                            print(SCHEDULAR_PAYLOAD)
                            redis_conn.publish("broadcast", json.dumps(ADVERT_METRICS))
                            sleep(0.1)
                            v.put({"id":str(TIME_SERIES[0][i]),"start_time":str(ADVERT_START_TIME_TS),"slot_frequency":str(TIME_SERIES[2][i][16]),"video_length":str(TIME_SERIES[2][i][11]),"end_time":str(ADVERT_STOP_TIME_TS)})
                    
                q.task_done()
                queueLock.release()

            else:
                queueLock.release()
                time.sleep(1)
        except Timeout as ex:
            print("Exeption Raised ", ex)

def SUB_TASK(i, v):
    while True:
        #vueueLock.acquire()
        try:
            if not v.empty():
                Q        = v.get()
                print(("sub task",Q))
                ADVERT_ID                = Q['id']
                ADVERT_SLOT_COUNT        = int(Q['slot_frequency'])*int(Q['video_length'])  
                ADVERT_PREDICTED_TIME    = datetime.fromtimestamp(round(datetime.timestamp(datetime.fromtimestamp(int(Q['start_time']))))).strftime('%Y-%m-%d %H:%M:%S')
                ADVERT_TERMINATION_TIME  = datetime.fromtimestamp(round(datetime.timestamp(datetime.fromtimestamp(int(Q['end_time'])) + timedelta(seconds=ADVERT_SLOT_COUNT)))).strftime('%Y-%m-%d %H:%M:%S')
                
                try:
                    conn = get_db_connection()
                    cur  = conn.cursor()  
                    cur.execute('UPDATE advert SET advert_predicted_time = %s , advert_termination_time = %s , advert_slot_count = %s  WHERE advert_id = %s',(ADVERT_PREDICTED_TIME,ADVERT_TERMINATION_TIME,ADVERT_SLOT_COUNT,ADVERT_ID))
                    conn.commit()

                except (Exception, Error) as error:
                    msg ="ERROR OCURRED .. CONTACT ADMIN " + str(error)
                    print(msg)   
        except Timeout as ex:
            print("Exeption Raised ", ex)

@app.route('/api/qrcode/create' , methods=['POST','GET'])
def QRCODE_SUBMIT():
    res = " "
    dList = []
    while True:
        if request.method == 'POST':
            byte_str = request.data
            dict_str = byte_str.decode("UTF-8")
            mydata = ast.literal_eval(dict_str)
            sentence     = "%.20f" % time.time()
            image_id     = re.sub('(?<=\d)[,.](?=\d)','',sentence)
            q = mydata['name']+':'+(mydata['dest'].replace("http://","")).replace("https://","")+':'+ image_id
            query = {}
            query = {'status':'true','query':str(q)}
            ad_metrics ="{}".format(query.get('query'))
            pos = ad_metrics.rpartition(':')[-1]
            #print(pos)
            j.put(ad_metrics)
            return {'result':image_id,'status':'200'}
        
        if request.method == 'GET':
            try:
                query = j.get()
                if query:
                    #print("Response From request: {}".format(query))
                    return {'result':query,'status':'200'}
                return {'result':query}
            except Exception as ex:
                print("Exeption Raised ", ex)

@app.route('/api/qrcode/video' , methods=['POST','GET'])
def QRCODE_VIDEO():
    RESULT = {}
    if request.method == 'POST':
        q = request.get_json()
        data = q['q']
        VIDEO_IMAGE_PATH        = []
        #VALIDATE IF VIDEO EXISTS
        try:
            conn = get_db_connection()
            cur = conn.cursor()  
            cur.execute('SELECT * FROM campaigns  WHERE campaign_id = %s AND campaign_owner_id = %s',(data[0][2],data[0][1]))
            conn.commit()
            campaign_records = cur.fetchone()
            if(campaign_records[0]==data[0][2]):
                if (campaign_records[2] != None):
                    video = '/var/www/html/' + campaign_records[10][17:]
                    image = '/var/www/html/encryption/build/src/' + data[0][0] + '.png'
                    output = subprocess.run(['/bin/bash',"./qcode.sh",str(video),str(image)], stdout=PIPE, stderr=PIPE, universal_newlines=True)
                    print(output)
                    for out in output.stdout.split(':'):
                        VIDEO_IMAGE_PATH.append(out)
                #UPDATE DB   
                cur.execute('UPDATE campaigns SET campaign_qr_video = %s ,campaign_qr_image = %s  WHERE campaign_id = %s AND campaign_owner_id = %s',(VIDEO_IMAGE_PATH[0],VIDEO_IMAGE_PATH[1],data[0][2],data[0][1]))
                conn.commit()
                
                qr_video = QR_CODE_URL + VIDEO_IMAGE_PATH[0][21:]
                qr_image = QR_CODE_URL + VIDEO_IMAGE_PATH[1][21:]
                RESULT = {'status':'200',"msg" : "QR CODE GENERATED","img":qr_image,"video":qr_video} 

                if (campaign_records[2] == None):
                    RESULT = {'status':'201',"msg" : "CREATE ADVERT VIDEO FIRST"}

        except (Exception, Error) as error:
            msg ="ERROR OCURRED .. CONTACT ADMIN QR CODE NOT GENERATED " + str(error)
            RESULT = {"msg" : msg, "status":"201"}
        finally:
            if (conn):
                cur.close()
                conn.close()
        return RESULT

@app.route('/api/qrcode/video/select' , methods=['POST','GET'])
def QRCODE_VIDEO_SELECT():
    if request.method == 'POST':
        RESULT          = {}
        API_RESULT      = request.get_json()
        QR_CODE_RECORDS = []
        try:
            conn = get_db_connection()
            cur = conn.cursor() 
            cur.execute('SELECT campaign_id , campaign_qr_video , campaign_qr_image , campaign_media_preview FROM campaigns  WHERE campaign_id = %s AND campaign_owner_id = %s',(API_RESULT['campaign_id'],API_RESULT['uid']))
            conn.commit()
            campaign_records = cur.fetchone()
            
            if(campaign_records[1]==None or campaign_records[2]==None or campaign_records[3]==None ):
                RESULT = {"msg" : "DESIGN AN ADVERT FIRST ","status":"201"}
            
            if(campaign_records[3]!=None):
                if(campaign_records[0]==API_RESULT['campaign_id']):

                    qr_video = QR_CODE_URL + campaign_records[1][21:]
                    qr_image = QR_CODE_URL + campaign_records[2][21:]
                    qr_prev  = QR_CODE_URL + campaign_records[3][21:]
                    QR_CODE_RECORDS.append({"img":qr_image,"video":qr_video,"prev":qr_prev})
                    RESULT   = {'status':'200',"msg" : "QR CODE GENERATED","qrcode":QR_CODE_RECORDS}
                  
        except (Exception, Error) as error:
    
            msg ="QRCODE NOT CREATED YET "
            RESULT = {"msg" : msg,"status":"202"}

        finally:
            if (conn):
                cur.close()
                conn.close()

    return jsonify(RESULT)

def QRCODE_TASK(i, j):
    while True:
        try:
            #print('hello')
            QUERY_OFF='SIGNAL_OFF'
            j.put(QUERY_OFF)
            sleep(0.5)
        except Timeout as ex:
            print("Exeption Raised ", ex)

@app.route('/api/rss/feeds/create' , methods=['POST','GET'])
def RSS_FEEDS():
    RESULT = {}
    if request.method == 'POST':
        byte_str = request.data
        dict_str = byte_str.decode("UTF-8")
        data = ast.literal_eval(dict_str)
        FEED_VIDEO_PATH        = [] 
        
        WIDTH  =  data.get('w')
        HEIGHT =  data.get('h')
        MSG    =  data.get('msg')
        output = subprocess.run(['/bin/bash',"./rss.sh",str(WIDTH),str(HEIGHT),str(MSG)], stdout=PIPE, stderr=PIPE, universal_newlines=True)
        for out in output.stdout.split(':'):
            FEED_VIDEO_PATH.append(out)
            #UPDATE DB  
            RESULT = {'data':FEED_VIDEO_PATH}
        PAYLOAD = {}
        SCHEDULAR_PAYLOAD = {}
        URL ='http://127.0.0.1:5007/api/edge/ads/submit'
        MEDI_URL = FEED_VIDEO_PATH[0]
        size = len(MEDI_URL)
        PAYLOAD  = {'uploaded_file': open( MEDI_URL[:size - 1] ,'rb')}
        res = requests.post(URL, files=PAYLOAD)
        if(res.ok):
            RSS_FILE = res.json()
            RSS_URL = "http://127.0.0.1:5007/api/billboard/ads/submit"
            RSS_MSG = "Breaking News:940:0:8400:3:rss:"+ RSS_FILE['MEDIAFILE'] +":BOTTOM-RIGHT:1920:100:4"
            RSS_DTA = {'query':RSS_MSG}
            requests.post(RSS_URL,  json=RSS_DTA)
    return RESULT

if __name__ == "__main__":
    #thread_exit_Flag = 1
    thread = Thread(target=QRCODE_TASK , args=(1, j, ))
    thread.daemon = True
    thread.start()
    
    T1 = Thread(target=PUB_TASK , args=(1, q, v, ))
    T2 = Thread(target=SUB_TASK , args=(1, v, ))
    T1.daemon = True
    T1.start()
    T2.daemon = True
    T2.start()
    
    app.run(host='127.0.0.1',port=5008,use_reloader=False)
