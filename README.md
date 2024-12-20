# Boat Battery Monitor App
This React Native application displays real-time battery information for a boat, but could be used for any battery. It leverages an **ESP32** microcontroller and a **shunt** to track battery usage, which is then communicated to the app via **Bluetooth Low Energy (BLE)**. This repo only contains the code related to the react native app.
## Features
- **Real-Time Battery Monitoring**: Get accurate readings of the boat's battery usage and status.
- **BLE Communication**: Connect seamlessly to the boat's ESP32 device via Bluetooth.
- **Graph of past usage**
## How It Works
1. The **ESP32** microcontroller, connected to a shunt, measures the battery's voltage and current.
2. The ESP32 processes the data and transmits it via **Bluetooth Low Energy (BLE)**.
3. The React Native application receives and displays the data in a user-friendly interface.
## Future Improvements
- **Encrypted BLE Communication**: Implement secure, encrypted data transfer between the ESP32 and the app.
- **Memory** of connected devices.
