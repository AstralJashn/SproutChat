# Sensor-Aware Safety Assistant

The Situational Guide (Compass icon) has been transformed into an advanced, sensor-aware safety assistant that monitors your real environment and communicates through the chat interface.

## Features

### 🌍 Real-Time Environmental Monitoring

When activated, the assistant continuously monitors:

- **GPS Location**: Tracks your coordinates with high accuracy
- **Compass/Heading**: Monitors your current direction (N, NE, E, etc.)
- **Motion Sensors**: Detects movement, impacts, and sudden shakes
- **Microphone**: Listens for loud noises (explosions, collapses, thunder)
- **Accelerometer**: Tracks device orientation and violent movements

### 🚨 Automatic Hazard Detection

The assistant automatically detects and alerts you to:

- **Violent Motion**: Falls, impacts, or sudden shaking (earthquake detection)
- **Loud Noises**: Explosions, structural collapse, severe weather
- **Location Changes**: Monitors if you're moving away from safety zones

### 💬 Chat-Based Interaction

All sensor data and alerts are delivered directly in the chat:

- Location acquired messages with coordinates
- Movement detection alerts
- Loud noise warnings
- Situation analysis reports
- Emergency SOS preparation

### 🔍 Continuous Monitoring Mode

**Long-press the Compass icon** to activate continuous background monitoring:
- Sensors stay active even when the modal is closed
- Real-time alerts appear in chat
- Perfect for "set it and forget it" safety monitoring

### 🆘 Emergency Features

1. **Environment Analysis**: Get a complete sensor readout
2. **SOS Preparation**: Creates emergency alert with precise coordinates
3. **Directional Guidance**: Uses compass to provide heading-based directions
4. **Offline Navigation**: Basic compass directions work without internet

## Usage

### Quick Start
1. Tap the Compass icon to open Sensor Assistant
2. Click "Start Environmental Monitoring"
3. Grant sensor permissions (location, motion, microphone)
4. Watch as live sensor data appears
5. Messages automatically appear in chat

### Long Press Activation
1. Long-press (hold) the Compass icon for 1 second
2. Continuous monitoring activates automatically
3. Close the modal - monitoring continues
4. Alerts appear in chat when hazards detected

### Emergency Scenarios

**Earthquake Detection**:
- Violent shaking triggers automatic alert
- "Are you safe?" message appears in chat
- Location coordinates ready for SOS

**Lost/Stranded**:
- Compass shows current heading
- Location tracking active
- Can provide "walk northeast 200m" guidance

**Loud Noise**:
- Microphone detects explosions/collapse
- Immediate alert in chat
- Suggests finding secure location

### Controls

- **Analyze Current Situation**: Get full sensor report
- **Prepare SOS Alert**: Creates emergency message with location
- **Stop Monitoring**: Deactivates all sensors

## Permissions Required

- **Location**: For GPS coordinates and navigation
- **Motion/Orientation**: For compass and impact detection
- **Microphone**: For loud noise detection

All permissions are requested when monitoring starts.

## Technical Details

- Uses Web APIs: Geolocation, DeviceOrientation, DeviceMotion, MediaDevices
- Real-time sensor polling (30-60fps for motion)
- Low battery impact (sensors only active when monitoring)
- Works on iOS and Android (with permission)
- Graceful fallback if sensors unavailable

## Safety Notes

- Keep device charged - sensor monitoring uses battery
- Grant all permissions for best results
- In true emergency, call local emergency services (911, 112, etc.)
- This assistant supplements, not replaces, official emergency systems
