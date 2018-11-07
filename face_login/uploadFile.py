#*****uploadFile.py*****#
import boto3
import os

bucketName = 'dat-602-users'

s3=boto3.resource('s3')
directory = '/home/pi/Pictures/'
fileName = 'image2.jpg'
filePath = os.path.join(directory,fileName)
data = open(filePath, 'rb')
s3.Bucket(bucketName).put_object(Key=fileName, Body=data, ContentType='image/jpeg')
object_acl = s3.ObjectAcl(bucketName, fileName)
response = object_acl.put(ACL='public-read') # makes link public

link = 'https://s3-eu-west-1.amazonaws.com/'+bucketName+'/'+fileName # links in s3 follow this pattern
print(link)
