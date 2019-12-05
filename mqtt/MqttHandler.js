const mqtt = require("mqtt");
const models = require("../models");
const docs = [
  "locationHistory",
  "heartRateHistory",
  "lightSensorHistory",
  "roomTempHistory"
];
const controllers = {};
docs.forEach(item => {
  const constructor = models[item];
  controllers[item] = new constructor();
});

class MqttHandler {
  constructor() {
    this.mqttClient = null;
    this.host = "mqtt://broker.mqttdashboard.com";
    // this.username = 'YOUR_USER'; // mqtt credentials if these are needed to connect
    // this.password = 'YOUR_PASSWORD';
  }

  connect() {
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    this.mqttClient = mqtt.connect(
      this.host /*, { username: this.username, password: this.password }*/
    );

    // Mqtt error calback
    this.mqttClient.on("error", err => {
      console.error(err);
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on("connect", () => {
      console.log(`mqtt client connected`);
    });

    // mqtt subscriptions
    this.mqttClient.subscribe("sensors/#", { qos: 0 });

    // When a message arrives, console.log it
    this.mqttClient.on("message", function(topic, message) {
      message = message.toString();
      if (docs.includes(topic.split("/")[1])) {
        controllers[topic.split("/")[1]]
          .create(JSON.parse(message))
          .then(l => {
            console.log("l: ", l);
          })
          .catch(err => {
            console.log("err: ", err);
          });
      }
    });

    this.mqttClient.on("close", () => {
      console.log(`mqtt client disconnected`);
    });
  }

  // Sends a mqtt message to topic: mytopic
  sendMessage(message) {
    this.mqttClient.publish("sensors/backend", message);
  }
}

module.exports = MqttHandler;
