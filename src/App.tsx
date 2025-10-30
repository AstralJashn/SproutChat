import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Send, Heart, Camera, Package, Compass, CloudRain, Flame, Waves, Zap, Wind, Mountain, AlertTriangle, Sprout } from 'lucide-react';
import { supabase } from './lib/supabase';
import { NavigationMap } from './components/NavigationMap';
import { VoiceMode } from './components/VoiceMode';
import { CameraCapture } from './components/CameraCapture';
import { PackingList } from './components/PackingList';
import { SituationalGuide } from './components/SituationalGuide';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thinking?: boolean;
  imageData?: string;
  navigationData?: {
    from: string;
    to: string;
    mode: 'driving' | 'walking' | 'cycling';
  };
}

function formatMessage(text: string): string {
  let formatted = text;

  // Add contextual emojis to headers based on content
  formatted = formatted.replace(/^# (.+)$/gm, (match, title) => {
    const lowerTitle = title.toLowerCase();
    let emoji = '';

    // Match emojis to content
    if (lowerTitle.includes('shelter') || lowerTitle.includes('debris hut') || lowerTitle.includes('lean-to')) {
      emoji = '🏕️ ';
    } else if (lowerTitle.includes('fire') || lowerTitle.includes('tinder')) {
      emoji = '🔥 ';
    } else if (lowerTitle.includes('water') || lowerTitle.includes('purif')) {
      emoji = '💧 ';
    } else if (lowerTitle.includes('navigat') || lowerTitle.includes('compass')) {
      emoji = '🧭 ';
    } else if (lowerTitle.includes('first aid') || lowerTitle.includes('wound') || lowerTitle.includes('medical')) {
      emoji = '⚕️ ';
    } else if (lowerTitle.includes('weather') || lowerTitle.includes('storm')) {
      emoji = '⛈️ ';
    } else if (lowerTitle.includes('snow') || lowerTitle.includes('ice')) {
      emoji = '❄️ ';
    } else if (lowerTitle.includes('fish')) {
      emoji = '🎣 ';
    } else if (lowerTitle.includes('signal') || lowerTitle.includes('rescue')) {
      emoji = '🆘 ';
    } else if (lowerTitle.includes('bear') || lowerTitle.includes('wildlife') || lowerTitle.includes('animal')) {
      emoji = '🐻 ';
    } else if (lowerTitle.includes('snake')) {
      emoji = '🐍 ';
    } else if (lowerTitle.includes('plant') || lowerTitle.includes('edible')) {
      emoji = '🌿 ';
    } else if (lowerTitle.includes('ethic') || lowerTitle.includes('trace')) {
      emoji = '🌲 ';
    }

    return `<h2 class="text-xl font-bold text-white mb-4 mt-2">${emoji}${title}</h2>`;
  });

  // Convert **bold** to <strong>
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');

  // Split by double line breaks for sections
  const sections = formatted.split('\n\n');
  formatted = sections.map(section => {
    // Skip if this is a header (already converted)
    if (section.trim().startsWith('<h2')) {
      return section;
    }

    // Check if section has bullet points
    if (section.includes('\n•') || section.trim().startsWith('•')) {
      const lines = section.split('\n');
      const listItems = lines.map(line => {
        if (line.trim().startsWith('•')) {
          return `<li class="text-slate-50 leading-relaxed mb-1">${line.trim().substring(1).trim()}</li>`;
        } else if (line.trim()) {
          return `<div class="mb-2 mt-3 text-emerald-400 font-semibold text-sm">${line}</div>`;
        }
        return '';
      }).filter(l => l).join('');
      return `<ul class="list-disc list-inside ml-2 space-y-1 mb-4">${listItems}</ul>`;
    } else if (section.includes('\n') && section.match(/^\d+\./m)) {
      // Numbered lists
      const lines = section.split('\n');
      const listItems = lines.map(line => {
        if (line.trim().match(/^\d+\./)) {
          return `<li class="text-slate-50 leading-relaxed mb-1">${line.trim().replace(/^\d+\.\s*/, '')}</li>`;
        } else if (line.trim()) {
          return `<div class="mb-1 text-emerald-400 font-semibold text-sm">${line}</div>`;
        }
        return '';
      }).filter(l => l).join('');
      return `<ol class="list-decimal list-inside ml-2 space-y-1 mb-4">${listItems}</ol>`;
    } else if (section.trim()) {
      // Regular paragraph
      return `<p class="mb-4 text-white leading-relaxed">${section.trim()}</p>`;
    }
    return '';
  }).filter(s => s).join('');

  return formatted;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [activeNavigation, setActiveNavigation] = useState<{
    from: string;
    to: string;
    mode: 'driving' | 'walking' | 'cycling';
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [responseAudioLevel, setResponseAudioLevel] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const isSpeakingRef = useRef(false);
  const isMountedRef = useRef(true);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isPackingListOpen, setIsPackingListOpen] = useState(false);
  const [isSituationalGuideOpen, setIsSituationalGuideOpen] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const backgroundSparks = useMemo(() => {
    const count = isMobile ? 6 : 12;
    return [...Array(count)].map((_, i) => ({
      key: `spark-${i}`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 3,
      sparkX: `${(Math.random() - 0.5) * 200}px`,
      sparkY: `${(Math.random() - 0.5) * 200}px`,
    }));
  }, [isMobile]);

  const backgroundEmbers = useMemo(() => {
    const count = isMobile ? 4 : 8;
    return [...Array(count)].map((_, i) => ({
      key: `ember-${i}`,
      left: `${15 + Math.random() * 70}%`,
      duration: 6 + Math.random() * 4,
      delay: Math.random() * 5,
      driftX: `${(Math.random() - 0.5) * 100}px`,
    }));
  }, [isMobile]);

  const backgroundHeartbeats = useMemo(() => {
    const count = isMobile ? 2 : 3;
    return [...Array(count)].map((_, i) => ({
      key: `heartbeat-${i}`,
      left: `${20 + i * 30}%`,
      top: `${30 + (i % 2) * 40}%`,
      delay: `${i * 2}s`,
    }));
  }, [isMobile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [messages]);

  const stopCurrentAudio = () => {
    console.log('[Audio] 🛑 STOPPING AUDIO - hasCurrentAudio:', !!currentAudioRef.current, 'isSpeaking:', isSpeakingRef.current);

    isSpeakingRef.current = false;
    setIsSpeaking(false);

    if (currentAudioRef.current) {
      console.log('[Audio] Pausing HTML5 audio');
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      } catch (e) {
        console.error('[Audio] Error stopping audio:', e);
        currentAudioRef.current = null;
      }
    }

    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      console.log('[Audio] Canceling speech synthesis');
      window.speechSynthesis.cancel();
    }

    setResponseAudioLevel(0);
    setIsVoiceProcessing(false);
    setIsGenerating(false);
    stopSpeechVisualization();
    console.log('[Audio] ✅ Audio stopped successfully');
  };

  const handleVoiceTranscript = async (transcript: string) => {
    console.log('[Voice] ===== TRANSCRIPT RECEIVED =====');
    console.log('[Voice] Length:', transcript.length);
    console.log('[Voice] Text:', transcript.substring(0, 100));
    console.log('[Voice] Current isGenerating:', isGenerating);
    console.log('[Voice] Calling processMessage...');

    stopCurrentAudio();

    if (isGenerating) {
      console.log('[Voice] ❌ BLOCKED - already generating');
      return;
    }

    console.log('[Voice] Setting isVoiceProcessing to TRUE');
    setIsVoiceProcessing(true);
    console.log('[Voice] isVoiceProcessing should now be true');

    try {
      await processMessage(transcript, true);
      console.log('[Voice] ✓ processMessage completed');
    } catch (error) {
      console.error('[Voice] ✗ Error in processMessage:', error);
      setIsVoiceProcessing(false);
      setIsSpeaking(false);
      setTimeout(() => setIsVoiceMode(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    await processMessage(input, false);
  };

  const processMessage = async (messageText: string, isFromVoice: boolean = false) => {
    if (!messageText.trim() || isGenerating) {
      console.error('[ProcessMessage] ❌ BLOCKED', {
        emptyMessage: !messageText.trim(),
        isGenerating,
        messageText: messageText.substring(0, 50)
      });
      return;
    }

    console.log('[ProcessMessage] ✅ STARTING', {
      isFromVoice,
      isVoiceMode,
      isVoiceProcessing,
      messageLength: messageText.length,
      messagePreview: messageText.substring(0, 100)
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      thinking: true
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsGenerating(true);

    let fullResponse = '';
    let wasStreamed = false;

    let retryCount = 0;
    const maxRetries = 1;

    const fetchResponse = async (): Promise<any> => {
      const startTime = Date.now();
      try {
        console.log('[API] Request started', {
          attempt: retryCount + 1,
          transcriptLength: userMessage.content.length,
          timestamp: new Date().toISOString()
        });

        console.log('[API] ⚡ STREAMING GROQ API via Supabase Edge Function');

        const conversationHistory = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })).filter(msg => msg.content.trim());

        conversationHistory.push({ role: 'user', content: userMessage.content });

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: conversationHistory
          })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        const contentType = response.headers.get('Content-Type') || '';

        if (contentType.includes('application/json')) {
          const jsonData = await response.json();
          console.log('[API] 📍 Navigation response received');
          return jsonData;
        }

        wasStreamed = true;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamedContent = '';

        console.log('[API] 📤 Starting stream...');

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('[API] ✅ Stream complete');
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6);
              if (jsonStr === '[DONE]') continue;

              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;

                if (content) {
                  streamedContent += content;

                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'assistant') {
                      lastMessage.content = streamedContent;
                      lastMessage.thinking = false;
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                console.warn('[API] Failed to parse chunk:', e);
              }
            }
          }
        }

        const data = { content: streamedContent };
        const error = null;

        const duration = Date.now() - startTime;

        if (error) {
          console.error('[API] Error response:', {
            error,
            message: error.message,
            code: error.code,
            status: error.status,
            details: error.details,
            durationMs: duration
          });
          throw error;
        }

        if (!data) {
          console.error('[API] Null data received', {
            durationMs: duration,
            responseType: typeof data
          });
          throw new Error('Null response from API');
        }

        if (!data.content || data.content.trim().length === 0) {
          console.error('[API] Empty content received', {
            dataKeys: Object.keys(data || {}),
            contentType: typeof data.content,
            contentValue: data.content,
            durationMs: duration
          });
          throw new Error('Empty content in API response');
        }

        console.log('[API] Success', {
          responseLength: data.content.length,
          durationMs: duration,
          hasNavigation: !!data.navigationData,
          responsePreview: data.content.substring(0, 100)
        });

        return data;
      } catch (error: any) {
        const duration = Date.now() - startTime;
        const isTimeout = error.message?.includes('timeout');
        const isNetwork = error.message?.includes('network') || error.message?.includes('fetch');

        console.error('[API] Request failed', {
          errorMessage: error.message || String(error),
          errorType: error.name,
          isTimeout,
          isNetwork,
          attempt: retryCount + 1,
          maxRetries,
          durationMs: duration,
          timestamp: new Date().toISOString()
        });

        if (retryCount < maxRetries) {
          retryCount++;
          console.log('[API] Retrying...', {
            retryNumber: retryCount,
            delayMs: 1000
          });

          setErrorNotification('Groq failed, retrying...');
          setTimeout(() => setErrorNotification(null), 2000);

          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchResponse();
        }

        console.error('[API] All retries exhausted', {
          totalAttempts: retryCount + 1,
          totalDurationMs: duration
        });

        setErrorNotification('Groq failed after retries');
        setTimeout(() => setErrorNotification(null), 4000);

        throw error;
      }
    };

    try {
      const data = await fetchResponse();
      fullResponse = data?.content || 'Sorry, I could not retrieve information for that query.';
      const navigationData = data?.navigationData || null;

      console.log('[Navigation Debug] Full response data:', data);
      console.log('[Navigation Debug] Navigation data:', navigationData);

      if (navigationData && navigationData.from === 'Current Location') {
        console.log('[App] Navigation requires GPS, requesting permission...');
        if (navigator.geolocation) {
          try {
            await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
              });
            });
            console.log('[App] GPS permission granted');
          } catch (error) {
            console.warn('[App] GPS permission denied:', error);
            if (isMountedRef.current) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessage.id
                    ? {
                        ...msg,
                        thinking: false,
                        content: '📍 I need access to your location to provide navigation from your current position. Please enable location services in your browser and try again.'
                      }
                    : msg
                )
              );
              setIsGenerating(false);
            }
            return;
          }
        }
      }

      if (isMountedRef.current) {
        if (isFromVoice && fullResponse) {
          console.log('[Voice] Starting TTS immediately (parallel with text stream)');
          handleTTSPlayback(fullResponse);
        }

        if (wasStreamed) {
          setIsGenerating(false);
          if (isFromVoice) {
            setIsVoiceProcessing(false);
          }

          if (navigationData) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, navigationData }
                  : msg
              )
            );
          }
        } else {
          let currentIndex = 0;
          const streamText = () => {
            if (currentIndex < fullResponse.length && isMountedRef.current) {
              const chunkSize = Math.floor(Math.random() * 3) + 2;
              currentIndex += chunkSize;

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessage.id
                    ? { ...msg, thinking: false, content: fullResponse.slice(0, currentIndex), navigationData }
                    : msg
                )
              );

              const delay = Math.floor(Math.random() * 10) + 12;
              setTimeout(streamText, delay);
            } else if (isMountedRef.current) {
              setIsGenerating(false);

              if (isFromVoice) {
                setIsVoiceProcessing(false);
              }

            console.log('[Stream] \ud83c\udfc1 TEXT STREAMING COMPLETE', {
              isFromVoice,
              hasResponse: !!fullResponse,
              responseLength: fullResponse.length,
              timestamp: new Date().toISOString()
            });
          }
        };

          streamText();
        }
      }
    } catch (error: any) {
      console.error('Error calling chat function:', error);

      const errorMsg = error.message?.includes('timeout')
        ? 'Request timed out - try again'
        : error.message?.includes('network')
        ? 'Network error - check connection'
        : 'AI service error - please retry';

      setErrorNotification(errorMsg);
      setTimeout(() => setErrorNotification(null), 4000);

      if (isMountedRef.current) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  thinking: false,
                  content: 'Sorry, there was an error processing your request. Please try again.'
                }
              : msg
          )
        );
        setIsGenerating(false);

        if (isFromVoice) {
          setIsVoiceProcessing(false);
          setIsSpeaking(false);
          setTimeout(() => setIsVoiceMode(false), 2000);
        }
      }
    }

  };

  const stripMarkdown = (text: string): string => {
    return text
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      .replace(/~~(.+?)~~/g, '$1')
      .replace(/`{1,3}(.+?)`{1,3}/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/!\[.*?\]\(.+?\)/g, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/^\s*>\s+/gm, '')
      .replace(/---+/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const handleTTSPlayback = async (responseText: string) => {
    console.log('[TTS] \ud83c\udfaf HANDLETTTSPLAYBACK CALLED', {
      responseLength: responseText.length,
      responsePreview: responseText.substring(0, 100),
      timestamp: new Date().toISOString()
    });

    try {
      console.log('[TTS] Calling speakResponse()...');
      const cleanText = stripMarkdown(responseText);
      console.log('[TTS] Markdown stripped', {
        originalLength: responseText.length,
        cleanedLength: cleanText.length,
        cleanedPreview: cleanText.substring(0, 100)
      });
      await speakResponse(cleanText);
      console.log('[TTS] \u2705 PLAYBACK COMPLETED SUCCESSFULLY');
    } catch (ttsError: any) {
      console.error('[TTS] \u274c PLAYBACK FAILED:', ttsError);
      setErrorNotification('Voice playback failed - see text');
      setTimeout(() => setErrorNotification(null), 4000);
      setIsVoiceProcessing(false);
      setIsSpeaking(false);
      setTimeout(() => setIsVoiceMode(false), 2000);
    }
  };

  const speakResponse = async (text: string) => {
    try {
      console.log('[TTS] Initialization', {
        textLength: text?.length,
        isSpeaking: isSpeakingRef.current,
        hasCurrentAudio: !!currentAudioRef.current,
        timestamp: new Date().toISOString()
      });

      if (isSpeakingRef.current && currentAudioRef.current) {
        console.log('[TTS] ⚠️ BLOCKED: Already speaking with active audio, ignoring duplicate request');
        return;
      }

      if (currentAudioRef.current) {
        console.log('[TTS] ⚠️ BLOCKED: Audio already exists, stopping it first');
        try {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
          currentAudioRef.current = null;
        } catch (e) {
          console.error('[TTS] Error clearing existing audio:', e);
        }
      }

      console.log('[TTS] ✅ Starting TTS - setting flags');
      isSpeakingRef.current = true;
      setIsSpeaking(true);

      if (!text || text.trim().length === 0) {
        console.error('[TTS] No text provided');
        setIsSpeaking(false);
        setErrorNotification('No text to speak');
        setTimeout(() => setErrorNotification(null), 3000);
        throw new Error('No text to speak');
      }

      console.log('[TTS] Calling Murf TTS API with timeout...');
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        console.log('[TTS] API response status:', response.status, response.headers.get('content-type'));

        if (!response.ok) {
          console.error('[TTS] API error, status:', response.status);
          throw new Error(`Murf API failed: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
          const jsonData = await response.json();

          if (jsonData.error === 'use_browser_tts') {
            console.log('[TTS] Murf unavailable, error:', jsonData.message);
            throw new Error('Murf unavailable');
          }

          if (jsonData.success && jsonData.audioUrl) {
            console.log('[TTS] ✅ Received audio URL, streaming directly from Murf...');
            const audio = new Audio();
            audio.preload = isMobile ? 'metadata' : 'auto';
            audio.crossOrigin = 'anonymous';
            audio.volume = 1.0;
            audio.playbackRate = 1.0;
            if (isMobile) {
              audio.setAttribute('playsinline', 'true');
              audio.setAttribute('webkit-playsinline', 'true');
            }
            currentAudioRef.current = audio;

            audio.onended = () => {
              console.log('[TTS] ✅ Murf playback complete - ready for next question');
              if (currentAudioRef.current === audio) {
                currentAudioRef.current = null;
              }
              isSpeakingRef.current = false;
              setIsSpeaking(false);
              setResponseAudioLevel(0);
              setIsVoiceProcessing(false);
              setIsGenerating(false);
              stopSpeechVisualization();
              console.log('[TTS] State reset complete', {
                isSpeaking: false,
                isVoiceProcessing: false,
                isGenerating: false,
                timestamp: new Date().toISOString()
              });
            };

            audio.onerror = (e) => {
              console.error('[TTS] Audio playback error:', e);
              if (currentAudioRef.current === audio) {
                currentAudioRef.current = null;
              }
              isSpeakingRef.current = false;
              setIsSpeaking(false);
              setResponseAudioLevel(0);
              setIsVoiceProcessing(false);
              setIsGenerating(false);
              stopSpeechVisualization();
            };

            return new Promise<void>((resolve) => {
              let hasStarted = false;
              const bufferTimeout = isMobile ? 2500 : 1500;
              const timeoutId = setTimeout(() => {
                if (!hasStarted) {
                  console.log('[TTS] ⚠️ Buffering timeout, starting playback anyway');
                  hasStarted = true;
                  isSpeakingRef.current = true;
                  audio.play().then(() => {
                    startSpeechVisualization();
                    resolve();
                  }).catch((err) => {
                    console.error('[TTS] Timeout play error:', err);
                    resolve();
                  });
                }
              }, bufferTimeout);

              audio.oncanplay = async () => {
                if (!hasStarted) {
                  clearTimeout(timeoutId);
                  hasStarted = true;
                  console.log('[TTS] ✅ Audio ready to play (fast path)');
                  try {
                    isSpeakingRef.current = true;
                    if (isMobile) {
                      await new Promise(r => setTimeout(r, 100));
                    }
                    await audio.play();
                    startSpeechVisualization();
                    resolve();
                  } catch (playError) {
                    console.error('[TTS] Play error:', playError);
                    resolve();
                  }
                }
              };

              audio.src = jsonData.audioUrl;
              audio.load();
            });
          }

          console.log('[TTS] JSON response (unexpected format):', jsonData);
          throw new Error('Unexpected JSON response');
        }

        console.error('[TTS] Unexpected content type:', contentType);
        throw new Error('Unexpected response type');

      } catch (apiError: any) {
        console.error('[TTS] ❌ Murf failed, cannot play audio:', apiError);
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        setResponseAudioLevel(0);
        setIsVoiceProcessing(false);
        setIsGenerating(false);
        setErrorNotification('Voice unavailable - see text response');
        setTimeout(() => setErrorNotification(null), 3000);
        return;
      }

    } catch (error: any) {
      console.error('[TTS] Fatal error:', error);
      setIsSpeaking(false);
      setErrorNotification('Voice playback failed');
      setTimeout(() => setErrorNotification(null), 3000);
    }
  };


  const startSpeechVisualization = () => {
    let pulseDirection = 1;
    let currentLevel = 0;
    let lastTimestamp = performance.now();
    isSpeakingRef.current = true;

    const animate = (timestamp: number) => {
      if (!isSpeakingRef.current) return;

      const deltaTime = (timestamp - lastTimestamp) / 16.67;
      lastTimestamp = timestamp;

      currentLevel += 0.025 * pulseDirection * deltaTime;
      if (currentLevel >= 0.85) {
        pulseDirection = -1;
        currentLevel = 0.85;
      }
      if (currentLevel <= 0.35) {
        pulseDirection = 1;
        currentLevel = 0.35;
      }

      setResponseAudioLevel(Math.round(currentLevel * 100));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const stopSpeechVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handlePhotoCapture = async (photoDataUrl: string) => {
    console.log('[Camera] Photo captured, analyzing with Kindwise Plant.id API...');
    setIsCameraOpen(false);

    const photoMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Identifying this plant...`,
      timestamp: new Date(),
      imageData: photoDataUrl
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      thinking: true
    };

    setMessages((prev) => [...prev, photoMessage, assistantMessage]);
    setIsGenerating(true);

    try {
      const base64Image = photoDataUrl.split(',')[1];

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/identify-plant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: data.content, thinking: false }
            : msg
        )
      );
    } catch (error: any) {
      console.error('[Camera] Plant identification failed:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: "I couldn't identify this plant automatically. Can you describe what you see? Tell me about the leaves, flowers, berries, or any distinctive features, and I'll help identify if it's safe to eat.",
                thinking: false
              }
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen max-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated gradient overlay - primary movement */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-cyan-500/8 to-emerald-500/8 animate-gradient-xy"></div>

      {/* Secondary animated gradient - opposite direction */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/6 via-emerald-500/6 to-cyan-500/6 animate-gradient-xy" style={{ animationDelay: '4s' }}></div>

      {/* Radial gradient from top */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent"></div>

      {/* Large floating orbs - main movement */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/25 to-emerald-600/10 rounded-full filter blur-[140px] animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-10 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/25 to-cyan-600/10 rounded-full filter blur-[140px] animate-float-reverse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-[550px] h-[550px] bg-gradient-to-br from-emerald-400/22 to-cyan-400/12 rounded-full filter blur-[130px] animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-40 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/22 to-emerald-400/12 rounded-full filter blur-[120px] animate-float-reverse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Medium accent orbs - additional depth */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-emerald-400/18 rounded-full filter blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-[300px] h-[300px] bg-cyan-400/18 rounded-full filter blur-[90px] animate-pulse-slow" style={{ animationDelay: '3.5s' }}></div>
        <div className="absolute top-1/2 left-2/3 w-[280px] h-[280px] bg-gradient-to-br from-emerald-300/15 to-cyan-300/15 rounded-full filter blur-[80px] animate-float" style={{ animationDelay: '5s' }}></div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/50"></div>

      {/* Firefly sparks - hope and guidance */}
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

      {/* Rising ember particles - warmth and hope */}
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
            } as any}
          />
        ))}
      </div>

      {/* Heartbeat pulses - connection and reassurance */}
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
            }}
          />
        ))}
      </div>

      {errorNotification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-top duration-300">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{errorNotification}</span>
        </div>
      )}

      <main className={`relative z-10 flex-1 overflow-y-auto min-h-0 ${messages.length === 0 ? 'flex flex-col' : ''}`}>
        <div className="w-full h-full">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col px-4 sm:px-4 py-3 sm:py-6 max-w-2xl mx-auto overflow-y-auto pt-safe">
              <div className="flex flex-col min-h-0 pt-6 sm:pt-4">
                <div className="text-center mb-2 sm:mb-8">
                  <div className="flex justify-center mb-1 sm:mb-4">
                    <img
                      src="/SproutChatLogo-ezgif.com-gif-maker.svg"
                      alt="SproutChat Logo"
                      className="w-20 h-20 sm:w-36 sm:h-36 md:w-44 md:h-44 animate-float drop-shadow-2xl"
                      style={{ filter: 'drop-shadow(0 0 20px rgba(52, 211, 153, 0.5))' }}
                    />
                  </div>
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-3 leading-tight">
                    <span className="text-emerald-400">Sprout</span><span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Chat</span>
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-base md:text-lg mb-2 sm:mb-6 leading-snug px-2">
                    Your offline AI companion for emergencies and survival
                  </p>
                </div>

                <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-4">
                  <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-3 sm:p-4 shadow-xl border border-slate-700/50">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Waves className="w-5 h-5 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-white mb-0">Natural Disasters</h3>
                        <p className="text-xs sm:text-sm text-slate-400 leading-tight">Earthquakes, floods, hurricanes</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-3 sm:p-4 shadow-xl border border-slate-700/50">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Mountain className="w-5 h-5 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-white mb-0">Wilderness Survival</h3>
                        <p className="text-xs sm:text-sm text-slate-400 leading-tight">Shelter, fire, water, first aid</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-3 sm:p-4 shadow-xl border border-slate-700/50">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <AlertTriangle className="w-5 h-5 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-white mb-0">Emergency Prep</h3>
                        <p className="text-xs sm:text-sm text-slate-400 leading-tight">Planning, supplies, protocols</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 sm:px-4 pt-16 sm:pt-4 pb-3 relative">
              <button
                onClick={() => {
                  setMessages([]);
                  setInput('');
                }}
                className="fixed top-16 left-4 sm:top-6 sm:left-6 z-20 w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-full shadow-lg hover:shadow-emerald-500/50 transition-all duration-200 active:scale-95 flex items-center justify-center"
                title="New conversation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
              </button>
              <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 sm:px-4 sm:py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg'
                          : 'bg-slate-800/80 backdrop-blur-xl text-slate-100 shadow-lg border border-slate-700/50'
                      }`}
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        fontSize: '15px',
                        lineHeight: '1.6'
                      }}
                    >
                      {message.thinking ? (
                        <div className="flex items-center gap-2.5 text-emerald-400">
                          <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-bounce shadow-[0_0_12px_rgba(16,185,129,0.6)]" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2.5 h-2.5 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full animate-bounce shadow-[0_0_12px_rgba(6,182,212,0.6)]" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-bounce shadow-[0_0_12px_rgba(16,185,129,0.6)]" style={{ animationDelay: '300ms' }}></span>
                          </div>
                          <span className="text-sm font-semibold">Processing...</span>
                        </div>
                      ) : (
                        <>
                          {message.imageData && (
                            <div className="mb-3">
                              <img
                                src={message.imageData}
                                alt="Plant photo"
                                className="rounded-xl w-full max-w-[200px] shadow-lg border border-white/20"
                              />
                            </div>
                          )}
                          <div
                            className="chatgpt-response"
                            dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                          />
                          {message.navigationData && (
                            <>
                              <div className="mt-3">
                                <NavigationMap
                                  from={message.navigationData.from}
                                  to={message.navigationData.to}
                                  mode={message.navigationData.mode}
                                  isModal={false}
                                />
                              </div>
                              <div className="mt-2">
                                <button
                                  onClick={() => {
                                    setActiveNavigation(message.navigationData!);
                                    setMapModalOpen(true);
                                  }}
                                  className="group w-full bg-slate-700/60 backdrop-blur-xl text-slate-200 font-semibold py-2.5 px-4 rounded-xl shadow-lg hover:bg-slate-700/80 hover:text-white transition-all duration-200 flex items-center justify-center gap-2 border border-slate-600/40 hover:border-slate-500/60 text-sm"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform flex-shrink-0">
                                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                                  </svg>
                                  <span>Expand to Fullscreen</span>
                                </button>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 shadow-[0_-8px_30px_rgba(0,0,0,0.3)] shrink-0 py-6 sm:py-3">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-4">
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-3xl p-2.5 sm:p-3 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-2 mb-2.5">
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="flex-1 h-10 sm:h-10 flex items-center justify-center bg-slate-700/60 text-emerald-400 rounded-xl active:scale-95 transition-all duration-150 border border-slate-600/40"
                title="Identify plants"
              >
                <Camera size={19} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => setIsVoiceMode(true)}
                className="flex-1 h-10 sm:h-10 flex items-center justify-center bg-slate-700/60 text-emerald-400 rounded-xl active:scale-95 transition-all duration-150 border border-slate-600/40"
              >
                <Heart size={19} strokeWidth={2.5} fill="currentColor" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message SproutChat..."
                disabled={isGenerating}
                className="flex-1 min-w-0 px-4 py-3 sm:py-3 rounded-full bg-slate-700/60 border border-slate-600/40 text-white text-base placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-50 transition-all duration-200"
              />
              <button
                type="submit"
                disabled={!input.trim() || isGenerating}
                className="w-11 h-11 sm:w-11 sm:h-11 flex-shrink-0 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-200 flex items-center justify-center shadow-lg"
              >
                <Send size={19} strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </div>
      </footer>

      {isSituationalGuideOpen && (
        <SituationalGuide
          onClose={() => setIsSituationalGuideOpen(false)}
          onSendMessage={(message) => {
            const assistantMessage: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              content: message,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
          }}
        />
      )}

      {isPackingListOpen && (
        <PackingList onClose={() => setIsPackingListOpen(false)} />
      )}

      {isCameraOpen && (
        <CameraCapture
          onClose={() => setIsCameraOpen(false)}
          onCapture={handlePhotoCapture}
        />
      )}

      {isVoiceMode && (
        <VoiceMode
          onClose={() => {
            if (currentAudioRef.current) {
              currentAudioRef.current.pause();
              currentAudioRef.current.src = '';
              currentAudioRef.current = null;
            }
            isSpeakingRef.current = false;
            window.speechSynthesis.cancel();
            stopSpeechVisualization();
            setIsVoiceMode(false);
            setIsVoiceProcessing(false);
            setIsSpeaking(false);
          }}
          onTranscript={handleVoiceTranscript}
          isProcessing={isVoiceProcessing}
          isSpeaking={isSpeaking}
          responseAudioLevel={responseAudioLevel}
          onInterrupt={stopCurrentAudio}
          onStopListening={() => {
            console.log('[App] Stop listening triggered');
          }}
        />
      )}

      {/* Navigation Map Modal */}
      {mapModalOpen && activeNavigation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full h-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col border border-slate-800/50 animate-in slide-in-from-bottom-4 duration-300">
            <NavigationMap
              from={activeNavigation.from}
              to={activeNavigation.to}
              mode={activeNavigation.mode}
              onClose={() => setMapModalOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
