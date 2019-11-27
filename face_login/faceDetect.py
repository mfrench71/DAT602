#*****faceDetect.py*****#
import urllib, httplib, base64
import requests
from PIL import Image, ImageDraw
import sys
import json

KEY = ''
pic = 'images/Cass/cass_01.jpg'
def recogn():
    headers = {'Content-Type': 'application/octet-stream', 'Ocp-Apim-Subscription-Key': KEY}
    body = open(pic ,'rb')
    params = urllib.urlencode({'returnFaceId': 'true'})
    conn = httplib.HTTPSConnection('westus.api.cognitive.microsoft.com')# this should be taken from your endpoint
    conn.request("POST", '/face/v1.0/detect?%s' % params, body, headers) # this is the specific endpoint
    response = conn.getresponse()
    photo_data = json.loads(response.read())

    def getRectangle(faceDictionary):
        rect = faceDictionary['faceRectangle']
        left = rect['left']
        top = rect['top']
        bottom = left + rect['height']
        right = top + rect['width']
        return ((left, top), (bottom, right))
    
    img = Image.open(pic) # open image system argument
    draw = ImageDraw.Draw(img)
    for face in photo_data: # for the faces identified
        draw.rectangle(getRectangle(face), outline='blue') # outline faces in blue due to coordinates in json
    img.show() # display drawn upon image                                                           
    
    
recogn()
