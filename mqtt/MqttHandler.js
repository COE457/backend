/**
 * @file mqtt/MqttHandler.js 
 * 
 * @copyright https://medium.com/@cri.bh6/in-this-simple-example-im-going-to-show-how-to-write-a-very-simple-expressjs-api-that-uses-mqtt-to-57aa3ecdcd9e
 * 
 * @overview sets up the connection to the MQTT broker
 */
const mqtt = require("mqtt");
const models = require("../models"); //  MQTT will be used to get data from sensors and log them in the database. Models are needed for that 
const docs = [ //  types of docs that will use MQTT
  "locationHistory",
  "heartRateHistory",
  "lightSensorHistory",
  "roomTempHistory",
  "objectHistory",
  "equipmentHistory",
  "panicHistory"
];
const controllers = {}; //  to hold the objects from ../models
docs.forEach(item => {
  const constructor = models[item]; //  model
  controllers[item] = new constructor(); //  the constructor of the model is pushed to controllers 
});

class MqttHandler {
  constructor() { //  initializes the hostname
    this.mqttClient = null;
    this.host = "mqtt://broker.mqttdashboard.com";
    // this.username = 'YOUR_USER'; // mqtt credentials if these are needed to connect
    // this.password = 'YOUR_PASSWORD';
  }

  connect() { //  call this to start the connection to the broker 
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    this.mqttClient = mqtt.connect(
      this.host /*, { username: this.username, password: this.password }*/
    );

    // Mqtt error calback
    this.mqttClient.on("error", err => { //  error handling
      console.error(err);
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on("connect", () => { //  when connection is achieved
      console.log(`mqtt client connected`);
    });

    // mqtt subscriptions
    this.mqttClient.subscribe("childMonitor/sensors/#", { qos: 0 }); //  listening to all topics under sensors/

    this.mqttClient.on("message", function(topic, message) { //  when message arrives
      message = message.toString(); //  store it as a string 
      if (docs.includes(topic.split("/")[3])) { //  check if message is from a required topic
        let body = JSON.parse(message);
        if(topic.split("/")[2] !== "NoWatch"){
          console.log('topic.split("/")[2]: ', topic.split("/")[2]);
          body.Smartwatch = topic.split("/")[2];
        }
        console.log('body: ', body);
        controllers[topic.split("/")[3]] //  use the controller associated with the topic 
          .create(body) //  use the message to 
          .then(i =>{
            console.log('i: ', i);

          })
          .catch(err => { //  on error 
            console.log('in topic: ', topic);
            console.log('message: ', message);
            console.log('err: ', err);            
          });
      }
    });

    this.mqttClient.on("close", () => { //  when the broker disconnects
      console.log(`mqtt client disconnected`);
    });
  }

  // Sends a mqtt message to topic: sensors/backend
  sendMessage(message) {
    this.mqttClient.publish("sensors/backend", message);
  }
}

module.exports = MqttHandler;
