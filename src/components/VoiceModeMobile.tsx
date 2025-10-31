import { useEffect, useState, useRef, useMemo } from 'react';
import { X, Mic, Brain, Volume2 } from 'lucide-react';
import { WavRecorder } from '../utils/wavRecorder';

interface VoiceModeMobileProps {
  onClose: () => void;
  onTranscript: (transcript: string) => void;
  isProcessing: boolean;
  isSpeaking: boolean;
  responseAudioLevelRef: React.MutableRefObject<number>;
  onInterrupt: () => void;
  onStopListening: () => void;
}

export function VoiceModeMobile({
  onClose,
  onTranscript,
  isProcessing,
  isSpeaking,
  responseAudioLevelRef,
  onInterrupt,
  onStopListening
}: VoiceModeMobileProps) {
  const [isListening, setIsListening] = useState(true);
  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const micAudioLevelRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const isProcessingTranscriptRef = useRef(false);
  const hasSubmittedTranscriptRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRestartingRef = useRef(false);
  const wavRecorderRef = useRef<WavRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef(Date.now());
  const soundDetectedRef = useRef(false);
  const lastSoundTimeRef = useRef(Date.now());
  const speechStartTimeRef = useRef(0);

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

  const stopRecording = async () => {
    if (wavRecorderRef.current) {
      try {
        const wavBlob = wavRecorderRef.current.stop();
        console.log('[VoiceModeMobile] WAV recorder stopped, blob size:', wavBlob.size);

        if (isRestartingRef.current) {
          console.log('[VoiceModeMobile] Stopped during restart - skipping');
          return;
        }

        if (wavBlob.size < 5000) {
          console.log('[VoiceModeMobile] Audio too small, skipping');
          isProcessingTranscriptRef.current = false;
          hasSubmittedTranscriptRef.current = false;
          return;
        }

        if (!isProcessingTranscriptRef.current && !hasSubmittedTranscriptRef.current) {
          console.log('[VoiceModeMobile] Sending to Whisper...');
          await sendToWhisper(wavBlob, 'audio/wav');
        }
      } catch (e) {
        console.error('[VoiceModeMobile] Error stopping WAV recorder:', e);
      }
    }
  };

  const sendToWhisper = async (audioBlob: Blob, mimeType: string) => {
    try {
      const fileExtension = 'audio.wav';
      const formData = new FormData();
      formData.append('file', audioBlob, fileExtension);
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'en');

      console.log('[VoiceModeMobile] Sending to Whisper, size:', audioBlob.size);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speech-to-text`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        const transcript = result.text?.trim();

        if (transcript) {
          console.log('[VoiceModeMobile] Transcription:', transcript);
          isProcessingTranscriptRef.current = true;
          hasSubmittedTranscriptRef.current = true;
          onTranscript(transcript);
        } else {
          console.log('[VoiceModeMobile] Empty transcription');
          isProcessingTranscriptRef.current = false;
          hasSubmittedTranscriptRef.current = false;
        }
      } else {
        console.error('[VoiceModeMobile] Whisper API error:', response.status);
        isProcessingTranscriptRef.current = false;
        hasSubmittedTranscriptRef.current = false;
      }
    } catch (err: any) {
      console.error('[VoiceModeMobile] Whisper error:', err);
      isProcessingTranscriptRef.current = false;
      hasSubmittedTranscriptRef.current = false;
    }
  };

  useEffect(() => {
    console.log('[VoiceModeMobile] Initializing...');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('[VoiceModeMobile] Speech recognition not supported');
      alert('Speech recognition is not supported in this browser.');
      onClose();
      return;
    }

    let recognition;
    try {
      recognition = new SpeechRecognition();
      console.log('[VoiceModeMobile] SpeechRecognition created');
    } catch (error) {
      console.error('[VoiceModeMobile] Failed to create SpeechRecognition:', error);
      alert('Failed to initialize speech recognition');
      onClose();
      return;
    }

    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = async () => {
      console.log('[VoiceModeMobile] Recognition started');
      setIsListening(true);

      if (isRestartingRef.current) {
        console.log('[VoiceModeMobile] Restart complete');
        isRestartingRef.current = false;
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      console.log('[VoiceModeMobile] Setting 10 second safety timeout');
      silenceTimerRef.current = setTimeout(() => {
        console.log('[VoiceModeMobile] Safety timeout - forcing stop');
        stopRecording();
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.error('[VoiceModeMobile] Error stopping on timeout:', e);
          }
        }
      }, 10000);
    };

    recognition.onspeechend = () => {
      console.log('[VoiceModeMobile] Speech ended');

      setTimeout(() => {
        if (isProcessingTranscriptRef.current || hasSubmittedTranscriptRef.current) {
          console.log('[VoiceModeMobile] Already processing - ignoring');
          setIsListening(false);
          try {
            recognition.stop();
          } catch (e) {
            console.error('[VoiceModeMobile] Error stopping:', e);
          }
          return;
        }

        console.log('[VoiceModeMobile] Stopping recording');
        stopRecording();

        try {
          recognition.stop();
        } catch (e) {
          console.error('[VoiceModeMobile] Error stopping after speechend:', e);
        }
      }, 100);
    };

    recognition.onresult = (event: any) => {
      console.log('[VoiceModeMobile] Recognition result received');

      if (isProcessingTranscriptRef.current || hasSubmittedTranscriptRef.current) {
        console.log('[VoiceModeMobile] Already processing - ignoring result');
        return;
      }
    };

    recognition.onerror = (event: any) => {
      console.log('[VoiceModeMobile] Recognition error:', event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      console.log('[VoiceModeMobile] Recognition ended');
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };

    navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000,
        channelCount: 1
      }
    })
      .then(async (stream) => {
        console.log('[VoiceModeMobile] Microphone access granted');
        mediaStreamRef.current = stream;

        try {
          console.log('[VoiceModeMobile] Initializing WAV recorder');
          wavRecorderRef.current = new WavRecorder();
          await wavRecorderRef.current.start(stream);
          console.log('[VoiceModeMobile] WAV recorder started');
        } catch (err) {
          console.error('[VoiceModeMobile] Failed to start WAV recorder:', err);
        }

        audioContextRef.current = new AudioContext({
          latencyHint: 'interactive',
          sampleRate: 16000
        });
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        analyserRef.current.fftSize = 64;
        analyserRef.current.smoothingTimeConstant = 0.5;
        analyserRef.current.minDecibels = -90;
        analyserRef.current.maxDecibels = -15;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

        const updateAudioLevel = () => {
          if (!analyserRef.current || !audioContextRef.current) return;

          if (isProcessing || isSpeaking) {
            return;
          }

          if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
          }

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
          const shouldUpdate = Math.abs(micAudioLevelRef.current - clampedLevel) > 20 &&
                              (now - lastUpdateTimeRef.current) > 200;

          if (shouldUpdate) {
            micAudioLevelRef.current = clampedLevel;
            lastUpdateTimeRef.current = now;
            setMicAudioLevel(clampedLevel);
          } else {
            micAudioLevelRef.current = clampedLevel;
          }

          if (!soundDetectedRef.current && weightedLevel > 5) {
            soundDetectedRef.current = true;
            console.log('[VoiceModeMobile] Sound detected, level:', weightedLevel);
          }

          if (weightedLevel > 8) {
            lastSoundTimeRef.current = Date.now();
            if (speechStartTimeRef.current === 0) {
              speechStartTimeRef.current = Date.now();
              console.log('[VoiceModeMobile] Speech started');
            }
          }

          const silenceDuration = Date.now() - lastSoundTimeRef.current;
          const speechDuration = speechStartTimeRef.current > 0 ? Date.now() - speechStartTimeRef.current : 0;

          if (audioContextRef.current && silenceDuration > 5000 && speechDuration === 0) {
            if (audioContextRef.current.state === 'running') {
              audioContextRef.current.suspend();
            }
          }
        };

        audioIntervalRef.current = setInterval(updateAudioLevel, 350);

        console.log('[VoiceModeMobile] Starting recognition...');
        try {
          recognition.start();
          setIsListening(true);
        } catch (error) {
          console.error('[VoiceModeMobile] Error starting recognition:', error);
        }
      })
      .catch((error) => {
        console.error('[VoiceModeMobile] Microphone access error:', error);
      });

    return () => {
      console.log('[VoiceModeMobile] Cleanup');
      try {
        recognition.stop();
      } catch (e) {
        console.log('[VoiceModeMobile] Recognition already stopped');
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onTranscript, onClose, onStopListening]);

  useEffect(() => {
    console.log('[VoiceModeMobile] Checking reset conditions:', {
      isSpeaking,
      isProcessing,
      hasRecognition: !!recognitionRef.current,
      isRestarting: isRestartingRef.current
    });

    if (!isSpeaking && !isProcessing && recognitionRef.current && !isRestartingRef.current) {
      console.log('[VoiceModeMobile] Response finished, resetting...');

      isProcessingTranscriptRef.current = false;
      hasSubmittedTranscriptRef.current = false;
      console.log('[VoiceModeMobile] Flags reset');
      isRestartingRef.current = true;

      setTimeout(() => {
        if (recognitionRef.current && !isListening && !isSpeaking && !isProcessing) {
          try {
            console.log('[VoiceModeMobile] Restarting recognition...');

            if (wavRecorderRef.current && mediaStreamRef.current) {
              wavRecorderRef.current.start(mediaStreamRef.current);
            }

            recognitionRef.current.start();
            console.log('[VoiceModeMobile] Recognition restarted');
            setIsListening(true);
          } catch (err: any) {
            console.error('[VoiceModeMobile] Error restarting:', err);
            isRestartingRef.current = false;
          }
        } else {
          console.log('[VoiceModeMobile] Skipping restart - conditions changed');
          isRestartingRef.current = false;
        }
      }, 1000);
    }
  }, [isSpeaking, isProcessing]);

  useEffect(() => {
    if (isProcessing && isListening) {
      console.log('[VoiceModeMobile] Processing started, stopping listening');
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('[VoiceModeMobile] Error stopping recognition:', err);
        }
      }
    }

    if (isSpeaking || isProcessing) {
      if (audioIntervalRef.current) {
        console.log('[VoiceModeMobile] Clearing audio interval during speech');
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        console.log('[VoiceModeMobile] Suspending audio context during speech');
        audioContextRef.current.suspend();
      }
    } else if (!isSpeaking && !isProcessing && audioContextRef.current && analyserRef.current) {
      if (audioContextRef.current.state === 'suspended') {
        console.log('[VoiceModeMobile] Resuming audio context');
        audioContextRef.current.resume();
      }

      if (!audioIntervalRef.current) {
        console.log('[VoiceModeMobile] Restarting audio interval');

        lastSoundTimeRef.current = Date.now();
        speechStartTimeRef.current = 0;

        const updateAudioLevel = () => {
          if (!analyserRef.current || !audioContextRef.current) return;

          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i] > 0) {
              sum += dataArray[i];
            }
          }

          const avgLevel = sum / dataArray.length;
          const weightedLevel = avgLevel * 1.5;
          const clampedLevel = Math.min(100, weightedLevel);

          const now = Date.now();
          if (Math.abs(micAudioLevelRef.current - clampedLevel) > 20 && (now - lastUpdateTimeRef.current) > 200) {
            micAudioLevelRef.current = clampedLevel;
            lastUpdateTimeRef.current = now;
            setMicAudioLevel(clampedLevel);
          } else {
            micAudioLevelRef.current = clampedLevel;
          }

          if (weightedLevel > 8) {
            lastSoundTimeRef.current = Date.now();
            if (speechStartTimeRef.current === 0) {
              speechStartTimeRef.current = Date.now();
            }
          }
        };

        audioIntervalRef.current = setInterval(updateAudioLevel, 350);
      }
    }
  }, [isProcessing, isListening, isSpeaking]);

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
    const ripples: Array<{ radius: number; opacity: number }> = [];
    let lastRippleTime = 0;
    let lastFrameTime = 0;
    const frameInterval = 1000 / 20;

    const animate = (timestamp: number) => {
      if (isSpeaking) {
        ctx.clearRect(0, 0, width, height);
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      if (timestamp - lastFrameTime < frameInterval) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = timestamp;

      ctx.clearRect(0, 0, width, height);

      const audioIntensity = isSpeaking
        ? Math.max(0.5, responseAudioLevelRef.current / 100)
        : isListening && micAudioLevel > 20
        ? Math.min(1, micAudioLevel / 100)
        : 0.3;

      const rippleInterval = isSpeaking
        ? 1000
        : isListening && micAudioLevel > 25
        ? Math.max(800, 1200 - (micAudioLevel * 2))
        : 2500;

      if (timestamp - lastRippleTime > rippleInterval && (isSpeaking || (isListening && micAudioLevel > 25))) {
        if (ripples.length < 1) {
          ripples.push({
            radius: 0,
            opacity: 0.35
          });
        }
        lastRippleTime = timestamp;
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];

        ripple.radius += 5 * audioIntensity;
        ripple.opacity -= 0.02;

        if (ripple.opacity <= 0 || ripple.radius > 180) {
          ripples.splice(i, 1);
          continue;
        }

        const activeColor = (isSpeaking || isListening);
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
  }, [isSpeaking, isListening, micAudioLevel, responseAudioLevelRef]);

  useEffect(() => {
    if (!heartRef.current) return;

    let animationFrame: number;
    let currentScale = 1;
    let targetScale = 1;
    let lastBeatTime = 0;
    let frameCount = 0;
    const frameSkip = 3;

    const animateBeat = (timestamp: number) => {
      if (!heartRef.current) return;

      if (isSpeaking) {
        if (heartRef.current.style.transform !== 'scale(1)') {
          heartRef.current.style.transform = 'scale(1)';
        }
        animationFrame = requestAnimationFrame(animateBeat);
        return;
      }

      frameCount++;
      if (frameCount % frameSkip !== 0) {
        animationFrame = requestAnimationFrame(animateBeat);
        return;
      }

      if (isSpeaking) {
        const intensity = Math.max(0.3, responseAudioLevelRef.current / 100);
        targetScale = 1 + intensity * 0.15;
        currentScale = currentScale * 0.7 + targetScale * 0.3;
        heartRef.current.style.transform = `scale(${currentScale})`;
      } else if (isListening && micAudioLevel > 15) {
        const intensity = Math.min(1, micAudioLevel / 80);
        const dynamicBeatInterval = 250 - (intensity * 80);

        if (timestamp - lastBeatTime > dynamicBeatInterval) {
          targetScale = 1.12 + intensity * 0.3;
          lastBeatTime = timestamp;
        } else if (timestamp - lastBeatTime > dynamicBeatInterval / 2) {
          targetScale = 1.0;
        }

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
  }, [isSpeaking, isListening, micAudioLevel, responseAudioLevelRef]);

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
          className="w-[200px] h-[200px] opacity-25 object-contain"
        />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
        <div className="relative mb-6">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />

          <div ref={heartRef} className="relative z-10 transition-transform duration-150 ease-out">
            <svg
              width="150"
              height="150"
              viewBox="0 0 200 200"
              className={`w-32 h-32 ${
                isSpeaking || isListening ? 'drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]' : 'drop-shadow-[0_0_10px_rgba(100,116,139,0.5)]'
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
              </defs>

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
            </svg>
          </div>
        </div>

        <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            {isSpeaking ? (
              <Volume2 className="w-6 h-6 text-emerald-400 animate-pulse" />
            ) : isProcessing ? (
              <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
            ) : isListening ? (
              <Mic className="w-6 h-6 text-cyan-400 animate-pulse" />
            ) : null}
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {isSpeaking ? 'Speaking' : isProcessing ? 'Processing' : isListening ? 'Listening' : 'Ready'}
            </h3>
          </div>

          <p className="text-gray-300 text-sm mb-6 text-center max-w-xs px-4">
            {isSpeaking
              ? 'Assistant is responding...'
              : isProcessing
              ? 'Thinking about your question...'
              : isListening
              ? 'Speak your question now'
              : 'Initializing...'}
          </p>

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
