import { useEffect, useState, useRef, useMemo } from 'react';
import { X, Mic, Brain, Volume2 } from 'lucide-react';
import { ErrorConsole } from './ErrorConsole';

interface VoiceModeProps {
  onClose: () => void;
  onTranscript: (transcript: string) => void;
  isProcessing: boolean;
  isSpeaking: boolean;
  responseAudioLevelRef: React.MutableRefObject<number>;
  onInterrupt: () => void;
  onStopListening: () => void;
}

export function VoiceMode({
  onClose,
  onTranscript,
  isProcessing,
  isSpeaking,
  responseAudioLevelRef,
  onInterrupt,
  onStopListening
}: VoiceModeProps) {
  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const micAudioLevelRef = useRef(0);
  const lastUpdateTime = useRef(0);
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
  }, []);
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const actualMimeTypeRef = useRef<string>('audio/webm;codecs=opus');
  const mobileSoundDetectedRef = useRef(false);
  const mobileLastSoundTimeRef = useRef(Date.now());
  const mobileSpeechStartTimeRef = useRef(0);
  const mobileLastUpdateTimeRef = useRef(Date.now());

  const backgroundSparks = useMemo(() => {
    const count = isMobile ? 1 : 4;
    return [...Array(count)].map((_, i) => ({
      key: `spark-${i}`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 5 + Math.random() * 3,
      delay: Math.random() * 2,
      sparkX: `${(Math.random() - 0.5) * 150}px`,
      sparkY: `${(Math.random() - 0.5) * 150}px`,
    }));
  }, [isMobile]);

  const backgroundEmbers = useMemo(() => {
    const count = isMobile ? 0 : 2;
    return [...Array(count)].map((_, i) => ({
      key: `ember-${i}`,
      left: `${20 + Math.random() * 60}%`,
      duration: 7 + Math.random() * 3,
      delay: Math.random() * 4,
      driftX: `${(Math.random() - 0.5) * 80}px`,
    }));
  }, [isMobile]);

  const backgroundHeartbeats = useMemo(() => {
    const count = isMobile ? 0 : 1;
    return [...Array(count)].map((_, i) => ({
      key: `heartbeat-${i}`,
      left: `${40 + i * 20}%`,
      top: `${45 + (i % 2) * 10}%`,
      delay: `${i * 3}s`,
    }));
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) {
      console.log('[VoiceMode] ==== INITIALIZING VOICE MODE ====');
      console.log('[VoiceMode] Checking for SpeechRecognition...');
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!isMobile) {
      console.log('[VoiceMode] SpeechRecognition available:', !!SpeechRecognition);
    }

    if (!SpeechRecognition) {
      console.error('[VoiceMode] ❌ Speech recognition NOT supported');
      alert('Speech recognition is not supported in this browser.');
      onClose();
      return;
    }

    if (!isMobile) console.log('[VoiceMode] Creating SpeechRecognition instance...');
    let recognition;
    try {
      recognition = new SpeechRecognition();
      if (!isMobile) console.log('[VoiceMode] ✓ SpeechRecognition instance created');
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

    if (!isMobile) {
      console.log('[VoiceMode] Recognition configured:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang
      });
    }

    recognition.onstart = () => {
      console.log('[VoiceMode] ✓ Recognition started successfully');
      setIsListening(true);

      if (mediaRecorderRef.current) {
        console.log('[VoiceMode] MediaRecorder state:', mediaRecorderRef.current.state);
        if (mediaRecorderRef.current.state === 'inactive') {
          try {
            const chunkSize = isMobile ? 200 : 100;
            mediaRecorderRef.current.start(chunkSize);
            console.log('[VoiceMode] ✅ MediaRecorder started with', chunkSize, 'ms chunks');

            if (isRestartingRef.current) {
              console.log('[VoiceMode] ✅ Restart complete, resetting flag');
              isRestartingRef.current = false;
            }
          } catch (e) {
            console.error('[VoiceMode] ❌ Failed to start MediaRecorder:', e);
          }
        } else {
          console.log('[VoiceMode] ⚠️ MediaRecorder already active, state:', mediaRecorderRef.current.state);
        }
      } else {
        console.error('[VoiceMode] ❌ MediaRecorder ref is null!');
      }

      if (isMobile && silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      if (isMobile) {
        console.log('[VoiceMode] 📱 Setting 8 second safety timeout on mobile');
        silenceTimerRef.current = setTimeout(() => {
          console.log('[VoiceMode] ⏰ Mobile safety timeout triggered - forcing MediaRecorder stop');
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          } else if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch (e) {
              console.error('[VoiceMode] Error stopping recognition on timeout:', e);
            }
          }
        }, 8000);
      }
    };

    recognition.onaudiostart = () => {
      if (!isMobile) console.log('[VoiceMode] 🎤 Audio capture started');
    };

    recognition.onsoundstart = () => {
      if (!isMobile) console.log('[VoiceMode] 🔊 Sound detected by recognition');
    };

    recognition.onspeechstart = () => {
      if (!isMobile) console.log('[VoiceMode] 🗣️ Speech detected by recognition');
    };

    recognition.onspeechend = () => {
      if (!isMobile) console.log('[VoiceMode] 🗣️ Speech ended');

      setTimeout(() => {
        console.log('[VoiceMode] Speech ended - stopping MediaRecorder to send to Whisper');

        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          console.log('[VoiceMode] MediaRecorder stopped, will send to Whisper');
        }

        try {
          recognition.stop();
        } catch (e) {
          console.error('[VoiceMode] Error stopping after speechend:', e);
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

      console.log('[VoiceMode] ✅ Got browser transcript (for display only):', fullTranscript);
      setTranscript(fullTranscript);
      lastTranscriptRef.current = fullTranscript;

      console.log('[VoiceMode] Browser transcript received - will wait for Whisper for accurate transcription');
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
      console.log('[VoiceMode] Recognition ended - waiting for Whisper transcription');
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      console.log('[VoiceMode] Browser recognition ended, Whisper will handle transcription');
    };

    const audioConstraints = isMobile
      ? {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000,
            channelCount: 1
          }
        }
      : {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 24000
          }
        };

    navigator.mediaDevices.getUserMedia(audioConstraints)
      .then((stream) => {
        console.log('[VoiceMode] ✓ Microphone permission granted');

        try {
          const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : 'audio/webm';

          actualMimeTypeRef.current = mimeType;
          console.log('[VoiceMode] Using audio format:', mimeType);

          const bitrate = isMobile ? 32000 : 64000;

          mediaRecorderRef.current = new MediaRecorder(stream, {
            mimeType,
            audioBitsPerSecond: bitrate
          });

          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
              if (isMobile && audioChunksRef.current.length > 150) {
                console.log('[VoiceMode] ⚠️ Mobile: Recording getting very long (>150 chunks)');
              }
            }
          };

          mediaRecorderRef.current.onstop = async () => {
            console.log('[VoiceMode] MediaRecorder stopped, total chunks:', audioChunksRef.current.length);

            if (isRestartingRef.current) {
              console.log('[VoiceMode] MediaRecorder stopped during restart - clearing chunks and skipping');
              audioChunksRef.current = [];
              return;
            }

            if (audioChunksRef.current.length > 0 && !isProcessingTranscriptRef.current && !hasSubmittedTranscriptRef.current) {
              console.log('[VoiceMode] 🔄 Sending audio to Whisper API for transcription');

              const actualMimeType = actualMimeTypeRef.current;
              const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
              console.log('[VoiceMode] Audio blob size:', audioBlob.size, 'bytes, format:', actualMimeType);
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
                let finalBlob = audioBlob;

                if (isMobile && audioBlob.size > 500000) {
                  console.log('[VoiceMode] Mobile: Large audio file, will send as-is but log warning');
                }

                const fileExtension = actualMimeType.includes('mp4') ? 'audio.mp4' :
                                     actualMimeType.includes('webm') ? 'audio.webm' : 'audio.wav';

                const formData = new FormData();
                formData.append('file', finalBlob, fileExtension);
                formData.append('model', 'whisper-large-v3');
                formData.append('language', 'en');

                console.log('[VoiceMode] FormData created, file size:', finalBlob.size);

                if (abortControllerRef.current) {
                  console.log('[VoiceMode] Aborting previous Whisper request');
                  abortControllerRef.current.abort();
                }

                abortControllerRef.current = new AbortController();
                const timeoutId = setTimeout(() => {
                  if (abortControllerRef.current) {
                    console.log('[VoiceMode] Whisper request timeout, aborting');
                    abortControllerRef.current.abort();
                  }
                }, isMobile ? 15000 : 20000);

                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

                const response = await fetch(`${supabaseUrl}/functions/v1/speech-to-text`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                  },
                  body: formData,
                  signal: abortControllerRef.current.signal
                });

                clearTimeout(timeoutId);
                abortControllerRef.current = null;

                if (response.ok) {
                  const result = await response.json();
                  const text = result.text?.trim();

                  if (text) {
                    console.log('[VoiceMode] ✅ Whisper transcript:', text);
                    lastTranscriptRef.current = text;
                    setTranscript(text);

                    if (!isProcessingTranscriptRef.current) {
                      isProcessingTranscriptRef.current = true;
                      hasSubmittedTranscriptRef.current = true;
                      setIsListening(false);
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
              } catch (err: any) {
                if (err.name === 'AbortError') {
                  console.log('[VoiceMode] Whisper request aborted (likely due to new request)');
                  return;
                }
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

        const sampleRate = isMobile ? 16000 : 24000;
        audioContextRef.current = new AudioContext({
          latencyHint: 'interactive',
          sampleRate
        });
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        analyserRef.current.fftSize = isMobile ? 64 : 256;
        analyserRef.current.maxDecibels = isMobile ? -15 : -10;
        analyserRef.current.smoothingTimeConstant = isMobile ? 0.5 : 0.7;
        analyserRef.current.minDecibels = -90;
        analyserRef.current.maxDecibels = -10;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        let soundDetected = false;
        let lastSoundTime = Date.now();
        let speechStartTime = 0;

        const updateAudioLevel = () => {
          if (!analyserRef.current || !audioContextRef.current) return;

          if (isMobile && (isProcessing || isSpeaking)) {
            return;
          }

          if (audioContextRef.current.state === 'suspended' && isMobile) {
            audioContextRef.current.resume();
          }

          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          let count = 0;

          if (isMobile) {
            for (let i = 1; i < 5; i++) {
              sum += dataArray[i];
              count++;
            }
          } else {
            for (let i = 2; i < 12; i++) {
              sum += dataArray[i];
              count++;
            }
          }

          const avgLevel = sum / count;
          const weightedLevel = avgLevel * (isMobile ? 1.3 : 1.5);
          const clampedLevel = Math.min(100, weightedLevel);

          const now = Date.now();
          const shouldUpdate = Math.abs(micAudioLevelRef.current - clampedLevel) > (isMobile ? 20 : 8) &&
                              (now - lastUpdateTime.current) > (isMobile ? 150 : 100);

          if (shouldUpdate) {
            micAudioLevelRef.current = clampedLevel;
            lastUpdateTime.current = now;
            setMicAudioLevel(clampedLevel);
          } else {
            micAudioLevelRef.current = clampedLevel;
          }

          if (!soundDetected && weightedLevel > 5) {
            soundDetected = true;
            if (!isMobile) console.log('[VoiceMode] �� Sound detected! Mic is working. Level:', weightedLevel);
          }

          if (weightedLevel > 8) {
            lastSoundTime = Date.now();
            if (speechStartTime === 0) {
              speechStartTime = Date.now();
              if (!isMobile) console.log('[VoiceMode] 🎙️ Speech started');
            }
          }

          const silenceDuration = Date.now() - lastSoundTime;
          const speechDuration = speechStartTime > 0 ? Date.now() - speechStartTime : 0;

          if (isMobile && audioContextRef.current && silenceDuration > 5000 && speechDuration === 0) {
            if (audioContextRef.current.state === 'running') {
              audioContextRef.current.suspend();
            }
          }

          const minSpeechDuration = isMobile ? 300 : 600;
          const minSilenceDuration = isMobile ? 500 : 1000;

          if (speechDuration > minSpeechDuration && silenceDuration > minSilenceDuration) {
            if (mediaRecorderRef.current?.state === 'recording') {
              if (!isMobile) {
                console.log('[VoiceMode] 🔇 Silence detected! Speech duration:', speechDuration, 'Silence duration:', silenceDuration);
                console.log('[VoiceMode] Stopping MediaRecorder for Whisper fallback');
              }
              speechStartTime = 0;
              mediaRecorderRef.current.stop();
            } else if (recognitionRef.current && !isProcessingTranscriptRef.current) {
              if (!isMobile) {
                console.log('[VoiceMode] 🔇 Silence detected but MediaRecorder not recording');
                console.log('[VoiceMode] Stopping recognition to trigger processing');
              }
              speechStartTime = 0;
              try {
                recognitionRef.current.stop();
              } catch (e) {
                console.error('[VoiceMode] Error stopping recognition:', e);
              }
            }
          }
        };

        if (isMobile) {
          audioIntervalRef.current = setInterval(updateAudioLevel, 350);
        } else {
          let frameCount = 0;
          const rafUpdate = () => {
            frameCount++;
            if (frameCount % 3 === 0) {
              updateAudioLevel();
            }
            requestAnimationFrame(rafUpdate);
          };
          rafUpdate();
        }

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
      console.log('[VoiceMode] Cleanup: Stopping recognition and closing audio');
      try {
        recognition.stop();
      } catch (e) {
        console.log('[VoiceMode] Recognition already stopped');
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.log('[VoiceMode] MediaRecorder already stopped');
        }
      }

      if (audioContextRef.current) {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().then(() => {
            console.log('[VoiceMode] AudioContext closed');
          }).catch((e) => {
            console.log('[VoiceMode] AudioContext close error:', e);
          });
        }
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }

      audioChunksRef.current = [];
    };
  }, [onTranscript, onClose, onStopListening]);

  useEffect(() => {
    if (!isSpeaking && !isProcessing && recognitionRef.current && !isListening && !isRestartingRef.current) {
      console.log('[VoiceMode] 🔄 Response finished, preparing to restart recognition...', {
        isSpeaking,
        isProcessing,
        isListening,
        isRestartingRef: isRestartingRef.current
      });

      hasSubmittedTranscriptRef.current = false;
      isProcessingTranscriptRef.current = false;
      lastTranscriptRef.current = '';
      isRestartingRef.current = true;

      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        console.log('[VoiceMode] Stopping MediaRecorder before restart');
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.error('[VoiceMode] Error stopping MediaRecorder:', e);
        }
      }

      setTimeout(() => {
        if (recognitionRef.current && !isListening && !isSpeaking && !isProcessing) {
          try {
            console.log('[VoiceMode] ✅ Attempting to restart recognition (MediaRecorder will auto-start in onstart)...');

            audioChunksRef.current = [];

            recognitionRef.current.start();
            console.log('[VoiceMode] ✅ Recognition restart called, waiting for onstart handler');

            setIsListening(true);
          } catch (err: any) {
            console.error('[VoiceMode] ❌ Error restarting recognition:', err);
            isRestartingRef.current = false;
          }
        } else {
          console.log('[VoiceMode] ⚠️ Skipping restart - conditions changed', {
            hasRecognition: !!recognitionRef.current,
            isListening,
            isSpeaking,
            isProcessing
          });
          isRestartingRef.current = false;
        }
      }, isMobile ? 500 : 800);
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

    if (isMobile && isSpeaking) {
      if (audioIntervalRef.current) {
        console.log('[VoiceMode] 📱 Clearing audio interval during speech on mobile');
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        console.log('[VoiceMode] 📱 Suspending audio context during speech on mobile');
        audioContextRef.current.suspend();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        console.log('[VoiceMode] 📱 Stopping MediaRecorder since AI is speaking');
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.error('[VoiceMode] Error stopping MediaRecorder during AI speech:', e);
        }
      }
    } else if (isMobile && !isSpeaking && !isProcessing && audioContextRef.current && analyserRef.current) {
      if (audioContextRef.current.state === 'suspended') {
        console.log('[VoiceMode] 📱 Resuming audio context on mobile');
        audioContextRef.current.resume();
      }

      if (!audioIntervalRef.current) {
        console.log('[VoiceMode] 📱 Restarting audio interval on mobile');

        mobileLastSoundTimeRef.current = Date.now();
        mobileSpeechStartTimeRef.current = 0;

        const updateAudioLevel = () => {
          if (!analyserRef.current || !audioContextRef.current) return;

          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          let count = 0;
          for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i] > 0) {
              sum += dataArray[i];
              count++;
            }
          }

          const avgLevel = sum / count;
          const weightedLevel = avgLevel * 1.3;
          const clampedLevel = Math.min(100, weightedLevel);

          const now = Date.now();
          const shouldUpdate = Math.abs(micAudioLevelRef.current - clampedLevel) > 20 &&
                              (now - mobileLastUpdateTimeRef.current) > 150;

          if (shouldUpdate) {
            micAudioLevelRef.current = clampedLevel;
            mobileLastUpdateTimeRef.current = now;
            setMicAudioLevel(clampedLevel);
          } else {
            micAudioLevelRef.current = clampedLevel;
          }

          if (!mobileSoundDetectedRef.current && weightedLevel > 5) {
            mobileSoundDetectedRef.current = true;
          }

          if (weightedLevel > 8) {
            mobileLastSoundTimeRef.current = Date.now();
            if (mobileSpeechStartTimeRef.current === 0) {
              mobileSpeechStartTimeRef.current = Date.now();
            }
          }

          const silenceDuration = Date.now() - mobileLastSoundTimeRef.current;
          const speechDuration = mobileSpeechStartTimeRef.current > 0 ? Date.now() - mobileSpeechStartTimeRef.current : 0;

          if (audioContextRef.current && silenceDuration > 5000 && speechDuration === 0) {
            if (audioContextRef.current.state === 'running') {
              audioContextRef.current.suspend();
            }
          }

          const minSpeechDuration = 300;
          const minSilenceDuration = 500;

          if (speechDuration > minSpeechDuration && silenceDuration > minSilenceDuration) {
            if (mediaRecorderRef.current?.state === 'recording') {
              mobileSpeechStartTimeRef.current = 0;
              mediaRecorderRef.current.stop();
            } else if (recognitionRef.current && !isProcessingTranscriptRef.current) {
              mobileSpeechStartTimeRef.current = 0;
              try {
                recognitionRef.current.stop();
              } catch (e) {
                console.error('[VoiceMode] Error stopping recognition:', e);
              }
            }
          }
        };

        audioIntervalRef.current = setInterval(updateAudioLevel, 350);
      }
    }
  }, [isProcessing, isListening, isSpeaking, isMobile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
      willReadFrequently: false
    });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    let animationFrame: number;
    let lastRippleTime = 0;
    let lastFrameTime = 0;
    const ripples: Array<{ radius: number; opacity: number; maxRadius: number }> = [];
    const targetFPS = isMobile ? 20 : 30;
    const frameInterval = 1000 / targetFPS;
    const maxRipples = isMobile ? 1 : 3;

    const animate = (timestamp: number) => {
      if (isMobile && isSpeaking) {
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

      const audioIntensity = isSpeaking ? Math.max(0.5, responseAudioLevelRef.current / 100) : isListening && micAudioLevel > 20 ? Math.min(1, micAudioLevel / 100) : 0.3;
      const rippleInterval = isSpeaking ? 1000 : isListening && micAudioLevel > 25 ? Math.max(800, 1200 - (micAudioLevel * 2)) : 2500;

      if (timestamp - lastRippleTime > rippleInterval && (isSpeaking || (isListening && micAudioLevel > 25))) {
        if (ripples.length < maxRipples) {
          ripples.push({
            radius: 0,
            opacity: isMobile ? 0.35 : 0.45,
            maxRadius: isMobile ? 180 : 250
          });
        }
        lastRippleTime = timestamp;
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];

        ripple.radius += isMobile ? 5 : 2.5 * audioIntensity;
        ripple.opacity -= isMobile ? 0.02 : 0.008;

        if (ripple.opacity <= 0 || ripple.radius > ripple.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        const activeColor = (isSpeaking || isListening);
        ctx.strokeStyle = activeColor
          ? `rgba(16, 185, 129, ${ripple.opacity * 0.4})`
          : `rgba(156, 163, 175, ${ripple.opacity * 0.25})`;
        ctx.lineWidth = isMobile ? 1 : 1.5;
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
  }, [isSpeaking, isListening, micAudioLevel, isMobile, responseAudioLevelRef]);

  useEffect(() => {
    if (!heartRef.current) return;

    let animationFrame: number;
    let lastBeatTime = 0;
    let currentScale = 1;
    let targetScale = 1;
    let frameCount = 0;
    const frameSkip = isMobile ? 3 : 2;

    const animateBeat = (timestamp: number) => {
      if (!heartRef.current) return;

      if (isMobile && isSpeaking) {
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
  }, [isSpeaking, isListening, micAudioLevel, isMobile, responseAudioLevelRef]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-cyan-500/8 to-emerald-500/8"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent"></div>

      <div className="absolute inset-0 hidden sm:block">
        <div className="absolute top-20 left-10 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/20 to-emerald-600/8 rounded-full filter blur-[100px] animate-float" style={{ animationDelay: '0s', transform: 'translateZ(0)', willChange: 'transform' }}></div>
        <div className="absolute top-40 right-10 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/20 to-cyan-600/8 rounded-full filter blur-[100px] animate-float-reverse" style={{ animationDelay: '1s', transform: 'translateZ(0)', willChange: 'transform' }}></div>
      </div>

      <div className="absolute inset-0 sm:hidden">
        <div className="absolute top-20 left-5 w-[200px] h-[200px] bg-gradient-to-br from-emerald-500/8 to-emerald-600/2 rounded-full filter blur-[20px]" style={{ transform: 'translateZ(0)' }}></div>
        <div className="absolute top-40 right-5 w-[200px] h-[200px] bg-gradient-to-br from-cyan-500/8 to-cyan-600/2 rounded-full filter blur-[20px]" style={{ transform: 'translateZ(0)' }}></div>
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
            width={isMobile ? 400 : 600}
            height={isMobile ? 400 : 600}
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
                  <feGaussianBlur stdDeviation={isMobile ? "1" : "3"} result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {false && isSpeaking && !isMobile && (
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
