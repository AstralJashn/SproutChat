import { useEffect, useState, useRef, useMemo } from 'react';
import { X, Mic, Brain, Volume2 } from 'lucide-react';

interface VoiceModeMobileProps {
  onClose: () => void;
  onTranscript: (transcript: string) => void;
  isProcessing: boolean;
  isSpeaking: boolean;
  responseAudioLevelRef: React.MutableRefObject<number>;
  onInterrupt: () => void;
}

export function VoiceModeMobile({
  onClose,
  onTranscript,
  isProcessing,
  isSpeaking,
  responseAudioLevelRef,
  onInterrupt,
}: VoiceModeMobileProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const micAudioLevelRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef(Date.now());
  const isSubmittingRef = useRef(false);

  const backgroundSparks = useMemo(() => {
    return [...Array(2)].map((_, i) => ({
      key: `spark-${i}`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 5 + Math.random() * 3,
      delay: Math.random() * 2,
      sparkX: `${(Math.random() - 0.5) * 150}px`,
      sparkY: `${(Math.random() - 0.5) * 150}px`,
    }));
  }, []);

  const startRecording = async () => {
    try {
      console.log('[VoiceModeMobile] Starting recording...');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });

      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm';

      console.log('[VoiceModeMobile] Using MIME type:', mimeType);

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('[VoiceModeMobile] Audio chunk received:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('[VoiceModeMobile] MediaRecorder stopped, chunks:', audioChunksRef.current.length);

        if (isSubmittingRef.current) {
          console.log('[VoiceModeMobile] Already submitting, skipping...');
          return;
        }

        if (audioChunksRef.current.length === 0) {
          console.log('[VoiceModeMobile] No audio chunks captured');
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('[VoiceModeMobile] Audio blob created:', audioBlob.size, 'bytes');

        if (audioBlob.size < 1000) {
          console.log('[VoiceModeMobile] Audio too small, skipping...');
          return;
        }

        isSubmittingRef.current = true;
        await sendToWhisper(audioBlob, mimeType);
      };

      audioContextRef.current = new AudioContext({
        latencyHint: 'interactive',
        sampleRate: 16000
      });
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 64;
      analyserRef.current.smoothingTimeConstant = 0.5;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateAudioLevel = () => {
        if (!analyserRef.current || !audioContextRef.current) return;

        if (isProcessing || isSpeaking) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        let count = 0;
        for (let i = 1; i < 5; i++) {
          sum += dataArray[i];
          count++;
        }

        const avgLevel = sum / count;
        const weightedLevel = avgLevel * 1.5;
        const clampedLevel = Math.min(100, weightedLevel);

        const now = Date.now();
        if (Math.abs(micAudioLevelRef.current - clampedLevel) > 20 && (now - lastUpdateTimeRef.current) > 150) {
          micAudioLevelRef.current = clampedLevel;
          lastUpdateTimeRef.current = now;
          setMicAudioLevel(clampedLevel);
        } else {
          micAudioLevelRef.current = clampedLevel;
        }
      };

      audioIntervalRef.current = setInterval(updateAudioLevel, 350);

      mediaRecorder.start(1000);
      setIsRecording(true);
      console.log('[VoiceModeMobile] Recording started successfully');

    } catch (error) {
      console.error('[VoiceModeMobile] Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
      onClose();
    }
  };

  const stopRecording = () => {
    console.log('[VoiceModeMobile] Stopping recording...');

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }

    setIsRecording(false);
  };

  const sendToWhisper = async (audioBlob: Blob, mimeType: string) => {
    try {
      const fileExtension = mimeType.includes('mp4') ? 'audio.mp4' :
                           mimeType.includes('webm') ? 'audio.webm' : 'audio.wav';

      const formData = new FormData();
      formData.append('file', audioBlob, fileExtension);
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'en');

      console.log('[VoiceModeMobile] Sending to Whisper API...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speech-to-text`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: formData,
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        const transcript = result.text?.trim();

        if (transcript) {
          console.log('[VoiceModeMobile] Got transcript:', transcript);
          onTranscript(transcript);
        } else {
          console.log('[VoiceModeMobile] Empty transcript');
          isSubmittingRef.current = false;
        }
      } else {
        console.error('[VoiceModeMobile] Whisper API error:', response.status);
        isSubmittingRef.current = false;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('[VoiceModeMobile] Request timed out');
      } else {
        console.error('[VoiceModeMobile] Error:', err);
      }
      isSubmittingRef.current = false;
    }
  };

  useEffect(() => {
    startRecording();

    return () => {
      console.log('[VoiceModeMobile] Cleanup...');

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }

      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isSpeaking && !isProcessing && !isRecording && !isSubmittingRef.current) {
      console.log('[VoiceModeMobile] Response finished, ready to record again');
      isSubmittingRef.current = false;
      audioChunksRef.current = [];

      setTimeout(() => {
        if (!isRecording && !isProcessing && !isSpeaking) {
          startRecording();
        }
      }, 500);
    }
  }, [isSpeaking, isProcessing]);

  useEffect(() => {
    if (isProcessing || isSpeaking) {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend();
      }
    } else if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();

      if (!audioIntervalRef.current && analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

        const updateAudioLevel = () => {
          if (!analyserRef.current || !audioContextRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          let count = 0;
          for (let i = 1; i < 5; i++) {
            sum += dataArray[i];
            count++;
          }

          const avgLevel = sum / count;
          const weightedLevel = avgLevel * 1.5;
          const clampedLevel = Math.min(100, weightedLevel);

          const now = Date.now();
          if (Math.abs(micAudioLevelRef.current - clampedLevel) > 20 && (now - lastUpdateTimeRef.current) > 150) {
            micAudioLevelRef.current = clampedLevel;
            lastUpdateTimeRef.current = now;
            setMicAudioLevel(clampedLevel);
          } else {
            micAudioLevelRef.current = clampedLevel;
          }
        };

        audioIntervalRef.current = setInterval(updateAudioLevel, 350);
      }
    }
  }, [isProcessing, isSpeaking]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    let animationFrame: number;
    let lastRippleTime = 0;
    const ripples: Array<{ radius: number; opacity: number; maxRadius: number }> = [];

    const animate = (timestamp: number) => {
      if (isSpeaking) {
        ctx.clearRect(0, 0, width, height);
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const audioIntensity = isSpeaking
        ? Math.max(0.5, responseAudioLevelRef.current / 100)
        : isRecording && micAudioLevel > 20
        ? Math.min(1, micAudioLevel / 100)
        : 0.3;

      const rippleInterval = isSpeaking ? 1000 : isRecording && micAudioLevel > 25 ? 1200 : 2500;

      if (timestamp - lastRippleTime > rippleInterval && (isSpeaking || (isRecording && micAudioLevel > 25))) {
        if (ripples.length < 2) {
          ripples.push({
            radius: 0,
            opacity: 0.35,
            maxRadius: 180
          });
        }
        lastRippleTime = timestamp;
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        ripple.radius += 5;
        ripple.opacity -= 0.02;

        if (ripple.opacity <= 0 || ripple.radius > ripple.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        const activeColor = (isSpeaking || isRecording);
        ctx.strokeStyle = activeColor
          ? `rgba(16, 185, 129, ${ripple.opacity * 0.4})`
          : `rgba(156, 163, 175, ${ripple.opacity * 0.25})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isSpeaking, isRecording, micAudioLevel, responseAudioLevelRef]);

  useEffect(() => {
    if (!heartRef.current) return;

    let animationFrame: number;
    let currentScale = 1;
    let targetScale = 1;

    const animateBeat = () => {
      if (!heartRef.current) return;

      if (isSpeaking) {
        const intensity = Math.max(0.3, responseAudioLevelRef.current / 100);
        targetScale = 1 + intensity * 0.15;
        currentScale = currentScale * 0.7 + targetScale * 0.3;
        heartRef.current.style.transform = `scale(${currentScale})`;
      } else if (isRecording && micAudioLevel > 15) {
        const intensity = Math.min(1, micAudioLevel / 80);
        targetScale = 1.12 + intensity * 0.3;
        currentScale = currentScale * 0.65 + targetScale * 0.35;
        heartRef.current.style.transform = `scale(${currentScale})`;
      } else {
        targetScale = 1;
        currentScale = currentScale * 0.9 + targetScale * 0.1;
        heartRef.current.style.transform = `scale(${currentScale})`;
      }

      animationFrame = requestAnimationFrame(animateBeat);
    };

    animationFrame = requestAnimationFrame(animateBeat);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isSpeaking, isRecording, micAudioLevel, responseAudioLevelRef]);

  const handleStopRecording = () => {
    console.log('[VoiceModeMobile] Manual stop requested');
    stopRecording();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-cyan-500/8 to-emerald-500/8"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent"></div>

      <div className="absolute inset-0">
        <div className="absolute top-20 left-5 w-[200px] h-[200px] bg-gradient-to-br from-emerald-500/8 to-emerald-600/2 rounded-full filter blur-[20px]"></div>
        <div className="absolute top-40 right-5 w-[200px] h-[200px] bg-gradient-to-br from-cyan-500/8 to-cyan-600/2 rounded-full filter blur-[20px]"></div>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {backgroundSparks.map((spark) => (
          <div
            key={spark.key}
            className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
            style={{
              left: spark.left,
              top: spark.top,
              animation: `spark-float ${spark.duration}s ease-in-out ${spark.delay}s infinite`,
              '--spark-x': spark.sparkX,
              '--spark-y': spark.sparkY,
              willChange: 'transform, opacity',
            } as any}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/50 z-[1]"></div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-50 pointer-events-auto bg-slate-900/70 rounded-full p-2 hover:bg-slate-800/90"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]">
        <img
          src="/Hello-World-earth.svg"
          alt="Earth"
          className="w-[250px] h-[250px] opacity-25 object-contain"
        />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
        <div className="relative mb-6">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-75"
          />

          <div
            ref={heartRef}
            className="relative z-10 transition-transform duration-150 ease-out"
          >
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              className={`w-32 h-32 ${
                isSpeaking || isRecording ? 'drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]' : 'drop-shadow-[0_0_10px_rgba(100,116,139,0.5)]'
              }`}
            >
              <defs>
                <linearGradient id="voiceHeartGradMobile" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="75%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
                <radialGradient id="voiceHeartGlowMobile" cx="50%" cy="45%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                  <stop offset="20%" stopColor="#d1fae5" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                </radialGradient>
                <filter id="voiceHeartFilterMobile">
                  <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <g filter="url(#voiceHeartFilterMobile)">
                <path
                  d="M100,170
                     L55,125
                     C40,110 35,95 35,80
                     C35,55 52,40 70,40
                     C82,40 92,47 100,57
                     C108,47 118,40 130,40
                     C148,40 165,55 165,80
                     C165,95 160,110 145,125
                     L100,170 Z"
                  fill="url(#voiceHeartGradMobile)"
                  strokeWidth="0"
                />

                <path
                  d="M100,170
                     L55,125
                     C40,110 35,95 35,80
                     C35,55 52,40 70,40
                     C82,40 92,47 100,57
                     C108,47 118,40 130,40
                     C148,40 165,55 165,80
                     C165,95 160,110 145,125
                     L100,170 Z"
                  fill="url(#voiceHeartGlowMobile)"
                />
              </g>
            </svg>
          </div>
        </div>

        <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            {isSpeaking ? (
              <Volume2 className="w-6 h-6 text-emerald-400 animate-pulse" />
            ) : isProcessing ? (
              <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
            ) : isRecording ? (
              <Mic className="w-6 h-6 text-cyan-400 animate-pulse" />
            ) : null}
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {isSpeaking ? 'Speaking' : isProcessing ? 'Processing' : isRecording ? 'Listening' : 'Ready'}
            </h3>
          </div>

          <p className="text-gray-300 text-sm mb-6 text-center max-w-xs px-4">
            {isSpeaking
              ? 'Assistant is responding...'
              : isProcessing
              ? 'Thinking about your question...'
              : isRecording
              ? 'Tap "Stop" when you finish speaking'
              : 'Initializing...'}
          </p>

          {isRecording && !isProcessing && !isSpeaking && (
            <button
              onClick={handleStopRecording}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-base font-bold rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-200 active:scale-95 pointer-events-auto z-50"
            >
              Stop Recording
            </button>
          )}

          {isSpeaking && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInterrupt();
              }}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-base font-bold rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all duration-200 active:scale-95 pointer-events-auto z-50"
            >
              Stop Speaking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
