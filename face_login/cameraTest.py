import picamera

camera = picamera.PiCamera()
print('Taking photo')
camera.capture('test.jpg')
