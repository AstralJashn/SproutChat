import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

interface CameraCaptureProps {
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export function CameraCapture({ onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Could not access camera. Please check permissions.');
        onClose();
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        onCapture(imageData);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex justify-between items-center p-4 bg-black/50">
        <h2 className="text-white text-xl font-bold">Take Photo</h2>
        <button
          onClick={() => {
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
            onClose();
          }}
          className="text-white hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6 bg-black/50 flex justify-center">
        <button
          onClick={handleCapture}
          className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 hover:border-emerald-400 transition-colors flex items-center justify-center"
        >
          <Camera className="w-8 h-8 text-gray-800" />
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
