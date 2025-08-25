
import { useRef, useCallback, useEffect } from 'react';

export const useAudioAnalyzer = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const frequencyDataRef = useRef<Uint8Array | null>(null);

  const setupAudioContext = useCallback((audioElement: HTMLAudioElement) => {
    if (!audioContextRef.current) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;

      if (!sourceRef.current) {
        sourceRef.current = context.createMediaElementSource(audioElement);
      }
      
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      frequencyDataRef.current = dataArray;

      sourceRef.current.connect(analyser);
      analyser.connect(context.destination);
    }
  }, []);

  const getFrequencyData = useCallback(() => {
    if (analyserRef.current && frequencyDataRef.current) {
      analyserRef.current.getByteFrequencyData(frequencyDataRef.current);
      return frequencyDataRef.current;
    }
    return null;
  }, []);
  
  const getBassLevel = useCallback(() => {
    const data = getFrequencyData();
    if (!data) return 0;
    // Bass frequencies are typically in the lower bins
    const bassBins = data.slice(0, Math.floor(data.length * 0.2));
    const average = bassBins.reduce((sum, value) => sum + value, 0) / bassBins.length;
    return average / 255; // Normalize to 0-1 range
  }, [getFrequencyData]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { setupAudioContext, getBassLevel };
};
