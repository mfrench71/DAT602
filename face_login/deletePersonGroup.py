#*****deletePersonGroup.py*****#
import requests
import urllib, httplib, base64

KEY = '7'

group_id = 'users'
body = '{"name": "Users"}'
params = urllib.urlencode({'personGroupId': group_id})
headers = {'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': KEY}

conn = httplib.HTTPSConnection('westus.api.cognitive.microsoft.com')
conn.request("DELETE", "/face/v1.0/persongroups/{personGroupId}?%s" % params, body, headers)
response = conn.getresponse()
data = response.read()
print(data)
conn.close()

