import { useEffect } from "react";

export const useBGM = (src: string | null, volume = 0.5) => {
  useEffect(() => {
    if (!src) return;

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [src]);
};
