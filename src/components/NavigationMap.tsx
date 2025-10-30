import { useEffect, useRef, useState } from 'react';

interface NavigationMapProps {
  from: string;
  to: string;
  mode: 'driving' | 'walking' | 'bicycling' | 'transit';
  isModal?: boolean;
}

export function NavigationMap({ from, to, mode, isModal = false }: NavigationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapUrl, setMapUrl] = useState<string>('');

  useEffect(() => {
    const generateMapUrl = () => {
      const baseUrl = 'https://www.google.com/maps/embed/v1/directions';
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8';

      const params = new URLSearchParams({
        key: apiKey,
        origin: from,
        destination: to,
        mode: mode
      });

      return `${baseUrl}?${params.toString()}`;
    };

    setMapUrl(generateMapUrl());
  }, [from, to, mode]);

  const heightClass = isModal ? 'h-[70vh]' : 'h-64';

  return (
    <div className={`w-full ${heightClass} rounded-lg overflow-hidden border border-gray-700`}>
      {mapUrl ? (
        <iframe
          ref={mapRef}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <p className="text-gray-400">Loading map...</p>
        </div>
      )}
    </div>
  );
}
