import os
import boto3

bucketName = 'dat-602-users'
s3=boto3.resource('s3')
people = ['Cass','Donald','Matthew','Sam']

for name in people:
    directory = '/home/pi/DAT602/face_login/images/'+name # item[0] is person$
    for filename in os.listdir(directory):
        if filename.endswith('.jpg'): # adjust this depending on the file type o$
            filePath = os.path.join(directory, filename) # creates full file path
            data = open(filePath, 'rb')
            s3.Bucket(bucketName).put_object(Key=(name+'/'+filename), Body=data, ContentType='image/jpeg')
            object_acl = s3.ObjectAcl(bucketName, (name+'/'+filename))
            response = object_acl.put(ACL='public-read') # makes link public
            link = 'https://s3-eu-west-1.amazonaws.com/'+bucketName+'/'+name+'/'+filename # links in s3 follow this pattern
            print(link)
