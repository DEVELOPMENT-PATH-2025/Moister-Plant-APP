/* 
  Nexus IoT - Arduino Integration Guide
  Device: ESP32 or ESP8266 (Wi-Fi Required)
  Sensors: IR Sensor (Digital), Soil Moisture (Analog)
*/

#include <WiFi.h>
#include <HTTPClient.h>

// --- CONFIGURATION ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// REPLACE with your "Shared App URL" from AI Studio
const String serverUrl = "https://your-app-url.run.app/api";

// --- HARDWARE ---
const int IR_PIN = 4;        // IR Sensor Digital Out
const int SOIL_PIN = 34;    // Soil Moisture Analog Out

void setup() {
  Serial.begin(115200);
  pinMode(IR_PIN, INPUT);
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi Connected.");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // 1. Send IR Data
    int irVal = digitalRead(IR_PIN);
    http.begin(serverUrl + "/ir/data");
    http.addHeader("Content-Type", "application/json");
    // IR Digital HIGH usually means NO object, LOW means OBJECT
    String irPayload = "{\"detected\":" + String(irVal == LOW ? "true" : "false") + "}";
    int httpCodeIr = http.POST(irPayload);
    http.end();

    // 2. Send Moisture Data
    int moistureRaw = analogRead(SOIL_PIN);
    // Convert 12-bit ADC (0-4095) to 0-100%
    int moisturePercent = map(moistureRaw, 4095, 0, 0, 100); 
    
    http.begin(serverUrl + "/moisture/data");
    http.addHeader("Content-Type", "application/json");
    String moistPayload = "{\"moisture\":" + String(moisturePercent) + ", \"temp\": 25.5, \"humidity\": 45}";
    int httpCodeMoist = http.POST(moistPayload);
    http.end();

    Serial.printf("IR Sent [%d], Moisture Sent [%d%%]\n", httpCodeIr, moisturePercent);
  } else {
    Serial.println("Wi-Fi Disconnected");
  }

  delay(2000); // Wait 2 seconds before next update
}
