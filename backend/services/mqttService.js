// backend/src/services/mqttService.js
const mqtt = require('mqtt');

class MqttService {
  constructor() {
    this.client = null;
  }

  connect() {
    this.client = mqtt.connect(process.env.MQTT_URL, {
      clientId: process.env.MQTT_CLIENT_ID,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    });

    this.client.on('connect', () => {
      console.log(`🔌 MQTT Connected to broker: ${process.env.MQTT_URL}`);
      
      // Subscribe to status updates from all machines
      this.client.subscribe('vending/+/status', () => {
        console.log('📡 Subscribed to vending machine status topics');
      });
    });

    this.client.on('message', (topic, message) => {
      // Example: topic = vending/vm_001/status
      console.log(`[MQTT RECV] ${topic}: ${message.toString()}`);
      // Future: Use WebSockets to forward this hardware status to the React Kiosk UI
    });

    this.client.on('error', (err) => {
      console.error('MQTT Connection Error:', err);
    });
  }

  // Function to tell the Pi to start pouring
  publishDispenseCommand(machineId, orderId, ingredients) {
    if (!this.client || !this.client.connected) {
      console.error('Cannot publish, MQTT client not connected');
      return;
    }

    const topic = `vending/${machineId}/cmd`;
    const payload = JSON.stringify({
      action: 'START_DISPENSE',
      orderId: orderId,
      ingredients: ingredients // e.g., [{ name: 'Whey', grams: 30, motorChannel: 1 }]
    });

    this.client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error(`Failed to send dispense command to ${machineId}:`, err);
      } else {
        console.log(`🚀 [MQTT SEND] Dispense command sent to ${machineId} for Order ${orderId}`);
      }
    });
  }
}

module.exports = new MqttService();