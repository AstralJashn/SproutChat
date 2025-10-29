import { useEffect, useState, useRef } from 'react';
import { Compass, MapPin, Thermometer, Wind, Activity, AlertTriangle, Radio, X } from 'lucide-react';

interface SituationalGuideProps {
  onClose: () => void;
  onSendMessage: (message: string) => void;
}

interface SensorData {
  location?: { latitude: number; longitude: number; accuracy: number };
  heading?: number;
  motion?: { x: number; y: number; z: number };
  pressure?: number;
  light?: number;
  temperature?: number;
  soundLevel?: number;
}

export function SituationalGuide({ onClose, onSendMessage }: SituationalGuideProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData>({});
  const [lastShakeTime, setLastShakeTime] = useState(0);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [locationSent, setLocationSent] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const isMonitoringRef = useRef(false);

  const addAlert = (message: string) => {
    setAlerts(prev => [...prev, message]);
  };

  const startSensorMonitoring = async () => {
    console.log('[Sensor Assistant] Starting monitoring...');
    setIsMonitoring(true);
    isMonitoringRef.current = true;
    setLocationSent(false);
    onSendMessage('🧭 **Environmental Analysis Starting**\n\nActivating all sensors... Analyzing your surroundings for potential hazards.');

    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setSensorData(prev => ({ ...prev, location: { latitude, longitude, accuracy } }));

          if (!locationSent) {
            setLocationSent(true);
            onSendMessage(`📍 **Location Acquired**\n\nCoordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\nAccuracy: ${accuracy.toFixed(0)}m\n\nMonitoring for nearby hazards...`);
          }
        },
        (error) => {
          console.error('Location error:', error);
          addAlert('⚠️ Location access denied');
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }

    if (window.DeviceOrientationEvent && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        console.log('[Sensor Assistant] Requesting orientation permission...');
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        console.log('[Sensor Assistant] Orientation permission:', permission);
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          console.log('[Sensor Assistant] Orientation listener added');
        }
      } catch (error) {
        console.log('[Sensor Assistant] Orientation permission error, adding listener anyway:', error);
        window.addEventListener('deviceorientation', handleOrientation);
      }
    } else {
      console.log('[Sensor Assistant] Adding orientation listener (no permission needed)');
      window.addEventListener('deviceorientation', handleOrientation);
    }

    if (window.DeviceMotionEvent && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        console.log('[Sensor Assistant] Requesting motion permission...');
        const permission = await (DeviceMotionEvent as any).requestPermission();
        console.log('[Sensor Assistant] Motion permission:', permission);
        if (permission === 'granted') {
          window.addEventListener('devicemotion', handleMotion);
          console.log('[Sensor Assistant] Motion listener added');
        }
      } catch (error) {
        console.log('[Sensor Assistant] Motion permission error, adding listener anyway:', error);
        window.addEventListener('devicemotion', handleMotion);
      }
    } else {
      console.log('[Sensor Assistant] Adding motion listener (no permission needed)');
      window.addEventListener('devicemotion', handleMotion);
    }

    try {
      console.log('[Sensor Assistant] Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[Sensor Assistant] Microphone access granted');
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      monitorSound();
      console.log('[Sensor Assistant] Sound monitoring started');
    } catch (error) {
      console.log('[Sensor Assistant] Microphone access denied:', error);
      addAlert('🔇 Microphone access denied');
    }

    console.log('[Sensor Assistant] All sensors initialized');
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (event.alpha !== null) {
      const heading = 360 - event.alpha;
      setSensorData(prev => ({ ...prev, heading }));
    }
  };

  const handleMotion = (event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity;
    if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
      const motion = { x: acc.x, y: acc.y, z: acc.z };
      setSensorData(prev => ({ ...prev, motion }));

      const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
      const now = Date.now();

      if (magnitude > 25 && now - lastShakeTime > 3000) {
        setLastShakeTime(now);
        onSendMessage('⚠️ **SUDDEN MOVEMENT DETECTED**\n\nAre you safe? Detected violent motion or impact.\n\nIf you need help, say "SOS" to prepare emergency alert with your location.');
        addAlert('⚠️ Violent motion detected!');
      }
    }
  };

  const monitorSound = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const checkSound = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

      setSensorData(prev => ({ ...prev, soundLevel: average }));

      if (average > 150) {
        onSendMessage('🔊 **LOUD NOISE DETECTED**\n\nExtremely loud sound detected. This could indicate:\n- Explosion or blast\n- Structural collapse\n- Severe weather (thunder)\n\nAssess your safety and move to secure location if needed.');
      }

      if (isMonitoringRef.current) {
        requestAnimationFrame(checkSound);
      }
    };

    checkSound();
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    isMonitoringRef.current = false;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    window.removeEventListener('deviceorientation', handleOrientation);
    window.removeEventListener('devicemotion', handleMotion);

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    onSendMessage('🛑 **Monitoring Stopped**\n\nEnvironmental monitoring has been deactivated. Stay safe!');
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const getDirection = (degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const analyzeEnvironment = () => {
    console.log('[Sensor Assistant] Analyzing environment...');
    let analysis = '🔍 **Environmental Analysis**\n\n';

    if (sensorData.location) {
      analysis += `�� Location: ${sensorData.location.latitude.toFixed(4)}, ${sensorData.location.longitude.toFixed(4)}\n`;
    }

    if (sensorData.heading !== undefined) {
      analysis += `🧭 Heading: ${sensorData.heading.toFixed(0)}° (${getDirection(sensorData.heading)})\n`;
    }

    if (sensorData.motion) {
      const magnitude = Math.sqrt(
        sensorData.motion.x ** 2 +
        sensorData.motion.y ** 2 +
        sensorData.motion.z ** 2
      );
      analysis += `📱 Motion: ${magnitude > 15 ? 'Active movement' : magnitude > 8 ? 'Slight movement' : 'Stationary'}\n`;
    }

    if (sensorData.soundLevel !== undefined) {
      const level = sensorData.soundLevel > 100 ? 'Very Loud' :
                    sensorData.soundLevel > 50 ? 'Moderate' : 'Quiet';
      analysis += `🔊 Ambient Sound: ${level}\n`;
    }

    analysis += '\nAll systems operational. Monitoring for hazards...';
    onSendMessage(analysis);
  };

  const requestSOSPrep = () => {
    console.log('[Sensor Assistant] Preparing SOS...', sensorData);
    if (sensorData.location) {
      const sosMessage = `🆘 **EMERGENCY ALERT PREPARED**\n\n` +
        `Location: ${sensorData.location.latitude.toFixed(6)}, ${sensorData.location.longitude.toFixed(6)}\n` +
        `Accuracy: ${sensorData.location.accuracy.toFixed(0)}m\n` +
        `Time: ${new Date().toISOString()}\n\n` +
        `Say "SEND SOS" to broadcast this emergency message to emergency services.`;
      onSendMessage(sosMessage);
    } else {
      onSendMessage('⚠️ **Unable to prepare SOS**: Location not available. Trying to acquire location...');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col border border-emerald-500/30">
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-gradient-to-r from-emerald-900/50 to-cyan-900/50">
          <div className="flex items-center space-x-2">
            <Compass className="w-6 h-6 text-emerald-400 animate-pulse" />
            <h2 className="text-xl font-bold text-white">Sensor Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-emerald-400 mb-3">Live Sensor Data</h3>

            <div className="space-y-2 text-sm">
              {sensorData.location && (
                <div className="flex items-center space-x-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>{sensorData.location.latitude.toFixed(4)}, {sensorData.location.longitude.toFixed(4)}</span>
                </div>
              )}

              {sensorData.heading !== undefined && (
                <div className="flex items-center space-x-2 text-gray-300">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>{sensorData.heading.toFixed(0)}° ({getDirection(sensorData.heading)})</span>
                </div>
              )}

              {sensorData.motion && (
                <div className="flex items-center space-x-2 text-gray-300">
                  <Activity className="w-4 h-4 text-yellow-400" />
                  <span>
                    {Math.sqrt(sensorData.motion.x ** 2 + sensorData.motion.y ** 2 + sensorData.motion.z ** 2) > 15
                      ? 'Moving' : 'Stationary'}
                  </span>
                </div>
              )}

              {sensorData.soundLevel !== undefined && (
                <div className="flex items-center space-x-2 text-gray-300">
                  <Radio className="w-4 h-4 text-purple-400" />
                  <span>Sound: {sensorData.soundLevel > 100 ? 'Loud' : sensorData.soundLevel > 50 ? 'Moderate' : 'Quiet'}</span>
                </div>
              )}

              {!sensorData.location && !sensorData.heading && !sensorData.motion && (
                <p className="text-gray-500 text-center py-2">No sensor data yet</p>
              )}
            </div>
          </div>

          {alerts.length > 0 && (
            <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/50">
              <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Alerts</span>
              </h4>
              <div className="space-y-1">
                {alerts.slice(-3).map((alert, idx) => (
                  <p key={idx} className="text-xs text-red-300">{alert}</p>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            Monitoring: GPS • Compass • Motion • Sound
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900/50 space-y-2">
          {!isMonitoring ? (
            <button
              onClick={startSensorMonitoring}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 shadow-lg"
            >
              Start Environmental Monitoring
            </button>
          ) : (
            <>
              <button
                onClick={analyzeEnvironment}
                className="w-full py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Analyze Current Situation
              </button>
              <button
                onClick={requestSOSPrep}
                className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Prepare SOS Alert
              </button>
              <button
                onClick={stopMonitoring}
                className="w-full py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors"
              >
                Stop Monitoring
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
