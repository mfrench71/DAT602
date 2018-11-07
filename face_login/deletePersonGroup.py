#*****deletePersonGroup.py*****#
import requests
import urllib, httplib, base64

KEY = '750cc2f2c6fe4633a2ace4e9d7335867'

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

