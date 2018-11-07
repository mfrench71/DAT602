import paho.mqtt.client as mqttClient
import time

def on_connect(client, userdata, flags, rc):

    if rc == 0:

        print("Connected to broker")

        global Connected                #Use global variable
        Connected = True                #Signal connection 

    else:

        print("Connection failed")

Connected = False   #global variable for the state of the connection

broker_address= "m23.cloudmqtt.com"
port = 16269
user = "xtrzjlsv"
password = "WK0MHl3W2D5j"

client = mqttClient.Client("FaceRecognition")      #create new instance
client.username_pw_set(user, password=password)    #set username and password
client.on_connect= on_connect                      #attach function to callback
client.connect(broker_address, port=port)          #connect to broker

client.loop_start()        #start the loop

while Connected != True:    #Wait for connection
    time.sleep(0.1)

try:
    while True:

        value = raw_input('Enter the message:')
        client.publish("DAT602/test",value)

except KeyboardInterrupt:

    client.disconnect()
    client.loop_stop()
