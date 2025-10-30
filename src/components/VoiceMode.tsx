import { useEffect, useState, useRef, useMemo } from 'react';
import { X, Mic, Brain, Volume2 } from 'lucide-react';
import { ErrorConsole } from './ErrorConsole';

interface VoiceModeProps {
  onClose: () => void;
  onTranscript: (transcript: string) => void;
  isProcessing: boolean;
  isSpeaking: boolean;
  responseAudioLevel: number;
  onInterrupt: () => void;
  onStopListening: () => void;
}

export function VoiceMode({
  onClose,
  onTranscript,
  isProcessing,
  isSpeaking,
  responseAudioLevel,
  onInterrupt,
  onStopListening
}: VoiceModeProps) {
  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const isProcessingTranscriptRef = useRef(false);
  const hasSubmittedTranscriptRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef('');
  const isRestartingRef = useRef(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const backgroundSparks = useMemo(() => {
    return [...Array(6)].map((_, i) => ({
      key: `spark-${i}`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 3,
      sparkX: `${(Math.random() - 0.5) * 200}px`,
      sparkY: `${(Math.random() - 0.5) * 200}px`,
    }));
  }, []);

  const backgroundEmbers = useMemo(() => {
    return [...Array(3)].map((_, i) => ({
      key: `ember-${i}`,
      left: `${15 + Math.random() * 70}%`,
      duration: 6 + Math.random() * 4,
      delay: Math.random() * 5,
      driftX: `${(Math.random() - 0.5) * 100}px`,
    }));
  }, []);

  const backgroundHeartbeats = useMemo(() => {
    return [...Array(2)].map((_, i) => ({
      key: `heartbeat-${i}`,
      left: `${25 + i * 50}%`,
      top: `${40 + (i % 2) * 20}%`,
      delay: `${i * 2}s`,
    }));
  }, []);

  useEffect(() => {
    console.log('[VoiceMode] ==== INITIALIZING VOICE MODE ====');
    console.log('[VoiceMode] Checking for SpeechRecognition...');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    console.log('[VoiceMode] SpeechRecognition available:', !!SpeechRecognition);

    if (!SpeechRecognition) {
      console.error('[VoiceMode] ❌ Speech recognition NOT supported');
      alert('Speech recognition is not supported in this browser.');
      onClose();
      return;
    }

    console.log('[VoiceMode] Creating SpeechRecognition instance...');
    let recognition;
    try {
      recognition = new SpeechRecognition();
      console.log('[VoiceMode] ✓ SpeechRecognition instance created');
    } catch (error) {
      console.error('[VoiceMode] ❌ Failed to create SpeechRecognition:', error);
      alert('Failed to initialize speech recognition');
      onClose();
      return;
    }
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    console.log('[VoiceMode] Recognition configured:', {
      continuous: recognition.continuous,
      interimResults: recognition.interimResults,
      lang: recognition.lang
    });

    recognition.onstart = () => {
      console.log('[VoiceMode] ✓ Recognition started successfully');
      setIsListening(true);

      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        audioChunksRef.current = [];
        mediaRecorderRef.current.start(100);
        console.log('[VoiceMode] MediaRecorder started');
      }
    };

    recognition.onaudiostart = () => {
      console.log('[VoiceMode] 🎤 Audio capture started');
    };

    recognition.onsoundstart = () => {
      console.log('[VoiceMode] 🔊 Sound detected by recognition');
    };

    recognition.onspeechstart = () => {
      console.log('[VoiceMode] 🗣️ Speech detected by recognition');
    };

    recognition.onspeechend = () => {
      console.log('[VoiceMode] 🗣️ Speech ended');

      setTimeout(() => {
        if (!lastTranscriptRef.current.trim()) {
          console.log('[VoiceMode] ⚠️ Speech ended but no transcript captured - Chrome bug detected');
          console.log('[VoiceMode] Stopping MediaRecorder and will try Whisper fallback');

          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            console.log('[VoiceMode] MediaRecorder stopped for fallback');
          }

          try {
            recognition.stop();
          } catch (e) {
            console.error('[VoiceMode] Error stopping after speechend:', e);
          }
        }
      }, 100);
    };

    recognition.onresult = (event: any) => {
      console.log('[VoiceMode] ✅ onresult FIRED!', event);
      console.log('[VoiceMode] event.results:', event.results);
      console.log('[VoiceMode] event.results.length:', event.results.length);

      if (isProcessingTranscriptRef.current || hasSubmittedTranscriptRef.current) {
        console.log('[VoiceMode] Ignoring result - already processing');
        return;
      }

      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        console.log(`[VoiceMode] Result ${i}:`, result[0].transcript, 'confidence:', result[0].confidence);
        fullTranscript += result[0].transcript;
      }

      console.log('[VoiceMode] ✅ Got transcript:', fullTranscript);
      setTranscript(fullTranscript);
      lastTranscriptRef.current = fullTranscript;

      if (fullTranscript.trim()) {
        console.log('[VoiceMode] Submitting transcript immediately');
        isProcessingTranscriptRef.current = true;
        hasSubmittedTranscriptRef.current = true;
        recognition.stop();
        onTranscript(fullTranscript);
        setTranscript('');
      }
    };

    recognition.onerror = (event: any) => {
      console.log('[VoiceMode] ❌ Recognition error:', event.error);
      if (event.error === 'no-speech') {
        console.log('[VoiceMode] No speech detected - will restart');
      }
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      console.log('[VoiceMode] Recognition ended');
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      const shouldSubmit = lastTranscriptRef.current.trim() && !isProcessingTranscriptRef.current && !hasSubmittedTranscriptRef.current;

      if (shouldSubmit) {
        console.log('[VoiceMode] Submitting transcript:', lastTranscriptRef.current);
        isProcessingTranscriptRef.current = true;
        hasSubmittedTranscriptRef.current = true;
        onTranscript(lastTranscriptRef.current);
        setTranscript('');
        lastTranscriptRef.current = '';
      } else if (!isProcessingTranscriptRef.current) {
        console.log('[VoiceMode] No transcript to submit, restarting recognition in 500ms');
        setTimeout(() => {
          if (recognitionRef.current && !isProcessingTranscriptRef.current) {
            try {
              recognitionRef.current.start();
              console.log('[VoiceMode] Recognition restarted');
            } catch (err) {
              console.error('[VoiceMode] Error restarting recognition:', err);
            }
          }
        }, 500);
      }
    };

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        console.log('[VoiceMode] ✓ Microphone permission granted');

        try {
          mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
              console.log('[VoiceMode] Audio chunk recorded:', event.data.size, 'bytes');
            }
          };

          mediaRecorderRef.current.onstop = async () => {
            console.log('[VoiceMode] MediaRecorder stopped, total chunks:', audioChunksRef.current.length);

            if (audioChunksRef.current.length > 0 && !lastTranscriptRef.current.trim()) {
              console.log('[VoiceMode] 🔄 Fallback: Sending audio to Whisper API');

              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
              console.log('[VoiceMode] Audio blob size:', audioBlob.size, 'bytes');
              audioChunksRef.current = [];

              if (audioBlob.size < 100) {
                console.log('[VoiceMode] Audio blob too small, skipping Whisper');
                setTimeout(() => {
                  if (recognitionRef.current && !isProcessingTranscriptRef.current) {
                    try {
                      recognitionRef.current.start();
                    } catch (e) {
                      console.log('[VoiceMode] Recognition already running');
                    }
                  }
                }, 500);
                return;
              }

              try {
                const formData = new FormData();
                formData.append('file', audioBlob, 'audio.webm');
                formData.append('model', 'whisper-large-v3');
                formData.append('language', 'en');

                console.log('[VoiceMode] FormData created, file size:', audioBlob.size);

                const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
                  },
                  body: formData
                });

                if (response.ok) {
                  const result = await response.json();
                  const text = result.text?.trim();

                  if (text) {
                    console.log('[VoiceMode] ✅ Whisper fallback transcript:', text);
                    lastTranscriptRef.current = text;
                    setTranscript(text);

                    if (!isProcessingTranscriptRef.current) {
                      isProcessingTranscriptRef.current = true;
                      hasSubmittedTranscriptRef.current = true;
                      onTranscript(text);
                      setTranscript('');
                      lastTranscriptRef.current = '';
                    }
                  } else {
                    console.log('[VoiceMode] Whisper returned empty transcript');
                    setTimeout(() => {
                      if (recognitionRef.current && !isProcessingTranscriptRef.current) {
                        try {
                          recognitionRef.current.start();
                        } catch (e) {
                          console.log('[VoiceMode] Recognition already running, skipping restart');
                        }
                      }
                    }, 500);
                  }
                } else {
                  console.error('[VoiceMode] Whisper API error:', response.status);
                  const errorText = await response.text();
                  console.error('[VoiceMode] Whisper error details:', errorText);
                  setTimeout(() => {
                    if (recognitionRef.current && !isProcessingTranscriptRef.current) {
                      try {
                        recognitionRef.current.start();
                      } catch (e) {
                        console.log('[VoiceMode] Recognition already running, skipping restart');
                      }
                    }
                  }, 500);
                }
              } catch (err) {
                console.error('[VoiceMode] Whisper fallback error:', err);
                setTimeout(() => {
                  if (recognitionRef.current && !isProcessingTranscriptRef.current) {
                    try {
                      recognitionRef.current.start();
                    } catch (e) {
                      console.log('[VoiceMode] Recognition already running, skipping restart');
                    }
                  }
                }, 500);
              }
            } else {
              audioChunksRef.current = [];
            }
          };

          console.log('[VoiceMode] MediaRecorder initialized');
        } catch (err) {
          console.error('[VoiceMode] Failed to initialize MediaRecorder:', err);
        }

        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 512;
        analyserRef.current.smoothingTimeConstant = 0.6;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        let soundDetected = false;
        let lastSoundTime = Date.now();
        let speechStartTime = 0;
        const updateAudioLevel = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          const lowFreqData = dataArray.slice(0, 40);
          const midFreqData = dataArray.slice(40, 120);

          const lowAvg = lowFreqData.reduce((a, b) => a + b, 0) / lowFreqData.length;
          const midAvg = midFreqData.reduce((a, b) => a + b, 0) / midFreqData.length;

          const weightedLevel = (lowAvg * 0.7 + midAvg * 0.3) * 2.5;
          setMicAudioLevel(weightedLevel);

          if (!soundDetected && weightedLevel > 5) {
            soundDetected = true;
            console.log('[VoiceMode] 🎤 Sound detected! Mic is working. Level:', weightedLevel);
          }

          if (weightedLevel > 8) {
            lastSoundTime = Date.now();
            if (speechStartTime === 0) {
              speechStartTime = Date.now();
              console.log('[VoiceMode] 🎙️ Speech started');
            }
          }

          const silenceDuration = Date.now() - lastSoundTime;
          const speechDuration = speechStartTime > 0 ? Date.now() - speechStartTime : 0;

          if (speechDuration > 1000 && silenceDuration > 1500 && mediaRecorderRef.current?.state === 'recording') {
            console.log('[VoiceMode] 🔇 Silence detected! Speech duration:', speechDuration, 'Silence duration:', silenceDuration);
            console.log('[VoiceMode] Stopping MediaRecorder for Whisper fallback');
            speechStartTime = 0;
            if (mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop();
            }
          }

          requestAnimationFrame(updateAudioLevel);
        };
        updateAudioLevel();

        console.log('[VoiceMode] Attempting to start recognition...');
        try {
          recognition.start();
          console.log('[VoiceMode] recognition.start() called successfully');
          setIsListening(true);
        } catch (error) {
          console.error('[VoiceMode] ❌ Error calling recognition.start():', error);
        }
      })
      .catch((error) => {
        console.error('[VoiceMode] ❌ Microphone access denied or error:', error);
        console.error('[VoiceMode] getUserMedia error type:', error instanceof DOMException ? 'DOMException' : typeof error);
        console.error('[VoiceMode] getUserMedia error name:', (error as any)?.name);
        console.error('[VoiceMode] getUserMedia error message:', (error as any)?.message);
      });

    return () => {
      recognition.stop();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [onTranscript, onClose, onStopListening]);

  useEffect(() => {
    if (!isSpeaking && !isProcessing && recognitionRef.current && !isListening) {
      console.log('[VoiceMode] Response finished, restarting recognition...');
      hasSubmittedTranscriptRef.current = false;
      isProcessingTranscriptRef.current = false;
      lastTranscriptRef.current = '';

      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
            setIsListening(true);
            console.log('[VoiceMode] Recognition restarted after response');
          } catch (err: any) {
            console.error('[VoiceMode] Error restarting:', err);
          }
        }
      }, 300);
    }
  }, [isSpeaking, isProcessing, isListening]);

  useEffect(() => {
    if (isProcessing && isListening) {
      console.log('[VoiceMode] Processing started, stopping listening');
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('[VoiceMode] Error stopping recognition:', err);
        }
      }
    }
  }, [isProcessing, isListening]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    let animationFrame: number;
    let lastRippleTime = 0;
    const ripples: Array<{ radius: number; opacity: number; maxRadius: number }> = [];

    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, width, height);

      const audioIntensity = isSpeaking ? Math.max(0.5, responseAudioLevel / 100) : isListening && micAudioLevel > 15 ? Math.min(1, micAudioLevel / 100) : 0.3;
      const rippleInterval = isSpeaking ? 400 : isListening && micAudioLevel > 15 ? Math.max(200, 600 - (micAudioLevel * 3)) : 1800;

      if (timestamp - lastRippleTime > rippleInterval && (isSpeaking || (isListening && micAudioLevel > 15))) {
        ripples.push({
          radius: 0,
          opacity: 0.5,
          maxRadius: 250
        });
        lastRippleTime = timestamp;
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];

        ripple.radius += 1.5 * audioIntensity;
        ripple.opacity -= 0.004;

        if (ripple.opacity <= 0 || ripple.radius > ripple.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        const gradient = ctx.createRadialGradient(
          centerX, centerY, Math.max(0, ripple.radius - 1),
          centerX, centerY, Math.max(1, ripple.radius + 1)
        );

        if (isSpeaking || isListening) {
          gradient.addColorStop(0, `rgba(16, 185, 129, ${ripple.opacity * 0.5})`);
          gradient.addColorStop(0.5, `rgba(6, 182, 212, ${ripple.opacity * 0.6})`);
          gradient.addColorStop(1, `rgba(16, 185, 129, ${ripple.opacity * 0.3})`);
        } else {
          gradient.addColorStop(0, `rgba(156, 163, 175, ${ripple.opacity * 0.3})`);
          gradient.addColorStop(1, `rgba(107, 114, 128, ${ripple.opacity * 0.15})`);
        }

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
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
  }, [isSpeaking, isListening, responseAudioLevel, micAudioLevel]);

  useEffect(() => {
    if (!heartRef.current) return;

    let animationFrame: number;
    let lastBeatTime = 0;
    let currentScale = 1;
    let targetScale = 1;

    const animateBeat = (timestamp: number) => {
      if (!heartRef.current) return;

      if (isSpeaking) {
        const intensity = Math.max(0.3, responseAudioLevel / 100);
        targetScale = 1 + intensity * 0.2;
        currentScale = currentScale * 0.8 + targetScale * 0.2;
        heartRef.current.style.transform = `scale(${currentScale})`;
      } else if (isListening && micAudioLevel > 15) {
        const intensity = Math.min(1, micAudioLevel / 80);
        const dynamicBeatInterval = 200 - (intensity * 80);

        if (timestamp - lastBeatTime > dynamicBeatInterval) {
          targetScale = 1.15 + intensity * 0.4;
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
  }, [isSpeaking, isListening, responseAudioLevel, micAudioLevel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-cyan-500/8 to-emerald-500/8"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent"></div>

      <div className="absolute inset-0 hidden sm:block">
        <div className="absolute top-20 left-10 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/20 to-emerald-600/8 rounded-full filter blur-[100px] animate-float" style={{ animationDelay: '0s', transform: 'translateZ(0)', willChange: 'transform' }}></div>
        <div className="absolute top-40 right-10 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/20 to-cyan-600/8 rounded-full filter blur-[100px] animate-float-reverse" style={{ animationDelay: '1s', transform: 'translateZ(0)', willChange: 'transform' }}></div>
      </div>

      <div className="absolute inset-0 sm:hidden">
        <div className="absolute top-20 left-5 w-[300px] h-[300px] bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 rounded-full filter blur-[60px]" style={{ animationDelay: '0s', transform: 'translateZ(0)' }}></div>
        <div className="absolute top-40 right-5 w-[300px] h-[300px] bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 rounded-full filter blur-[60px]" style={{ animationDelay: '1s', transform: 'translateZ(0)' }}></div>
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
              transform: 'translateZ(0)',
            } as any}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {backgroundEmbers.map((ember) => (
          <div
            key={ember.key}
            className="absolute w-1 h-1 rounded-full bg-gradient-to-t from-emerald-400 to-cyan-400 shadow-[0_0_6px_rgba(16,185,129,0.9)]"
            style={{
              left: ember.left,
              bottom: '10%',
              animation: `ember-drift ${ember.duration}s linear ${ember.delay}s infinite`,
              '--drift-x': ember.driftX,
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
            } as any}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {backgroundHeartbeats.map((heartbeat) => (
          <div
            key={heartbeat.key}
            className="absolute w-3 h-3 rounded-full bg-emerald-400/30 blur-sm animate-heartbeat-pulse"
            style={{
              left: heartbeat.left,
              top: heartbeat.top,
              animationDelay: heartbeat.delay,
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
            }}
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

      {isListening && transcript && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('[VoiceMode] Manual submit button clicked');
            if (transcript.trim()) {
              isProcessingTranscriptRef.current = true;
              hasSubmittedTranscriptRef.current = true;
              if (recognitionRef.current) {
                recognitionRef.current.stop();
              }
              onTranscript(transcript);
              setTranscript('');
            }
          }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white z-50 pointer-events-auto bg-emerald-600 hover:bg-emerald-500 rounded-full px-6 py-3 font-medium transition-colors shadow-lg"
        >
          Submit
        </button>
      )}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]">
        <img
          src="/Hello-World-earth.svg"
          alt="Earth"
          className="w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] opacity-25 object-contain"
        />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
        <div className="relative mb-6 sm:mb-8">
          <canvas
            ref={canvasRef}
            width={700}
            height={700}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-75 sm:scale-90 md:scale-100"
            style={{ transform: 'translate(-50%, -50%) translateZ(0)', willChange: 'contents' }}
          />

          <div
            ref={heartRef}
            className="relative z-10 transition-transform duration-150 ease-out"
          >
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              className={`w-32 h-32 sm:w-40 sm:h-40 md:w-[200px] md:h-[200px] ${
                isSpeaking || isListening ? 'drop-shadow-[0_0_20px_rgba(16,185,129,0.8)] sm:drop-shadow-[0_0_30px_rgba(16,185,129,0.9)] md:drop-shadow-[0_0_40px_rgba(16,185,129,1)]' : 'drop-shadow-[0_0_10px_rgba(100,116,139,0.5)] sm:drop-shadow-[0_0_15px_rgba(100,116,139,0.6)] md:drop-shadow-[0_0_20px_rgba(100,116,139,0.6)]'
              }`}
            >
              <defs>
                <linearGradient id="voiceHeartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="75%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
                <radialGradient id="voiceHeartGlow" cx="50%" cy="45%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                  <stop offset="20%" stopColor="#d1fae5" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                </radialGradient>
                <filter id="voiceHeartFilter">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {isSpeaking && (
                <>
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
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    opacity="0.6"
                    className="animate-[scale-out_1.5s_ease-out_infinite]"
                    style={{ transformOrigin: '100px 100px' }}
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
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2"
                    opacity="0.4"
                    className="animate-[scale-out_2s_ease-out_infinite_0.5s]"
                    style={{ transformOrigin: '100px 100px' }}
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
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2"
                    opacity="0.3"
                    className="animate-[scale-out_2.5s_ease-out_infinite_1s]"
                    style={{ transformOrigin: '100px 100px' }}
                  />
                </>
              )}

              <g filter="url(#voiceHeartFilter)">
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
                  fill="url(#voiceHeartGrad)"
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
                  fill="url(#voiceHeartGlow)"
                />
              </g>
            </svg>
          </div>
        </div>

        <div className="absolute bottom-8 sm:bottom-12 md:bottom-16 left-0 right-0 flex flex-col items-center">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
          {isSpeaking ? (
            <Volume2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-emerald-400 animate-pulse" />
          ) : isProcessing ? (
            <Brain className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-400 animate-pulse" />
          ) : isListening ? (
            <Mic className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-cyan-400 animate-pulse" />
          ) : null}
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            {isSpeaking ? 'Speaking' : isProcessing ? 'Processing' : isListening ? 'Listening' : 'Ready'}
          </h3>
        </div>

        <p className="text-gray-300 text-sm sm:text-base mb-6 sm:mb-8 md:mb-10 text-center max-w-xs sm:max-w-sm">
          {isSpeaking ? 'Assistant is responding...' : isProcessing ? 'Thinking about your question...' : isListening ? 'Speak your question now' : 'Initializing...'}
        </p>

        {isSpeaking && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInterrupt();
            }}
            className="px-8 py-3 sm:px-9 sm:py-3.5 md:px-10 md:py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm sm:text-base md:text-base font-bold rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all duration-200 active:scale-95 pointer-events-auto z-50"
          >
            Stop Speaking
          </button>
        )}

        </div>
      </div>

      <ErrorConsole
        isOpen={isConsoleOpen}
        onToggle={() => setIsConsoleOpen(!isConsoleOpen)}
      />
    </div>
  );
}
