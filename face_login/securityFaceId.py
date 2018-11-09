#*****securityFaceId.py*****#

import requests
import paho.mqtt.client as mqttClient
from operator import itemgetter
from picamera import PiCamera
import sys
import json
import os
import urllib, httplib, base64, json
import boto3
import datetime
import shutil
import time

BaseDirectory = '/home/pi/DAT602/images/' # directory where picamera photos are stored
KEY = '750cc2f2c6fe4633a2ace4e9d7335867' # authorization key for azure
group_id = 'users' # name of personGroup
bucketName = 'dat-602-users' # aws s3 bucket name

#*****Camera Setup*****#
camera = PiCamera() # initiate camera

#*****FUNCTIONS*****#


# Traverse specified directory, detecting faces in .jpg files
def iter():
    for fileName in os.listdir(directory):
        if fileName.endswith('.jpg'):
            filePath = os.path.join(directory, fileName) #create full file path
            fileList.append(filePath)
            detect(filePath)

#Detect faces in images in directory using Face API post request
def detect(img_url):
    headers = {'Content-Type': 'application/octet-stream', 'Ocp-Apim-Subscription-Key': KEY}
    body = open(img_url,'rb')

    params = urllib.urlencode({'returnFaceId': 'true'})
    conn = httplib.HTTPSConnection('westus.api.cognitive.microsoft.com')
    conn.request("POST", '/face/v1.0/detect?%s' % params, body, headers)
    response = conn.getresponse()
    photo_data = json.loads(response.read())

    if not photo_data: # if post response is empty (no face found)
        print('No face identified')
    else: # if face is found
        for face in photo_data: # for the faces identified in each photo
            faceIdList.append(str(face['faceId'])) # get faceId for use in identify

# Receives a  list of faceIds and uses post API request to match face to known faces
def identify(ids):
    if not faceIdList: # if list is empty, no faces found in photos
        result = [('n', .0), 'n'] # create result with 0 confidence
        return result # return result for use in main
    else: # else there is potential for a match
        headers = {'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': KEY}
        params = urllib.urlencode({'personGroupId': group_id})

        body = "{'personGroupId':'users', 'faceIds':"+str(ids)+", 'confidenceThreshold': '.5'}"
        conn = httplib.HTTPSConnection('westus.api.cognitive.microsoft.com')
        conn.request("POST", "/face/v1.0/identify?%s" % params, body, headers)
        response = conn.getresponse()

        data = json.loads(response.read()) # turns response into index-able dictionary

        for resp in data:
            candidates = resp['candidates']
            for candidate in candidates: # for each candidate in the response
                confidence = candidate['confidence'] # retrieve confidence
                personId = str(candidate['personId']) # and personId
                confidenceList.append((personId, confidence))
        conn.close()
        SortedconfidenceList = zip(confidenceList, fileList) # merge fileList and confidence list
        sortedConfidence = sorted(SortedconfidenceList, key=itemgetter(1)) # sort confidence list by confidence
        return sortedConfidence[-1] # returns tuple with highest confidence value (sorted from smallest to biggest)


# Accepts a person_id and retrieves known person's name with API GET request
def getName(person_Id):
    headers = {'Ocp-Apim-Subscription-Key': KEY}
    params = urllib.urlencode({'personGroupId': group_id, 'personId': person_Id})
    conn = httplib.HTTPSConnection('westus.api.cognitive.microsoft.com')
    conn.request("GET", "/face/v1.0/persongroups/{"+group_id+"}/persons/"+person_Id+"?%s" % params, "{body}", headers)
    response = conn.getresponse()
    data = json.loads(response.read())
    name = data['name']
    conn.close()
    return name

#*****Main*****#
count = 0
while True:
    # lists are refreshed for every incident of motion
    fileList = [] # list of filePaths that were passed through as images
    faceIdList = [] # list for face id's generated using api - detect
    confidenceList = [] # list of confidence values derived from api - identify
    i = 1
    if i==0:
        print("No Intruders")
    elif i==1:
        count += 1 # count allows for a new directory to be made for each set of photos
        directory = BaseDirectory+str(count)+'/'
        print("Starting...")
        if not os.path.isdir(directory):
            os.mkdir(directory) # make new directory for photos to be uploaded to
        print('Count: ' + str(count))
        for x in range(0,1):
            date = datetime.datetime.now().strftime('%m_%d_%Y_%M_%S_') # change file name for every photo
            camera.capture(directory + date +'.jpg')
            time.sleep(1) # take photo every second
        iter()
        print('Directory: ' + directory)
        date = datetime.datetime.now().strftime('%m_%d_%Y_%M_%S_') # change file name for every photo
        print('Taking photo...')
        camera.capture(directory + date +'.jpg')
        result = identify(faceIdList)
        if result[0][1] > .7: # if confidence is greater than .7 get name of person
            print(getName(result[0][0]) +' recognised.')
            #remove uploaded images
            if os.path.isdir(directory):
                shutil.rmtree(directory)
                break

        else:
            print('Face NOT recognised' + str(count)) # send message
            if os.path.isdir(directory):
                shutil.rmtree(directory)
            time.sleep(5) # wait 5 seconds before taking another picture

#*****Publish name of recognised person over MQTT*****#

broker_address= "m23.cloudmqtt.com"
#broker address = "mqtt://broker.i-dat.org:80"
port = 16269
#port = 80
user = "xtrzjlsv"
password = "WK0MHl3W2D5j"

client = mqttClient.Client("DAT602")               #create new instance
client.username_pw_set(user, password=password)    #set username and password
#client.on_connect= on_connect                      #attach function to callback
print('Connecting to MQTT broker')
client.connect(broker_address, port=port)          #connect to broker
client.publish("DAT602/test", getName(result[0][0]))
client.disconnect()
