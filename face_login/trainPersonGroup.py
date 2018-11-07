#*****trainPersonGroup.py*****#
import urllib, httplib, base64, json

group_id = 'users'
KEY = '750cc2f2c6fe4633a2ace4e9d7335867'

params = urllib.urlencode({'personGroupId': group_id})
headers = {'Ocp-Apim-Subscription-Key': KEY}

conn = httplib.HTTPSConnection('westus.api.cognitive.microsoft.com')
conn.request("POST", "/face/v1.0/persongroups/users/train?%s" % params, "{body}", headers)
response = conn.getresponse()
data = json.loads(response.read())
print(data) # if successful prints empty json body
